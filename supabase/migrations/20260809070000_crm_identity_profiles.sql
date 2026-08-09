create table if not exists public.crm_user_profiles(id uuid primary key default gen_random_uuid(),auth_user_id uuid null references auth.users(id) on delete set null,provider text not null check(provider in('google','line')),provider_user_id text not null,display_name text not null,email text null,picture_url text null,role text not null default 'member' check(role in('admin','member')),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),last_login_at timestamptz not null default now(),unique(provider,provider_user_id));
alter table public.crm_user_profiles enable row level security;
drop policy if exists "crm_select_own" on public.crm_user_profiles;
create policy "crm_select_own" on public.crm_user_profiles for select to authenticated using(auth.uid()=auth_user_id);
revoke all on public.crm_user_profiles from anon;grant select on public.crm_user_profiles to authenticated;
create index if not exists crm_profiles_email_idx on public.crm_user_profiles(email);
