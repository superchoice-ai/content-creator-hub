import { createFileRoute } from "@tanstack/react-router";
import { adminError, requireAdmin } from "@/lib/admin-auth.server";

export const Route = createFileRoute("/api/admin/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const session = await requireAdmin(request);
          return Response.json({ ok: true, user: { id: session.user.id, email: session.user.email }, role: session.role });
        } catch (error) {
          return adminError(error);
        }
      },
    },
  },
});
