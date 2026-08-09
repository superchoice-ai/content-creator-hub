import { createFileRoute } from "@tanstack/react-router";
import { signSession } from "@/lib/portal-session.server";

type LineVerifyResult = {
  sub?: string;
  name?: string;
  email?: string;
  picture?: string;
  error?: string;
  error_description?: string;
};

type LineProfile = {
  userId?: string;
  displayName?: string;
  pictureUrl?: string;
  message?: string;
};

function lineError(result: LineVerifyResult) {
  const code = result.error?.trim() || "token_verification_failed";
  const description = result.error_description?.trim();
  return description ? `${code}: ${description}` : code;
}

export const Route = createFileRoute("/api/auth/line/liff")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { idToken, accessToken } = (await request.json()) as {
            idToken?: string;
            accessToken?: string;
          };
          const clientId = (
            process.env["LINE_LIFF_CHANNEL_ID"] ??
            process.env["LINE_LOGIN_CHANNEL_ID"] ??
            ""
          ).trim();

          if (!clientId) {
            console.error("[LINE auth] Missing LINE_LIFF_CHANNEL_ID");
            return Response.json(
              { error: "LINE Login is not configured", code: "line_channel_id_missing" },
              { status: 503 },
            );
          }
          if (!/^\d+$/.test(clientId)) {
            console.error("[LINE auth] Channel ID has an invalid format");
            return Response.json(
              { error: "LINE Login configuration is invalid", code: "line_channel_id_invalid" },
              { status: 503 },
            );
          }
          if (!idToken || !accessToken) {
            return Response.json(
              { error: "LINE identity incomplete", code: "line_token_missing" },
              { status: 400 },
            );
          }

          const verifyResponse = await fetch("https://api.line.me/oauth2/v2.1/verify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ id_token: idToken, client_id: clientId }),
          });
          const verified = (await verifyResponse.json()) as LineVerifyResult;
          if (!verifyResponse.ok || !verified.sub) {
            const detail = lineError(verified);
            console.error(`[LINE auth] ID token rejected: ${detail}`);
            return Response.json(
              { error: `LINE token rejected: ${detail}`, code: "line_token_rejected" },
              { status: 401, headers: { "Cache-Control": "no-store" } },
            );
          }

          const profileResponse = await fetch("https://api.line.me/v2/profile", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const profile = (await profileResponse.json()) as LineProfile;
          if (!profileResponse.ok) {
            console.error(`[LINE auth] Access token rejected: ${profile.message ?? profileResponse.status}`);
            return Response.json(
              { error: "LINE access token rejected", code: "line_access_token_rejected" },
              { status: 401 },
            );
          }
          if (profile.userId !== verified.sub) {
            return Response.json(
              { error: "LINE profile mismatch", code: "line_profile_mismatch" },
              { status: 401 },
            );
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const db = supabaseAdmin as any;
          const old = await db
            .from("crm_user_profiles")
            .select("role")
            .eq("provider", "line")
            .eq("provider_user_id", verified.sub)
            .maybeSingle();
          const role = old.data?.role === "admin" ? "admin" : "member";
          const row = {
            provider: "line",
            provider_user_id: verified.sub,
            display_name: profile.displayName || verified.name || "LINE user",
            email: verified.email ?? null,
            picture_url: profile.pictureUrl ?? verified.picture ?? null,
            role,
            last_login_at: new Date().toISOString(),
          };
          const saved = await db
            .from("crm_user_profiles")
            .upsert(row, { onConflict: "provider,provider_user_id" });
          if (saved.error) throw new Error(saved.error.message);

          const token = await signSession({
            sub: verified.sub,
            role,
            exp: Math.floor(Date.now() / 1000) + 28800,
          });
          return Response.json(
            {
              role,
              provider: "line",
              profile: {
                displayName: row.display_name,
                userId: verified.sub,
                email: row.email,
              },
              inLineClient: true,
            },
            {
              headers: {
                "Set-Cookie": `sc_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`,
                "Cache-Control": "no-store",
              },
            },
          );
        } catch (error) {
          console.error(error);
          return Response.json({ error: "LINE login failed" }, { status: 500 });
        }
      },
    },
  },
});
