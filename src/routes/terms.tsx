import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — SuperChoice AI Content Creator Hub" },
      {
        name: "description",
        content:
          "Terms for using SuperChoice AI Content Creator Hub to prepare, review, approve and publish content to websites and social channels.",
      },
      { property: "og:title", content: "Terms of Service — SuperChoice AI Content Creator Hub" },
      {
        property: "og:description",
        content: "Authorized use, review and publishing rules, TikTok consent and suspension terms.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://superchoiceai.lovable.app/terms" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://superchoiceai.lovable.app/terms" }],
  }),
  component: TermsPage,
});


function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-10">
        <Link to="/" className="text-sm text-red-400">← SuperChoice AI</Link>
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-sm text-slate-400">Last updated: 8 August 2026</p>
        <p>SuperChoice AI Content Creator Hub helps authorized users prepare, review, schedule, and publish content to selected websites and social-media services.</p>
        <h2 className="text-xl font-semibold">Authorized use</h2>
        <p>Users may publish only content and media they own or are authorized to use. Users remain responsible for accuracy, rights, disclosures, and compliance with each destination platform.</p>
        <h2 className="text-xl font-semibold">Review and publishing</h2>
        <p>Draft and dry-run actions do not publish content. A live publish requires explicit approval. Availability of a destination channel may depend on its API, audit status, permissions, and quota.</p>
        <h2 className="text-xl font-semibold">TikTok</h2>
        <p>TikTok publishing is initiated only by an authorized user after reviewing the post settings and giving explicit consent. The service displays the intended account, privacy choices, and content before submission where required by TikTok.</p>
        <h2 className="text-xl font-semibold">Suspension</h2>
        <p>Access may be restricted when activity is unauthorized, unlawful, abusive, or risks the security or availability of the service.</p>
        <h2 className="text-xl font-semibold">Contact</h2>
        <p>For terms, privacy, or publishing questions, use the official contact channel shown on the SuperChoice AI website.</p>
      </article>
    </main>
  );
}
