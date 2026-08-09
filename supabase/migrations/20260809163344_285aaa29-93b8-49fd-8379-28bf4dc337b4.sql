CREATE TABLE public.crm_user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid,
  provider text NOT NULL,
  provider_user_id text NOT NULL,
  display_name text,
  email text,
  picture_url text,
  role text NOT NULL DEFAULT 'member',
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_user_id)
);
GRANT ALL ON public.crm_user_profiles TO service_role;
ALTER TABLE public.crm_user_profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_crm_user_profiles_updated_at BEFORE UPDATE ON public.crm_user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.app_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
GRANT ALL ON public.app_user_roles TO service_role;
ALTER TABLE public.app_user_roles ENABLE ROW LEVEL SECURITY;