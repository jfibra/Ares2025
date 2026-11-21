-- Details the agent types in when registering (the rest comes from the agent directory).
-- Nullable so rows registered before this existed stay valid; the API requires all three.
alter table public.registrations
  add column if not exists birth_date      date,
  add column if not exists whatsapp_number text check (whatsapp_number is null or char_length(whatsapp_number) between 7 and 20),
  add column if not exists polo_shirt_size text check (polo_shirt_size is null or polo_shirt_size in ('XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'));
