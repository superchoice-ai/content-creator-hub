import { createFileRoute, Link } from "@tanstack/react-router";

const SITE = "https://superchoiceai.lovable.app";

export const Route = createFileRoute("/tiktok-integration")({
  head: () => ({
    meta: [
      { title: "TikTok Content Posting Integration — SuperChoice AI" },
      {
        name: "description",
        content:
          "How SuperChoice AI Content Creator Hub uses the TikTok Content Posting API: authorize, query creator info, preview, explicit user consent, publish and check status.",
      },
      { property: "og:title", content: "TikTok Content Posting Integration — SuperChoice AI" },
      {
        property: "og:description",
        content:
          "Approval-first TikTok Direct Post workflow with creator info query, content preview and explicit user consent. Dry-run never publishes.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE}/tiktok-integration` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/tiktok-integration` }],
  }),
  component: TikTokIntegrationPage,
});

const steps = [
  {
    title: "1. Connect and authorize TikTok",
    body: "An authorized user starts the connection from the publishing workspace and grants the scopes required for content posting. No connection is created automatically.",
  },
  {
    title: "2. Query creator info",
    body: "Before any submission the hub calls the creator info endpoint to retrieve the destination account, posting eligibility and the currently available privacy options.",
  },
  {
    title: "3. Show creator identity and privacy options",
    body: "The user sees which TikTok account will receive the post, plus the privacy levels, interaction settings and limits returned by TikTok for that account.",
  },
  {
    title: "4. Preview the content",
    body: "Caption, media, destination account and the selected privacy option are shown together in a review screen before anything is sent to TikTok.",
  },
  {
    title: "5. Explicit user consent",
    body: "Publishing requires an explicit approval action by the user on the review screen. Draft and dry-run states never publish, and content is never posted without that explicit action.",
  },
  {
    title: "6. Publish",
    body: "Only after approval does the hub submit the post through the TikTok Content Posting API, using the settings the user confirmed.",
  },
  {
    title: "7. Check status",
    body: "The publish status is polled and stored with the returned platform publish identifier so the user can see whether the post succeeded, is processing, or failed.",
  },
];

function TikTokIntegrationPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <article className="mx-auto max-w-3xl space-y-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link to="/" className="underline hover:text-foreground">
            SuperChoice AI
          </Link>
          <span aria-hidden="true"> / </span>
          <span>TikTok Integration</span>
        </nav>

        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            TikTok Developer — Content Posting API
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            TikTok Content Posting Integration
          </h1>
          <p className="text-muted-foreground">
            SuperChoice AI Content Creator Hub is a content management and multi-channel
            publishing tool. TikTok is one optional publishing destination, and it uses an
            approval-first Direct Post workflow.
          </p>
        </header>

        <section aria-labelledby="flow" className="space-y-4">
          <h2 id="flow" className="text-xl font-semibold">
            User flow
          </h2>
          <ol className="space-y-4">
            {steps.map((step) => (
              <li key={step.title} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-card-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="safeguards" className="space-y-3">
          <h2 id="safeguards" className="text-xl font-semibold">
            Safeguards
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Dry-run and draft modes never publish to TikTok.</li>
            <li>Content is never posted without an explicit user publish action.</li>
            <li>Creator info is queried before every submission.</li>
            <li>Every request, result and platform publish ID is recorded for audit.</li>
            <li>Users can revoke access at any time from their TikTok account settings.</li>
          </ul>
        </section>

        <section aria-labelledby="policies" className="space-y-3">
          <h2 id="policies" className="text-xl font-semibold">
            Policies
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/terms"
              className="rounded-xl border border-border p-4 hover:border-primary/60"
            >
              <strong className="block">Terms of Service</strong>
              <span className="mt-1 block text-sm text-muted-foreground">Public terms URL</span>
            </Link>
            <Link
              to="/privacy"
              className="rounded-xl border border-border p-4 hover:border-primary/60"
            >
              <strong className="block">Privacy Policy</strong>
              <span className="mt-1 block text-sm text-muted-foreground">Public privacy URL</span>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            The earlier{" "}
            <Link to="/tiktok-verification" className="underline hover:text-foreground">
              /tiktok-verification
            </Link>{" "}
            page remains available for backward compatibility, and domain verification
            continues to use the TikTok-provided signature files at their verified URL
            prefixes.
          </p>
        </section>
      </article>
    </main>
  );
}
