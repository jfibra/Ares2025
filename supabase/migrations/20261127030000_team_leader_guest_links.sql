-- A team leader can have a guest registration link of their own, made by the admin:
-- /guest/<guest_code>. A guest who registers through it is recorded as that team leader's
-- guest, so the admin knows who invited them.
alter table public.team_leaders add column if not exists guest_code text unique;
alter table public.registrations
  add column if not exists guest_of_team_leader_id bigint references public.team_leaders (id) on delete set null;
create index if not exists registrations_guest_of_idx on public.registrations (guest_of_team_leader_id);

notify pgrst, 'reload schema';
