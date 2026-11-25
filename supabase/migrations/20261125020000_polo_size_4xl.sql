-- Polo shirts now also come in 4XL. Replace whatever check is on the column with the longer list.
do $$
declare
  found record;
begin
  for found in
    select conname from pg_constraint
    where conrelid = 'public.registrations'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%polo_shirt_size%'
  loop
    execute format('alter table public.registrations drop constraint %I', found.conname);
  end loop;
end $$;

alter table public.registrations
  add constraint registrations_polo_shirt_size_check
  check (polo_shirt_size is null or polo_shirt_size in ('XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'));

notify pgrst, 'reload schema';
