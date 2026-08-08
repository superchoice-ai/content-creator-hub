import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { adminError, requireAdmin } from "@/lib/admin-auth.server";

const postSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  excerpt: z.string().optional().nullable(),
  body: z.string().default(""),
  content_format: z.enum(["markdown", "html", "text"]).default("markdown"),
  cover_image_url: z.string().url().optional().nullable().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  channel: z.string().default("lovable"),
  status: z.enum(["draft", "published"]).default("draft"),
});

function slugify(input: string) {
  const slug = input.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
  return slug.slice(0, 80) || `post-${Date.now()}`;
}

export const Route = createFileRoute("/api/cms/posts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdmin(request);
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin.from("cms_posts").select("*").order("updated_at", { ascending: false }).limit(100);
          if (error) throw error;
          return Response.json({ posts: data ?? [] });
        } catch (error) {
          return adminError(error);
        }
      },
      POST: async ({ request }) => {
        try {
          const session = await requireAdmin(request);
          const parsed = postSchema.safeParse(await request.json());
          if (!parsed.success) return Response.json({ error: "validation_failed", details: parsed.error.issues }, { status: 400 });
          const input = parsed.data;
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const row = {
            ...(input.id ? { id: input.id } : {}),
            title: input.title,
            slug: slugify(input.slug ?? input.title),
            excerpt: input.excerpt ?? null,
            body: input.body,
            content_format: input.content_format,
            cover_image_url: input.cover_image_url || null,
            tags: input.tags,
            channel: input.channel,
            status: input.status,
            source: "manual_admin",
            published_at: input.status === "published" ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          };
          const { data, error } = await supabaseAdmin.from("cms_posts").upsert(row, { onConflict: "slug" }).select("*").single();
          if (error) throw error;
          return Response.json({ ok: true, post: data, actor: session.user.id }, { status: input.id ? 200 : 201 });
        } catch (error) {
          return adminError(error);
        }
      },
    },
  },
});
