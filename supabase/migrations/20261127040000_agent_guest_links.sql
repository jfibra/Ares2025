-- A registered agent can also have a guest registration link of their own, made by the admin:
-- /guest/<guest_code>. A guest who registers through it is recorded as that agent's guest.
alter table public.registrations add column if not exists guest_code text unique;
alter table public.registrations
  add column if not exists guest_of_registration_id bigint references public.registrations (id) on delete set null;
create index if not exists registrations_guest_of_registration_idx on public.registrations (guest_of_registration_id);

notify pgrst, 'reload schema';
