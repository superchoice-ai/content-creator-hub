import { createFileRoute } from "@tanstack/react-router";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/publish/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { sourceType, brief, channels, heygenOptions } = body;
          if (
            !sourceType ||
            !brief?.title?.trim() ||
            !Array.isArray(channels) ||
            channels.length === 0
          )
            return json(
              { error: "sourceType, brief.title and channels are required" },
              400,
            );
          const allowed = [
            "youtube",
            "facebook_page",
            "facebook_group",
            "instagram",
            "threads",
            "x",
            "line_oa",
            "linkedin",
          ];
          if (channels.some((channel: string) => !allowed.includes(channel)))
            return json({ error: "unsupported channel" }, 400);
          const n8nUrl = process.env["N8N_CONTENT_GENERATE_WEBHOOK_URL"];
          if (!n8nUrl)
            return json(
              { error: "N8N_CONTENT_GENERATE_WEBHOOK_URL is not configured" },
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
              sourceType,
              brief,
              channels,
              heygenOptions,
              ai_calls: 1,
              dry_run: true,
              approved: false,
            }),
          });
          const text = await upstream.text();
          if (!upstream.ok)
            return json(
              {
                error: "n8n rejected content generation",
                upstreamStatus: upstream.status,
                details: text.slice(0, 500),
              },
              502,
            );
          let result: unknown;
          try {
            result = JSON.parse(text);
          } catch {
            return json({ error: "n8n returned invalid JSON" }, 502);
          }
          return json(result);
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
