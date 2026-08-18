import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { formatPostDate } from "@/lib/format-date";
import { useAdminAccess } from "@/lib/use-admin-access";

type PostCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[];
  channel: string;
  published_at: string;
};

type IndexLoaderData = {
  posts: PostCard[];
  databaseReady: boolean;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SuperChoice AI Content Creator Hub — CMS & Multi-Channel Publishing" },
      {
        name: "description",
        content:
          "SuperChoice AI Content Creator Hub: create, review and approve content, manage it in a built-in CMS with lightweight CRM, then publish to websites and social channels.",
      },
      {
        property: "og:title",
        content: "SuperChoice AI Content Creator Hub — CMS & Multi-Channel Publishing",
      },
      {
        property: "og:description",
        content:
          "Content creation, review and approval with a built-in CMS, lightweight CRM and multi-channel publishing.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://superchoiceai.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://superchoiceai.lovable.app/" }],
  }),

  loader: async (): Promise<IndexLoaderData> => {
    try {
      const { data, error } = await supabase
        .from("cms_posts")
        .select("id, slug, title, excerpt, cover_image_url, tags, channel, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return { posts: (data ?? []) as PostCard[], databaseReady: true };
    } catch {
      return { posts: [], databaseReady: false };
    }
  },
  component: Index,
});

function Index() {
  const admin = useAdminAccess();
  const { posts, databaseReady } = Route.useLoaderData() as IndexLoaderData;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="block">
            <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
              SuperChoice AI
            </span>
            <span className="block text-xl font-semibold tracking-tight text-foreground">
              Content Creator Hub
            </span>
          </Link>

          <nav aria-label="Main" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <a href="#platform" className="text-muted-foreground hover:text-foreground">
              Platform
            </a>
            <a href="#feed" className="text-muted-foreground hover:text-foreground">
              Content feed
            </a>
            <Link to="/tiktok-integration" className="text-muted-foreground hover:text-foreground">
              TikTok Integration
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>

            {admin.allowed ? (
              <details className="relative">
                <summary className="cursor-pointer list-none rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
                  Admin
                </summary>
                <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-md border border-border bg-card shadow-lg">
                  <Link to="/publish" className="block px-3 py-2 text-sm hover:bg-muted">Publish</Link>
                  <Link to="/cms" className="block px-3 py-2 text-sm hover:bg-muted">CMS</Link>
                  <Link to="/heygen" className="block px-3 py-2 text-sm hover:bg-muted">HeyGen</Link>
                </div>
              </details>
            ) : (
              <Link to="/login" className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">Login</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section aria-labelledby="hero" className="mb-12">
          <h1 id="hero" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            SuperChoice AI Content Creator Hub
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            A content management and publishing workspace for marketing teams. Create and
            generate content, review and approve it, keep it organised in a built-in CMS with a
            lightweight CRM of members, then publish the approved result to your website and
            connected social channels.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#feed"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse published content
            </a>
            <Link
              to="/tiktok-integration"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              How TikTok publishing works
            </Link>
          </div>
        </section>

        <section aria-labelledby="platform" className="mb-12 scroll-mt-8" id="platform">
          <h2 id="platform-heading" className="text-2xl font-semibold tracking-tight">
            What the platform does
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Content creation",
                body: "Draft posts from a brief or generate copy, images and video assets, with source material stored alongside each item.",
              },
              {
                title: "Review and approval",
                body: "Every item passes a preview and approval gate. Draft and dry-run states never publish anything.",
              },
              {
                title: "Built-in CMS",
                body: "Approved posts are stored with slug, excerpt, cover image, tags and channel, and published to this public feed.",
              },
              {
                title: "Lightweight CRM",
                body: "Members who sign in are kept as a simple profile and role list used only for access and follow-up.",
              },
              {
                title: "Multi-channel publishing",
                body: "One approved item can be published to the website and to connected social channels such as TikTok, LINE, Facebook, Instagram and YouTube.",
              },
              {
                title: "Audit and status",
                body: "Each publish attempt records its request, result and platform publish identifier so outcomes can be verified.",
              },
            ].map((item) => (
              <li key={item.title} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-card-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how" className="mb-12">
          <h2 id="how" className="text-2xl font-semibold tracking-tight">
            How a post reaches a channel
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-4">
            {[
              ["1", "Create", "Write or generate the content and attach media."],
              ["2", "Review", "Check the preview, destination account and settings."],
              ["3", "Approve", "An authorized user explicitly approves the publish."],
              ["4", "Publish", "The hub posts it and records the resulting status."],
            ].map(([step, title, body]) => (
              <li key={step} className="rounded-xl border border-border p-5">
                <span className="text-xs font-semibold text-muted-foreground">STEP {step}</span>
                <h3 className="mt-1 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <h2 id="feed" className="scroll-mt-8 text-2xl font-semibold tracking-tight">
          Published content
        </h2>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          {posts.length} published {posts.length === 1 ? "post" : "posts"} — visible to everyone,
          no sign-in required.
        </p>

        {!databaseReady ? (
          <section className="mb-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
            <h2 className="font-semibold">กำลังเชื่อมต่อฐานข้อมูล</h2>
            <p className="mt-2 text-sm">
              Public Portal เปิดใช้งานได้ แต่ Content Feed และระบบ Login จะพร้อมหลังเชื่อมต่อ Supabase กลางเรียบร้อย
            </p>
          </section>
        ) : null}
        {!admin.allowed ? <section id="register" className="mb-8 rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">Guest access</h2><p className="mt-2 text-sm text-muted-foreground">ขณะนี้เห็นเฉพาะ Published content เข้าสู่ระบบด้วย Google หรือเปิดผ่าน LINE เพื่อสมัคร/ใช้งาน Member; สิทธิ์ Admin อนุมัติโดยผู้ดูแล</p><Link to="/login" className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">เข้าสู่ระบบหรือสมัครใช้งาน</Link></section> : null}
        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <h2 className="text-lg font-medium text-foreground">ยังไม่มีคอนเทนต์</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              เมื่อ n8n ส่งคอนเทนต์เข้ามาที่ <code>/api/public/publish</code> จะแสดงที่นี่ทันที
            </p>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <li
                key={post.id}
                className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50"
              >
                <Link to="/posts/$slug" params={{ slug: post.slug }} className="block">
                  {post.cover_image_url ? (
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      loading="lazy"
                      className="aspect-video w-full object-cover"
                    />
                  ) : null}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded bg-secondary px-2 py-0.5">{post.channel}</span>
                      <time dateTime={post.published_at}>
                        {formatPostDate(post.published_at)}
                      </time>
                    </div>
                    <h2 className="mt-3 text-lg font-semibold leading-snug text-card-foreground">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                    ) : null}
                    {post.tags?.length ? (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            SuperChoice AI — content creation and multi-channel publishing hub.
          </p>
          <nav className="flex flex-wrap items-center gap-4">
            <Link to="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>
            <Link to="/tiktok-verification" className="underline hover:text-foreground">
              TikTok Integration
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

