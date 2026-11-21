-- Two-role flow: team leaders (TLs) register through a private invite link, then
-- agents register themselves and wait for their TL to confirm them.

create table if not exists public.team_leaders (
  id             bigint generated always as identity primary key,
  user_id        uuid unique,                       -- their Supabase Auth user
  name           text        not null check (char_length(name) between 1 and 200),
  email          text        not null unique check (email = lower(email)),
  contact_number text        not null check (char_length(contact_number) between 5 and 40),
  team           text        not null check (char_length(team) between 1 and 200),
  created_at     timestamptz not null default now()
);
alter table public.team_leaders enable row level security;

-- Small key/value store. Holds the TL invite token.
create table if not exists public.app_settings (
  key        text primary key,
  value      text        not null,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;

-- One seat per agent: tickets, invited-by and amount are gone; the TL takes their place.
alter table public.registrations
  drop column if exists invited_by,
  drop column if exists number_of_tickets,
  drop column if exists total_amount,
  add column if not exists contact_number   text,
  add column if not exists team_leader_id   bigint references public.team_leaders (id) on delete restrict,
  add column if not exists team_leader_name text,
  add column if not exists confirmed_at     timestamptz;

drop index if exists public.registrations_email_idx;
create unique index if not exists registrations_email_key on public.registrations (lower(email));
create index if not exists registrations_team_leader_idx on public.registrations (team_leader_id);
