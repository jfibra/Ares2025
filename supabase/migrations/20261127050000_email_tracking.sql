-- Remembers which emails were sent, so nobody is emailed twice.
-- invited_at: when an ARES 2025 attendee was sent the invitation to register first.
-- confirmation_emailed_at: when a registrant was sent "your payment reached the admin, you are registered".
alter table public.ares_2025_attendees add column if not exists invited_at timestamptz;
alter table public.registrations add column if not exists confirmation_emailed_at timestamptz;

notify pgrst, 'reload schema';
