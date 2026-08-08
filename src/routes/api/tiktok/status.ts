import { createFileRoute } from "@tanstack/react-router";
import { adminError, requireAdmin } from "@/lib/admin-auth.server";

export const Route = createFileRoute("/api/tiktok/status")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          await requireAdmin(request);
          const token = process.env["TIKTOK_ACCESS_TOKEN"];
          if (!token) return Response.json({ error: "TIKTOK_ACCESS_TOKEN is not configured" }, { status: 503 });
          const { publishId } = await request.json();
          if (!publishId || typeof publishId !== "string") return Response.json({ error: "publishId is required" }, { status: 400 });
          const response = await fetch("https://open.tiktokapis.com/v2/post/publish/status/fetch/", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({ publish_id: publishId }),
          });
          const data = await response.json();
          return Response.json(data, { status: response.status });
        } catch (error) {
          return adminError(error);
        }
      },
    },
  },
});
