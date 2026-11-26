-- A team leader's Facebook link, shown to their agents next to the payment details
-- so the agents can contact them. Asked for in the portal right after the payment details.
alter table public.team_leaders
  add column if not exists facebook_url text check (facebook_url is null or char_length(facebook_url) between 10 and 300);

notify pgrst, 'reload schema';
