import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  content_format: string;
  cover_image_url: string | null;
  tags: string[];
  channel: string;
  published_at: string;
};

export const Route = createFileRoute("/posts/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("cms_posts")
      .select(
        "id, slug, title, excerpt, body, content_format, cover_image_url, tags, channel, published_at",
      )
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return { post: data as Post };
  },
  head: ({ loaderData }) => {
    const post = (loaderData as { post: Post } | undefined)?.post;
    const title = post ? `${post.title} — SuperChoice AI` : "Post — SuperChoice AI";
    const description = post?.excerpt ?? "คอนเทนต์จากระบบเผยแพร่อัตโนมัติของ SuperChoice AI";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(post?.cover_image_url?.startsWith("https://")
          ? [
              { property: "og:image", content: post.cover_image_url },
              { name: "twitter:image", content: post.cover_image_url },
            ]
          : []),
      ],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData() as { post: Post };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← กลับหน้าฟีด
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded bg-secondary px-2 py-0.5">{post.channel}</span>
          <time dateTime={post.published_at}>
            {new Date(post.published_at).toLocaleDateString("th-TH")}
          </time>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{post.title}</h1>
        {post.excerpt ? (
          <p className="mt-3 text-base text-muted-foreground">{post.excerpt}</p>
        ) : null}
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="mt-6 w-full rounded-xl border border-border object-cover"
          />
        ) : null}

        {post.content_format === "html" ? (
          <div
            className="mt-8 space-y-4 text-foreground [&_a]:underline [&_h2]:text-xl [&_h2]:font-semibold"
            // Content originates from the trusted internal automation pipeline.
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        ) : (
          <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-foreground">
            {post.body}
          </div>
        )}

        {post.tags?.length ? (
          <div className="mt-10 flex flex-wrap gap-1.5 border-t border-border pt-6">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </article>
    </div>
  );
}
