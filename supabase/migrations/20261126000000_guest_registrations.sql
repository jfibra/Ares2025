-- Special registration for guests: people the admin invites through a private link, whether or
-- not they are in the LR records. They pay the admin directly, so they have no team leader.
-- guest_type is null for an ordinary registration, 'lr_agent' for a guest whose email is in the
-- LR records, and 'non_lr' for a guest who is not.
alter table public.registrations
  add column if not exists guest_type text check (guest_type is null or guest_type in ('lr_agent', 'non_lr'));

notify pgrst, 'reload schema';
