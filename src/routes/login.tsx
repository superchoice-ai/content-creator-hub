import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { LINE_LIFF_ID, LINE_LIFF_URL } from "@/config/line";
import { loadLiff } from "@/lib/liff-client";

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

  useEffect(() => {
    let active = true;
    async function completeLineLogin() {
      const liff = await loadLiff();
      await liff.init({ liffId: LINE_LIFF_ID, withLoginOnExternalBrowser: true });
      if (!liff.isLoggedIn()) return;

      const idToken = liff.getIDToken();
      const accessToken = liff.getAccessToken();
      if (!idToken || !accessToken) throw new Error("LINE identity token is unavailable");

      const response = await fetch("/api/auth/line/liff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ idToken, accessToken }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "LINE login failed");

      window.dispatchEvent(new CustomEvent("sc:identity", { detail: result }));
      window.location.replace(safeReturnUrl());
    }

    void completeLineLogin().catch((error) => {
      if (active) setMessage(error instanceof Error ? error.message : String(error));
    });
    return () => {
      active = false;
    };
  }, []);

  async function googleLogin() {
    sessionStorage.setItem(RETURN_URL_KEY, "/");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    if (result.redirected) return;
    window.location.replace(safeReturnUrl());
  }


  async function lineLogin() {
    try {
      sessionStorage.setItem(RETURN_URL_KEY, "/");
      const liff = await loadLiff();
      await liff.init({ liffId: LINE_LIFF_ID, withLoginOnExternalBrowser: true });
      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: window.location.href });
        return;
      }
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-7">
        <h1 className="text-2xl font-bold">SuperChoice AI Login</h1>
        <p className="mt-2 text-sm text-slate-400">Admin และ Member เข้าสู่ระบบด้วย Google หรือ LINE</p>
        <button onClick={googleLogin} className="mt-6 w-full rounded-xl bg-white px-4 py-3 font-semibold text-slate-950">Continue with Google</button>
        <button onClick={lineLogin} className="mt-3 block w-full rounded-xl bg-[#06c755] px-4 py-3 text-center font-semibold text-white">Continue with LINE</button>
        <p className="mt-4 rounded-lg bg-slate-950 p-3 text-sm text-slate-400">Browser ที่ยังไม่ยืนยันตัวตนเป็น Guest และเห็นเฉพาะ Published content — ใช้ Google หรือ LINE เพื่อสมัคร/เข้าแบบ Member</p>
        <a href={LINE_LIFF_URL} className="mt-3 block text-center text-xs text-slate-500">เปิดผ่านแอป LINE</a>
        {message ? <p className="mt-4 text-sm text-red-300">{message}</p> : null}
      </section>
    </main>
  );
}
