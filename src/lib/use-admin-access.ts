import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminAccess() {
  const [state, setState] = useState<{ loading: boolean; allowed: boolean; accessToken: string }>({
    loading: true,
    allowed: false,
    accessToken: "",
  });

  useEffect(() => {
    let active = true;
    async function check() {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token ?? "";
      const response = await fetch("/api/admin/session", { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}, credentials: "same-origin" });
      if (active) setState({ loading: false, allowed: response.ok, accessToken });
    }
    void check();
    const { data: subscription } = supabase.auth.onAuthStateChange(() => void check());
    window.addEventListener("sc:identity", check);
    return () => {
      active = false;
      subscription.subscription.unsubscribe();
      window.removeEventListener("sc:identity", check);
    };
  }, []);

  return state;
}
