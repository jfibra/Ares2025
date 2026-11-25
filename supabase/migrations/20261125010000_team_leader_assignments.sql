-- Some teams (for example LR Direct, Davao Eagles, FH Ozamiz, Team Tycoons) have no team leader
-- in the LR records. The admin picks one of the team's agents to act as its team leader for ARES.
-- That agent then registers through the team leader link like any other team leader, and the
-- team's agents are filed under them. One team leader per team.
create table if not exists public.team_leader_assignments (
  id          bigint generated always as identity primary key,
  name        text        not null check (char_length(name) between 1 and 200),
  email       text        not null unique check (email = lower(email)),
  team        text        not null check (char_length(team) between 1 and 200),
  -- The team name in lower case with single spaces, so "LR  Direct" and "lr direct" are one team.
  team_key    text        not null unique,
  assigned_at timestamptz not null default now()
);
alter table public.team_leader_assignments enable row level security;

notify pgrst, 'reload schema';
