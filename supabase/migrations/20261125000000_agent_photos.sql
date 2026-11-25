-- Each person registering uploads a clear, formal photo of themselves, used for their ARES poster.
-- One file per person joining: one for a single agent, two when both people on a couple's record join
-- (in the same order as the names on the record).
alter table public.registrations
  add column if not exists photo_paths text[] not null default '{}';   -- files in the private "agent-photos" bucket

-- How many photos are on file, so the dashboards can list them without seeing the storage paths.
alter table public.registrations
  add column if not exists photo_count integer generated always as (cardinality(photo_paths)) stored;

-- Private storage for the photos: 5 MB, images only. Opened through signed links from the server.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('agent-photos', 'agent-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

notify pgrst, 'reload schema';
