-- ARES 2027 registrations, written by the site's /api/registration route.
create table if not exists public.registrations (
  id                bigint generated always as identity primary key,
  name              text        not null check (char_length(name) between 1 and 200),
  email             text        not null check (char_length(email) between 3 and 320),
  team              text        not null check (char_length(team) between 1 and 200),
  invited_by        text                 check (invited_by is null or char_length(invited_by) <= 200),
  number_of_tickets integer     not null check (number_of_tickets between 1 and 50),
  confirmed_by_tl   boolean     not null default false,
  total_amount      numeric(12, 2),
  registration_date timestamptz not null default now()
);

create index if not exists registrations_registration_date_idx on public.registrations (registration_date desc);
create index if not exists registrations_email_idx on public.registrations (lower(email));

-- Row level security on with no policies: the publishable (browser) key can neither
-- read nor write this table. Only the server, using the secret key, can.
alter table public.registrations enable row level security;
