CREATE TABLE public.cms_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL DEFAULT '',
  content_format TEXT NOT NULL DEFAULT 'markdown',
  cover_image_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  channel TEXT NOT NULL DEFAULT 'lovable',
  status TEXT NOT NULL DEFAULT 'published',
  source TEXT NOT NULL DEFAULT 'n8n',
  external_id TEXT,
  run_id TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX cms_posts_external_id_key ON public.cms_posts (external_id) WHERE external_id IS NOT NULL;
CREATE INDEX cms_posts_published_at_idx ON public.cms_posts (published_at DESC);

GRANT SELECT ON public.cms_posts TO anon;
GRANT SELECT ON public.cms_posts TO authenticated;
GRANT ALL ON public.cms_posts TO service_role;

ALTER TABLE public.cms_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are publicly readable"
ON public.cms_posts FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_cms_posts_updated_at
BEFORE UPDATE ON public.cms_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();