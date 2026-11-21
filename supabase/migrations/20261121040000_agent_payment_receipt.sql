-- An agent who has paid their team leader can upload the receipt (and a note) from the
-- registration page. The team leader sees it before confirming the payment.
alter table public.registrations
  add column if not exists agent_receipt_path text,          -- file in the private "remittance-receipts" bucket, under agents/
  add column if not exists agent_receipt_note text check (agent_receipt_note is null or char_length(agent_receipt_note) <= 500),
  add column if not exists agent_receipt_at   timestamptz;   -- when it was uploaded; null means no receipt yet

notify pgrst, 'reload schema';
