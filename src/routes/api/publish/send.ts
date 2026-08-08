import { createFileRoute } from "@tanstack/react-router";

const ALLOWED = [
  "youtube",
  "facebook_page",
  "facebook_group",
  "instagram",
  "threads",
  "x",
  "line_oa",
  "linkedin",
  "tiktok",
];
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
function authorized(request: Request) {
  const expected = process.env["PORTAL_PUBLISH_TOKEN"];
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  return !!expected && provided === expected;
}

export const Route = createFileRoute("/api/publish/send")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const {
            source,
            payload,
            selectedChannels,
            scheduleAt = null,
            approved = false,
            dry_run = true,
            generation_gate = {},
          } = body;
          if (
            !source ||
            !payload ||
            !Array.isArray(selectedChannels) ||
            selectedChannels.length === 0
          )
            return json(
              { error: "source, payload and selectedChannels are required" },
              400,
            );
          if (
            selectedChannels.some(
              (channel: string) =>
                !ALLOWED.includes(channel) || !payload.channels?.[channel],
            )
          )
            return json(
              { error: "selected channel is unsupported or missing its draft" },
              400,
            );
          if (scheduleAt && Number.isNaN(Date.parse(scheduleAt)))
            return json({ error: "scheduleAt must be a valid date" }, 400);
          if (
            source.type === "heygen" &&
            generation_gate.output_type !== "video"
          )
            return json({ error: "HeyGen requires output_type=video" }, 400);
          const jobId = `cmt-${crypto.randomUUID()}`;
          if (dry_run)
            return json({
              ok: true,
              jobId,
              dry_run: true,
              approved: false,
              validated: true,
              selectedChannels,
              scheduleAt,
              heygenGeneration: false,
              publishing: false,
            });
          if (!approved)
            return json(
              { error: "approved=true is required for live publishing" },
              409,
            );
          if (!authorized(request)) return json({ error: "unauthorized" }, 401);
          if (
            source.type === "heygen" &&
            (!generation_gate.approved || generation_gate.dry_run !== false)
          )
            return json(
              {
                error:
                  "HeyGen Generation Gate requires approved=true, dry_run=false and output_type=video",
              },
              409,
            );
          const n8nUrl =
            process.env["N8N_CMT01_WEBHOOK_URL"] ??
            process.env["N8N_WEBHOOK_URL"];
          if (!n8nUrl)
            return json(
              { error: "N8N_CMT01_WEBHOOK_URL is not configured" },
              503,
            );
          const secret = process.env["N8N_WEBHOOK_SECRET"];
          const upstream = await fetch(n8nUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(secret ? { "X-Webhook-Secret": secret } : {}),
            },
            body: JSON.stringify({
              jobId,
              source,
              payload,
              channelsSelected: selectedChannels,
              scheduleAt,
              approved: true,
              dry_run: false,
              generation_gate,
            }),
          });
          const text = await upstream.text();
          if (!upstream.ok)
            return json(
              {
                error: "CMT-01 rejected the job",
                upstreamStatus: upstream.status,
                details: text.slice(0, 500),
              },
              502,
            );
          let result: unknown = text;
          try {
            result = text ? JSON.parse(text) : null;
          } catch {
            /* retain text */
          }
          return json(
            { ok: true, jobId, dry_run: false, forwarded: true, result },
            202,
          );
        } catch (error) {
          return json(
            { error: error instanceof Error ? error.message : String(error) },
            500,
          );
        }
      },
    },
  },
});
