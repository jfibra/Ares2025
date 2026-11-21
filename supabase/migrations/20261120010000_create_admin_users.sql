-- People allowed into /admin. Signing in also needs a Supabase Auth user with the same email.
create table if not exists public.admin_users (
  email      text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

-- No policies: only the server (secret key) can read or change this list.
alter table public.admin_users enable row level security;
