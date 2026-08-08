import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { formatPostDate } from "@/lib/format-date";

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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SuperChoice AI Portal — Content Feed" },
      {
        name: "description",
        content:
          "คลังคอนเทนต์ของ SuperChoice AI ที่เผยแพร่อัตโนมัติจากระบบ n8n ไปยังทุกช่องทาง",
      },
      { property: "og:title", content: "SuperChoice AI Portal — Content Feed" },
      {
        property: "og:description",
        content: "คอนเทนต์ล่าสุดจากระบบเผยแพร่อัตโนมัติของ SuperChoice AI",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async () => {
    const { data, error } = await supabase
      .from("cms_posts")
      .select("id, slug, title, excerpt, cover_image_url, tags, channel, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(30);
    if (error) throw error;
    return { posts: (data ?? []) as PostCard[] };
  },
  component: Index,
});

function Index() {
  const { posts } = Route.useLoaderData() as { posts: PostCard[] };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              SuperChoice AI
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Content Portal
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              {posts.length} posts
            </span>

            {/* Link to Publish page so UI is discoverable */}
            <Link to="/publish" className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
              Publish
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
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
    </div>
  );
}
