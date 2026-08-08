import { createFileRoute } from "@tanstack/react-router";

const MAX_BYTES = 50 * 1024 * 1024;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function authorized(request: Request) {
  const expected = process.env["PORTAL_PUBLISH_TOKEN"];
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  return !!expected && provided === expected;
}

export const Route = createFileRoute("/api/publish/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          if (!authorized(request)) return json({ error: "unauthorized" }, 401);

          const form = await request.formData();
          const file = form.get("file");
          const approved = form.get("approved") === "true";
          const dryRun = form.get("dry_run") !== "false";

          if (!(file instanceof File)) return json({ error: "video file is required" }, 400);
          if (!file.type.startsWith("video/")) return json({ error: "only video files are accepted" }, 415);
          if (file.size > MAX_BYTES) return json({ error: "file exceeds 50 MB; use Google Drive URL/File ID" }, 413);
          if (!approved || dryRun) return json({ error: "local upload requires approved=true and dry_run=false" }, 409);

          const n8nUrl = process.env["N8N_YOUTUBE_UPLOAD_WEBHOOK_URL"];
          const n8nSecret = process.env["N8N_WEBHOOK_SECRET"];
          if (!n8nUrl) return json({ error: "N8N_YOUTUBE_UPLOAD_WEBHOOK_URL is not configured" }, 503);

          const uploadId = `upload-${crypto.randomUUID()}`;
          const outgoing = new FormData();
          outgoing.set("file", file, file.name);
          outgoing.set("uploadId", uploadId);
          outgoing.set("approved", "true");
          outgoing.set("dry_run", "false");

          const upstream = await fetch(n8nUrl, {
            method: "POST",
            headers: n8nSecret ? { "X-Webhook-Secret": n8nSecret } : undefined,
            body: outgoing,
          });
          const text = await upstream.text();
          if (!upstream.ok) return json({ error: "n8n rejected local upload", upstreamStatus: upstream.status, details: text.slice(0, 500) }, 502);

          let result: Record<string, unknown> = {};
          try { result = text ? JSON.parse(text) : {}; } catch { result = { response: text }; }
          return json({ ok: true, uploadId, filename: file.name, ...result }, 201);
        } catch (error) {
          return json({ error: error instanceof Error ? error.message : String(error) }, 500);
        }
      },
    },
  },
});
