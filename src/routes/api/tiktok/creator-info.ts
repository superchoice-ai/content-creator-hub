import { createFileRoute } from "@tanstack/react-router";
import { adminError, requireAdmin } from "@/lib/admin-auth.server";

export const Route = createFileRoute("/api/tiktok/creator-info")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdmin(request);
          const token = process.env["TIKTOK_ACCESS_TOKEN"];
          if (!token) return Response.json({ error: "TIKTOK_ACCESS_TOKEN is not configured" }, { status: 503 });
          const response = await fetch("https://open.tiktokapis.com/v2/post/publish/creator_info/query/", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8" },
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
