import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAdminAccess } from "@/lib/use-admin-access";

export const Route = createFileRoute("/cms/")({ component: CmsPage });

type Editor = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image_url: string;
  tags: string;
  status: "draft" | "published";
};
const EMPTY: Editor = { title: "", slug: "", excerpt: "", body: "", cover_image_url: "", tags: "", status: "draft" };

function CmsPage() {
  const admin = useAdminAccess();
  const [editor, setEditor] = useState<Editor>(EMPTY);
  const [posts, setPosts] = useState<Array<Record<string, unknown>>>([]);
  const [message, setMessage] = useState("");

  async function load() {
    if (!admin.accessToken) return;
    const response = await fetch("/api/cms/posts", { headers: { Authorization: `Bearer ${admin.accessToken}` } });
    const data = await response.json();
    if (response.ok) setPosts(data.posts ?? []);
  }
  useEffect(() => { void load(); }, [admin.accessToken]);

  async function save() {
    setMessage("Saving…");
    const response = await fetch("/api/cms/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${admin.accessToken}` },
      body: JSON.stringify({ ...editor, tags: editor.tags.split(",").map((x) => x.trim()).filter(Boolean), content_format: "markdown", channel: "lovable" }),
    });
    const data = await response.json();
    setMessage(response.ok ? "Saved" : data.error ?? "Save failed");
    if (response.ok) { setEditor(EMPTY); await load(); }
  }

  if (admin.loading) return <main className="min-h-screen bg-slate-950 p-8 text-white">Checking access…</main>;
  if (!admin.allowed) return <main className="min-h-screen bg-slate-950 p-8 text-white">Admin only. <Link to="/login" className="text-indigo-300">Login</Link></main>;

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold">Manual CMS Editor</h1>
          <input className="w-full rounded-lg bg-slate-950 p-3" placeholder="Title" value={editor.title} onChange={(e) => setEditor({ ...editor, title: e.target.value })} />
          <input className="w-full rounded-lg bg-slate-950 p-3" placeholder="Slug (optional)" value={editor.slug} onChange={(e) => setEditor({ ...editor, slug: e.target.value })} />
          <textarea className="w-full rounded-lg bg-slate-950 p-3" placeholder="Excerpt" value={editor.excerpt} onChange={(e) => setEditor({ ...editor, excerpt: e.target.value })} />
          <textarea className="min-h-72 w-full rounded-lg bg-slate-950 p-3" placeholder="Markdown content" value={editor.body} onChange={(e) => setEditor({ ...editor, body: e.target.value })} />
          <input className="w-full rounded-lg bg-slate-950 p-3" placeholder="Cover image URL" value={editor.cover_image_url} onChange={(e) => setEditor({ ...editor, cover_image_url: e.target.value })} />
          <input className="w-full rounded-lg bg-slate-950 p-3" placeholder="Tags, comma separated" value={editor.tags} onChange={(e) => setEditor({ ...editor, tags: e.target.value })} />
          <div className="flex gap-3">
            <select className="rounded-lg bg-slate-950 p-3" value={editor.status} onChange={(e) => setEditor({ ...editor, status: e.target.value as Editor["status"] })}>
              <option value="draft">Draft</option><option value="published">Published</option>
            </select>
            <button disabled={!editor.title.trim()} onClick={save} className="rounded-lg bg-indigo-600 px-5 py-3 disabled:opacity-40">Save</button>
          </div>
          {message ? <p className="text-sm text-amber-300">{message}</p> : null}
        </div>
        <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-semibold">Recent content</h2>
          <ul className="mt-4 space-y-3">{posts.map((post) => <li key={String(post["id"])} className="rounded-lg bg-slate-950 p-3"><strong>{String(post["title"])}</strong><p className="text-xs text-slate-400">{String(post["status"])}</p></li>)}</ul>
        </aside>
      </section>
    </main>
  );
}
