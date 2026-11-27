-- A team with more than one registered team leader shares one dashboard (see lib/co-leaders.ts),
-- so the team needs ONE contact number for its agents: the number shown to agents, when it should
-- differ from the number the team leader registered with. Set in the team leader's settings.
alter table public.team_leaders add column if not exists agent_contact_number text;

-- An earlier draft kept a list of extra team leaders. It is not needed: they are in the LR records.
drop table if exists public.team_co_leaders;

notify pgrst, 'reload schema';
