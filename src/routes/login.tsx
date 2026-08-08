import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const [message, setMessage] = useState("");
  async function googleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/publish` },
    });
    if (error) setMessage(error.message);
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-7">
        <h1 className="text-2xl font-bold">SuperChoice AI Login</h1>
        <p className="mt-2 text-sm text-slate-400">Admin และ Member เข้าสู่ระบบด้วย Google หรือ LINE</p>
        <button onClick={googleLogin} className="mt-6 w-full rounded-xl bg-white px-4 py-3 font-semibold text-slate-950">Continue with Google</button>
        <a href="/api/auth/line/start" className="mt-3 block w-full rounded-xl bg-[#06c755] px-4 py-3 text-center font-semibold text-white">Continue with LINE</a>
        {message ? <p className="mt-4 text-sm text-red-300">{message}</p> : null}
      </section>
    </main>
  );
}
