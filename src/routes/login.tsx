import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LINE_LIFF_URL } from "@/config/line";
import { initLiff } from "@/lib/liff-client";

export const Route = createFileRoute("/login")({ component: LoginPage });

const RETURN_URL_KEY = "sc_return_url";

function safeReturnUrl() {
  const saved = sessionStorage.getItem(RETURN_URL_KEY);
  sessionStorage.removeItem(RETURN_URL_KEY);
  if (!saved) return "/";
  try {
    const url = new URL(saved, window.location.origin);
    return url.origin === window.location.origin && url.pathname !== "/login"
      ? `${url.pathname}${url.search}${url.hash}`
      : "/";
  } catch {
    return "/";
  }
}

function LoginPage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const redirected = useRef(false);

  // The shared IdentityBootstrap performs the LINE/Supabase session exchange.
  // Here we only leave the login page once an identity is actually resolved,
  // and only a single time, so the page cannot loop or re-refresh itself.
  useEffect(() => {
    function onIdentity(event: Event) {
      const detail = (event as CustomEvent).detail as { role?: string } | undefined;
      if (!detail || detail.role === "guest" || redirected.current) return;
      redirected.current = true;
      window.location.replace(safeReturnUrl());
    }
    window.addEventListener("sc:identity", onIdentity);
    return () => window.removeEventListener("sc:identity", onIdentity);
  }, []);


  async function lineLogin() {
    setBusy(true);
    setMessage("");
    try {
      sessionStorage.setItem(RETURN_URL_KEY, "/");
      const liff = await initLiff();
      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: `${window.location.origin}/login` });
        return;
      }
      redirected.current = true;
      window.location.replace(safeReturnUrl());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-7">
        <h1 className="text-2xl font-bold">SuperChoice AI Login</h1>
        <p className="mt-2 text-sm text-slate-400">เข้าสู่ระบบด้วย LINE</p>
        <button disabled={busy} onClick={lineLogin} className="mt-6 block w-full rounded-xl bg-[#06c755] px-4 py-3 text-center font-semibold text-white disabled:opacity-60">Continue with LINE</button>
        <p className="mt-4 rounded-lg bg-slate-950 p-3 text-sm text-slate-400">Browser ที่ยังไม่ยืนยันตัวตนเป็น Guest และเห็นเฉพาะ Published content — ใช้ LINE เพื่อสมัคร/เข้าแบบ Member</p>
        <a href={LINE_LIFF_URL} className="mt-3 block text-center text-xs text-slate-500">เปิดผ่านแอป LINE</a>
        {message ? <p className="mt-4 text-sm text-red-300">{message}</p> : null}
      </section>
    </main>
  );
}
