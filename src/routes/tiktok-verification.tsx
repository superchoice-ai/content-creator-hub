import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/tiktok-verification")({ component: TikTokVerificationPage });

function TikTokVerificationPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <section className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-10">
        <Link to="/" className="text-sm text-red-400">← SuperChoice AI</Link>
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">TikTok Developer</p>
        <h1 className="text-3xl font-bold">Content Posting Integration</h1>
        <p>SuperChoice AI supports an approval-first Direct Post workflow. Draft and dry-run states never publish.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/terms" className="rounded-xl border border-slate-700 p-4 hover:border-red-500"><strong>Terms of Service</strong><span className="mt-1 block text-sm text-slate-400">Public terms URL</span></a>
          <a href="/privacy" className="rounded-xl border border-slate-700 p-4 hover:border-red-500"><strong>Privacy Policy</strong><span className="mt-1 block text-sm text-slate-400">Public privacy URL</span></a>
        </div>
        <h2 className="text-xl font-semibold">Direct Post safeguards</h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-300">
          <li>Query creator/account information before submission.</li>
          <li>Show destination account, privacy options, and content preview.</li>
          <li>Require explicit Admin approval and disable publishing during dry-run.</li>
          <li>Record the request, result, and platform publish ID for audit.</li>
        </ul>
        <p className="rounded-xl bg-slate-950 p-4 text-sm text-amber-300">Domain verification uses a TikTok-provided signature file at the verified URL prefix.</p>
      </section>
    </main>
  );
}
