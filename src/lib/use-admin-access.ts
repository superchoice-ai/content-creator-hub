import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AdminAccessState = {
  loading: boolean;
  allowed: boolean;
  accessToken: string;
};

const guestState: AdminAccessState = {
  loading: false,
  allowed: false,
  accessToken: "",
};

export function useAdminAccess() {
  const [state, setState] = useState<AdminAccessState>({
    loading: true,
    allowed: false,
    accessToken: "",
  });

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    async function check() {
      try {
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token ?? "";
        const response = await fetch("/api/admin/session", {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
          credentials: "same-origin",
        });
        if (active) {
          setState({ loading: false, allowed: response.ok, accessToken });
        }
      } catch {
        if (active) setState(guestState);
      }
    }

    void check();

    try {
      const { data: subscription } = supabase.auth.onAuthStateChange(() => void check());
      unsubscribe = () => subscription.subscription.unsubscribe();
    } catch {
      if (active) setState(guestState);
    }

    window.addEventListener("sc:identity", check);
    return () => {
      active = false;
      unsubscribe?.();
      window.removeEventListener("sc:identity", check);
    };
  }, []);

  return state;
}
