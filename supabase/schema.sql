-- Run this once in the Supabase SQL Editor before using the application.
-- It creates secure authenticated accounts and shared Team Andeng workspace data.

create type public.workspace_role as enum ('admin', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  role public.workspace_role not null default 'user',
  profile_photo_url text,
  created_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  team_name text not null default 'Team Andeng',
  branch_name text not null default 'First Global Summit Life Insurance Agency',
  welcome_message text not null default 'Build people. Move purpose.',
  currency text not null default 'PHP (₱)',
  timezone text not null default 'Asia/Manila',
  pipeline_stages text not null default 'New lead, Screening, Interview, Offer, Onboarding',
  sales_statuses text not null default 'Submitted, For review, Issued',
  notifications boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  advisor text not null,
  product text not null,
  premium numeric(14, 2) not null check (premium >= 0),
  status text not null,
  sale_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.recruits (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  owner_name text not null,
  name text not null,
  stage text not null,
  next_action text not null,
  created_at timestamptz not null default now()
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null,
  category text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null,
  event_date date not null,
  event_time time,
  created_at timestamptz not null default now()
);

-- Creates a profile for each new Supabase Auth user. The first account remains
-- a regular user: promote one trusted profile to admin manually below.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.sales enable row level security;
alter table public.recruits enable row level security;
alter table public.resources enable row level security;
alter table public.events enable row level security;

create policy "Members view profiles" on public.profiles for select to authenticated using (true);
create policy "Users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "Members view workspace" on public.workspaces for select to authenticated using (true);
create policy "Admins update workspace" on public.workspaces for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Advisors may access only their own records; admins may access all records.
create policy "Read sales" on public.sales for select to authenticated using (owner_id = auth.uid() or public.is_admin());
create policy "Insert sales" on public.sales for insert to authenticated with check (owner_id = auth.uid());
create policy "Update sales" on public.sales for update to authenticated using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
create policy "Delete sales" on public.sales for delete to authenticated using (owner_id = auth.uid() or public.is_admin());

create policy "Read recruits" on public.recruits for select to authenticated using (owner_id = auth.uid() or public.is_admin());
create policy "Insert recruits" on public.recruits for insert to authenticated with check (owner_id = auth.uid());
create policy "Update recruits" on public.recruits for update to authenticated using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
create policy "Delete recruits" on public.recruits for delete to authenticated using (owner_id = auth.uid() or public.is_admin());

create policy "Read resources" on public.resources for select to authenticated using (owner_id = auth.uid() or public.is_admin());
create policy "Insert resources" on public.resources for insert to authenticated with check (owner_id = auth.uid());
create policy "Update resources" on public.resources for update to authenticated using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
create policy "Delete resources" on public.resources for delete to authenticated using (owner_id = auth.uid() or public.is_admin());

create policy "Read events" on public.events for select to authenticated using (owner_id = auth.uid() or public.is_admin());
create policy "Insert events" on public.events for insert to authenticated with check (owner_id = auth.uid());
create policy "Update events" on public.events for update to authenticated using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
create policy "Delete events" on public.events for delete to authenticated using (owner_id = auth.uid() or public.is_admin());

-- After the trusted administrator has registered, run this once with their email:
-- update public.profiles set role = 'admin' where email = 'admin@example.com';
--
-- Create a workspace row once:
-- insert into public.workspaces default values;
