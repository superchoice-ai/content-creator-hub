import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SuperChoice AI Content Creator Hub" },
      {
        name: "description",
        content:
          "How SuperChoice AI Content Creator Hub processes account, content and publishing data, and how connected platform access can be revoked.",
      },
      { property: "og:title", content: "Privacy Policy — SuperChoice AI Content Creator Hub" },
      {
        property: "og:description",
        content: "Information processed, storage, sharing and user choices for SuperChoice AI.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://superchoiceai.lovable.app/privacy" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://superchoiceai.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});


function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-10">
        <Link to="/" className="text-sm text-red-400">← SuperChoice AI</Link>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-slate-400">Last updated: 8 August 2026</p>
        <p>This policy explains how SuperChoice AI Content Creator Hub handles information used to authenticate users, manage content, and publish to connected services.</p>
        <h2 className="text-xl font-semibold">Information processed</h2>
        <p>We may process account identifiers, profile name, email address, LINE or Google sign-in identifiers, content drafts, media metadata, approval records, destination settings, publish results, and security logs.</p>
        <h2 className="text-xl font-semibold">How information is used</h2>
        <p>Information is used to authenticate users, enforce roles, display published content, execute user-approved publishing, prevent duplicate jobs, investigate failures, and meet legal or platform obligations.</p>
        <h2 className="text-xl font-semibold">Connected platforms</h2>
        <p>When a user connects TikTok or another service, tokens and permitted account data are used only for requested functions. Content is not posted without an explicit publish action. Platform access may be revoked from the connected platform.</p>
        <h2 className="text-xl font-semibold">Storage and retention</h2>
        <p>Application data is stored in Supabase with access controls. Smaller application uploads may use protected object storage; large originals may be referenced by Google Drive file ID. Records are retained only as needed for service operation, audit, security, and legal requirements.</p>
        <h2 className="text-xl font-semibold">Sharing</h2>
        <p>Information is shared only with service providers needed to operate requested features, connected publishing platforms, or authorities when legally required. Personal data is not sold.</p>
        <h2 className="text-xl font-semibold">User choices</h2>
        <p>Users may disconnect connected platforms, request access or correction, and request deletion subject to legal, security, and audit-retention requirements.</p>
        <h2 className="text-xl font-semibold">Contact</h2>
        <p>For privacy requests, use the official contact channel shown on the SuperChoice AI website.</p>
      </article>
    </main>
  );
}
