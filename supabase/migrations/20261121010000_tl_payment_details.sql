-- Where agents send their registration fee: each team leader's own account and/or QR code.
alter table public.team_leaders
  add column if not exists payment_bank           text check (payment_bank is null or char_length(payment_bank) <= 80),
  add column if not exists payment_account_name   text check (payment_account_name is null or char_length(payment_account_name) <= 120),
  add column if not exists payment_account_number text check (payment_account_number is null or char_length(payment_account_number) <= 60),
  add column if not exists payment_qr_path        text;   -- file in the private "tl-payment-qr" bucket

-- Private storage for the QR images: 5 MB, images only. Shown through signed links from the server.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tl-payment-qr', 'tl-payment-qr', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

notify pgrst, 'reload schema';
