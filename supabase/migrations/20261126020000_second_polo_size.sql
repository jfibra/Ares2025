-- When both people on a couple's record are joining, each gets a polo shirt:
-- polo_shirt_size is the first person's size, polo_shirt_size_2 the second person's.
alter table public.registrations
  add column if not exists polo_shirt_size_2 text
    check (polo_shirt_size_2 is null or polo_shirt_size_2 in ('XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'));

notify pgrst, 'reload schema';
