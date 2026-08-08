import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/line/start")({
  server: {
    handlers: {
      GET: async () => {
        const bridge = process.env["LINE_AUTH_BRIDGE_URL"];
        if (!bridge) return Response.json({ error: "LINE_AUTH_BRIDGE_URL is not configured" }, { status: 503 });
        return Response.redirect(bridge, 302);
      },
    },
  },
});
