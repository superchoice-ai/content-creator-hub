import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const payloadSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional().nullable(),
  body: z.string().optional().default(""),
  content_format: z.enum(["markdown", "html", "text"]).optional().default("markdown"),
  cover_image_url: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  channel: z.string().optional().default("lovable"),
  status: z.enum(["draft", "published"]).optional().default("published"),
  external_id: z.string().optional().nullable(),
  run_id: z.string().optional().nullable(),
  published_at: z.string().optional().nullable(),
  dry_run: z.boolean().optional().default(false),
});

function slugify(input: string) {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base.length > 0 ? base.slice(0, 80) : `post-${Date.now()}`;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/publish")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["PORTAL_PUBLISH_TOKEN"];
        if (!expected) return json({ ok: false, error: "publish_token_not_configured" }, 500);

        const provided =
          request.headers.get("x-publish-token") ??
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
          "";
        if (provided !== expected) return json({ ok: false, error: "unauthorized" }, 401);

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        const parsed = payloadSchema.safeParse(raw);
        if (!parsed.success) {
          return json({ ok: false, error: "validation_failed", details: parsed.error.issues }, 400);
        }
        const data = parsed.data;
        const slug = data.slug ? slugify(data.slug) : slugify(data.title);

        if (data.dry_run) {
          return json({ ok: true, dry_run: true, slug, url: `/posts/${slug}` });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const row = {
          slug,
          title: data.title,
          excerpt: data.excerpt ?? null,
          body: data.body ?? "",
          content_format: data.content_format,
          cover_image_url: data.cover_image_url ?? null,
          tags: data.tags,
          channel: data.channel,
          status: data.status,
          source: "n8n",
          external_id: data.external_id ?? null,
          run_id: data.run_id ?? null,
          published_at: data.published_at ?? new Date().toISOString(),
        };

        const { data: saved, error } = await supabaseAdmin
          .from("cms_posts")
          .upsert(row, { onConflict: "slug" })
          .select("id, slug, status, published_at")
          .single();

        if (error) {
          console.error("publish failed", error);
          return json({ ok: false, error: error.message }, 500);
        }

        return json({
          ok: true,
          post_id: saved.id,
          slug: saved.slug,
          status: saved.status,
          published_at: saved.published_at,
          url: `/posts/${saved.slug}`,
        });
      },
    },
  },
});
