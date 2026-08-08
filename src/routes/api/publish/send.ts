import { createFileRoute } from "@tanstack/react-router";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function authorized(request: Request) {
  const expected = process.env["PORTAL_PUBLISH_TOKEN"];
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  return !!expected && provided === expected;
}

export const Route = createFileRoute("/api/publish/send")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { source, payload, selectedChannels, approved = false, dry_run = true } = body;

          if (!source || !payload || !Array.isArray(selectedChannels) || selectedChannels.length !== 1 || selectedChannels[0] !== "youtube") {
            return json({ error: "Only one YouTube publishing job is allowed per request" }, 400);
          }
          if (!payload.channels?.youtube?.title?.trim()) {
            return json({ error: "YouTube title is required" }, 400);
          }

          const jobId = `yt-${crypto.randomUUID()}`;
          if (dry_run) {
            return json({ ok: true, jobId, dry_run: true, approved: false, validated: true, source });
          }

          if (!approved) return json({ error: "approved=true is required for live publishing" }, 409);
          if (!authorized(request)) return json({ error: "unauthorized" }, 401);

          const n8nUrl = process.env["N8N_YOUTUBE_WEBHOOK_URL"] ?? process.env["N8N_WEBHOOK_URL"];
          const n8nSecret = process.env["N8N_WEBHOOK_SECRET"];
          if (!n8nUrl) return json({ error: "N8N_YOUTUBE_WEBHOOK_URL is not configured" }, 503);

          const upstream = await fetch(n8nUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(n8nSecret ? { "X-Webhook-Secret": n8nSecret } : {}),
            },
            body: JSON.stringify({
              jobId,
              source,
              payload,
              channelsSelected: ["youtube"],
              approved: true,
              dry_run: false,
              output_type: "video",
            }),
          });

          const text = await upstream.text();
          if (!upstream.ok) return json({ error: "n8n rejected the publish job", upstreamStatus: upstream.status, details: text.slice(0, 500) }, 502);

          let result: unknown = text;
          try { result = text ? JSON.parse(text) : null; } catch { /* retain text */ }
          return json({ ok: true, jobId, dry_run: false, forwarded: true, result }, 202);
        } catch (error) {
          return json({ error: error instanceof Error ? error.message : String(error) }, 500);
        }
      },
    },
  },
});
