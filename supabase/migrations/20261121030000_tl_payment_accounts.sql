-- A team leader can now list several places to pay (BDO, GCash, ...), each with its own
-- account details and/or QR code. Replaces the single set of payment_* columns on team_leaders.
create table if not exists public.team_leader_payment_accounts (
  id             bigint generated always as identity primary key,
  team_leader_id bigint      not null references public.team_leaders (id) on delete cascade,
  bank           text        not null check (char_length(bank) between 1 and 80),
  account_name   text                 check (account_name is null or char_length(account_name) <= 120),
  account_number text                 check (account_number is null or char_length(account_number) <= 60),
  qr_path        text,                -- file in the private "tl-payment-qr" bucket
  created_at     timestamptz not null default now(),
  check (account_number is not null or qr_path is not null)
);
alter table public.team_leader_payment_accounts enable row level security;
create index if not exists team_leader_payment_accounts_leader_idx on public.team_leader_payment_accounts (team_leader_id);

-- Carry over what team leaders already saved, then drop the old single-account columns.
do $$ begin
  if exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'team_leaders' and column_name = 'payment_qr_path') then
    insert into public.team_leader_payment_accounts (team_leader_id, bank, account_name, account_number, qr_path)
    select id, coalesce(nullif(btrim(payment_bank), ''), 'Payment account'), payment_account_name, payment_account_number, payment_qr_path
      from public.team_leaders
     where payment_account_number is not null or payment_qr_path is not null;
  end if;
end $$;

alter table public.team_leaders
  drop column if exists payment_bank,
  drop column if exists payment_account_name,
  drop column if exists payment_account_number,
  drop column if exists payment_qr_path;

notify pgrst, 'reload schema';
