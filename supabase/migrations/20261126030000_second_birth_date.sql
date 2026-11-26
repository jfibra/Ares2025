-- When both people on a couple's record are joining, each gives a birth date:
-- birth_date is the first person's, birth_date_2 the second person's.
alter table public.registrations add column if not exists birth_date_2 date;

notify pgrst, 'reload schema';
