-- People who attended ARES 2025, by LR email. They register first: from the moment registration
-- opens until general registration opens, only emails in this list may register.
-- The admin pastes the list in from the dashboard (Settings).
create table if not exists public.ares_2025_attendees (
  email    text        primary key check (email = lower(email) and char_length(email) <= 320),
  added_at timestamptz not null default now()
);
alter table public.ares_2025_attendees enable row level security;

notify pgrst, 'reload schema';
