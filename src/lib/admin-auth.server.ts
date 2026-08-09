import type { User } from "@supabase/supabase-js";
import { readSession, verifySession } from "@/lib/portal-session.server";

export type AdminSession = { user: User; role: "admin" };

export async function requireAdmin(request: Request): Promise<AdminSession> {
  const token = request.headers.get("x-admin-access-token") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!token) {
    const line = await verifySession(readSession(request));
    if (line?.role === "admin") return { user: { id: line.sub } as User, role: "admin" };
    throw new Response(line ? "forbidden" : "unauthorized", { status: line ? 403 : 401 });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new Response("unauthorized", { status: 401 });

  const roles = supabaseAdmin as unknown as {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{ data: { role?: string } | null; error: { message: string } | null }>;
        };
      };
    };
  };
  const result = await roles.from("app_user_roles").select("role").eq("user_id", data.user.id).maybeSingle();
  if (result.error || result.data?.role !== "admin") {
    throw new Response("forbidden", { status: 403 });
  }
  return { user: data.user, role: "admin" };
}

export function adminError(error: unknown) {
  if (error instanceof Response) return error;
  console.error("admin route failed", error);
  return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
