-- Team leaders who open the invite link but are not joining ARES 2027, and why.
-- Registering later through the same link removes their row here.
create table if not exists public.team_leader_declines (
  id          bigint generated always as identity primary key,
  name        text        not null check (char_length(name) between 1 and 200),
  email       text        not null unique check (email = lower(email)),
  team        text        not null check (char_length(team) between 1 and 200),
  reason      text        not null check (char_length(reason) between 1 and 1000),
  declined_at timestamptz not null default now()
);
alter table public.team_leader_declines enable row level security;

notify pgrst, 'reload schema';
