create table if not exists public.app_user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'member')) default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_user_roles enable row level security;
alter table public.cms_posts enable row level security;

drop policy if exists "roles_select_own" on public.app_user_roles;
create policy "roles_select_own" on public.app_user_roles
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "published_posts_public_read" on public.cms_posts;
create policy "published_posts_public_read" on public.cms_posts
for select to anon, authenticated using (
  status = 'published'
  or exists (
    select 1 from public.app_user_roles r
    where r.user_id = auth.uid() and r.role = 'admin'
  )
);

drop policy if exists "admin_manage_cms_posts" on public.cms_posts;
create policy "admin_manage_cms_posts" on public.cms_posts
for all to authenticated
using (exists (select 1 from public.app_user_roles r where r.user_id = auth.uid() and r.role = 'admin'))
with check (exists (select 1 from public.app_user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

create or replace function public.assign_default_member_role()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.app_user_roles(user_id, role) values (new.id, 'member')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_assign_role on auth.users;
create trigger on_auth_user_created_assign_role
after insert on auth.users for each row execute procedure public.assign_default_member_role();
