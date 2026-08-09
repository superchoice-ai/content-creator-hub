import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { loadLiff } from "@/lib/liff-client";

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
  async function lineLogin() {
    const liffId = import.meta.env["VITE_LINE_LIFF_ID"] as string | undefined;
    const liffUrl = import.meta.env["VITE_LINE_LIFF_URL"] as string | undefined;
    if (!liffId) return setMessage("VITE_LINE_LIFF_ID is not configured");
    const liff = await loadLiff();
    await liff.init({ liffId, withLoginOnExternalBrowser: false });
    if (!liff.isInClient()) return window.location.assign(liffUrl || `https://liff.line.me/${liffId}`);
    if (!liff.isLoggedIn()) liff.login({ redirectUri: window.location.href });
    else window.location.assign("/");
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-7">
        <h1 className="text-2xl font-bold">SuperChoice AI Login</h1>
        <p className="mt-2 text-sm text-slate-400">Admin และ Member เข้าสู่ระบบด้วย Google หรือ LINE</p>
        <button onClick={googleLogin} className="mt-6 w-full rounded-xl bg-white px-4 py-3 font-semibold text-slate-950">Continue with Google</button>
        <button onClick={lineLogin} className="mt-3 block w-full rounded-xl bg-[#06c755] px-4 py-3 text-center font-semibold text-white">Continue with LINE LIFF</button>
        <p className="mt-4 rounded-lg bg-slate-950 p-3 text-sm text-slate-400">Browser ที่ยังไม่ยืนยันตัวตนเป็น Guest และเห็นเฉพาะ Published content — ใช้ Google หรือ LINE LIFF เพื่อสมัคร/เข้าแบบ Member</p>
        {message ? <p className="mt-4 text-sm text-red-300">{message}</p> : null}
      </section>
    </main>
  );
}
