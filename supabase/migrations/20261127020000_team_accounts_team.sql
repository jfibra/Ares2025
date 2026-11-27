-- Each of these accounts looks after one of the teams the admin handles directly
-- (Team Tycoons, Leuterio Direct): `team` says which.
alter table public.team_accounts
  add column if not exists team text not null default 'Team Tycoons' check (char_length(team) between 1 and 200);

notify pgrst, 'reload schema';
