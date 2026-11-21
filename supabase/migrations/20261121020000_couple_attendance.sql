-- Some agent records are a couple ("Elddie John And Marjulie Benigay"). They choose who is
-- joining when they register; if both come, the registration counts as two people and pays double.
alter table public.registrations
  add column if not exists attendee_count smallint not null default 1 check (attendee_count in (1, 2)),
  add column if not exists attendees      text check (attendees is null or char_length(attendees) <= 200);

notify pgrst, 'reload schema';
