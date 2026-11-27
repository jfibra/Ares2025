-- The admin also keeps a second set of payment accounts for the teams it handles directly
-- (Team Tycoons): 'general' accounts are where team leaders (and other admin-handled agents) pay,
-- 'team' accounts are shown to the agents of an admin-handled team.
alter table public.admin_payment_accounts
  add column if not exists audience text not null default 'general' check (audience in ('general', 'team'));

notify pgrst, 'reload schema';
