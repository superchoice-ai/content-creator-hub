import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LINE_LIFF_ID } from "@/config/line";
import { loadLiff } from "@/lib/liff-client";

function emit(detail: unknown) {
  sessionStorage.setItem("sc_identity", JSON.stringify(detail));
  window.dispatchEvent(new CustomEvent("sc:identity", { detail }));
}

export function IdentityBootstrap() {
  useEffect(() => {
    let active = true;

    async function boot() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const response = await fetch("/api/auth/profile/sync", {
          method: "POST",
          headers: { Authorization: `Bearer ${data.session.access_token}` },
          credentials: "same-origin",
        });
        if (response.ok && active) emit(await response.json());
        else if (active) emit({ role: "guest", inLineClient: false });
        return;
      }

      const liff = await loadLiff();
      await liff.init({ liffId: LINE_LIFF_ID, withLoginOnExternalBrowser: true });
      if (!liff.isLoggedIn()) {
        if (active) emit({ role: "guest", inLineClient: liff.isInClient() });
        return;
      }

      const idToken = liff.getIDToken();
      const accessToken = liff.getAccessToken();
      if (!idToken || !accessToken) {
        if (active) emit({ role: "guest", inLineClient: liff.isInClient() });
        return;
      }

      const response = await fetch("/api/auth/line/liff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ idToken, accessToken }),
      });
      if (response.ok && active) {
        const identity = await response.json();
        emit(identity);
        if (window.location.pathname.startsWith("/publish") && identity.role !== "admin") {
          window.location.replace("/");
        }
      } else if (active) emit({ role: "guest", inLineClient: liff.isInClient() });
    }

    void boot().catch((error) => {
      console.error(error);
      if (active) emit({ role: "guest", inLineClient: false });
    });
    const { data: subscription } = supabase.auth.onAuthStateChange(() => void boot());
    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return null;
}
