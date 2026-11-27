-- Accounts for the people (the secretaries) who look after the team the admin handles directly
-- (Team Tycoons). They sign in to their own page, set the contact details shown to that team's
-- agents, and confirm those agents' payments. Signing in also needs a Supabase Auth user with
-- the same email. The admin creates and removes these accounts.
create table if not exists public.team_accounts (
  email      text primary key check (email = lower(email)),
  user_id    uuid,                                   -- their Supabase Auth user, removed with the account
  created_at timestamptz not null default now()
);

alter table public.team_accounts add column if not exists user_id uuid;

-- No policies: only the server (secret key) can read or change this list.
alter table public.team_accounts enable row level security;

notify pgrst, 'reload schema';
