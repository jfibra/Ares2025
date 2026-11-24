-- Where team leaders send the collected registration fees: the organizer's own accounts
-- (BDO, GCash, ...), each with account details and/or a QR code. Managed by admins in Settings.
create table if not exists public.admin_payment_accounts (
  id             bigint generated always as identity primary key,
  bank           text        not null check (char_length(bank) between 1 and 80),
  account_name   text                 check (account_name is null or char_length(account_name) <= 120),
  account_number text                 check (account_number is null or char_length(account_number) <= 60),
  qr_path        text,                -- file in the private "tl-payment-qr" bucket, under admin/
  created_at     timestamptz not null default now(),
  check (account_number is not null or qr_path is not null)
);
alter table public.admin_payment_accounts enable row level security;

notify pgrst, 'reload schema';
