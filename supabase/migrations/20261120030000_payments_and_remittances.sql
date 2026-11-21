-- Payment tracking. No money moves through the site; this only records what happened.
--
--   unpaid      agent registered, has not paid their team leader (TL)
--   paid_to_tl  TL confirmed they received the agent's fee
--   remitted    TL recorded sending the money to the organizer (one remittance, many agents)
--   verified    an admin confirmed the remittance arrived

alter table public.registrations
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid_to_tl', 'remitted', 'verified')),
  add column if not exists amount        numeric(12, 2),   -- the fee at the moment the TL confirmed
  add column if not exists remittance_id bigint;

-- Anyone already confirmed before payments existed counts as paid to their TL.
update public.registrations set payment_status = 'paid_to_tl' where confirmed_by_tl and payment_status = 'unpaid';

create table if not exists public.remittances (
  id               bigint generated always as identity primary key,
  team_leader_id   bigint      not null references public.team_leaders (id) on delete restrict,
  team_leader_name text        not null,
  agent_count      integer     not null check (agent_count > 0),
  amount           numeric(12, 2) not null check (amount >= 0),
  method           text        not null check (char_length(method) between 1 and 60),
  reference_no     text        not null check (char_length(reference_no) between 1 and 120),
  receipt_path     text,                               -- file in the private "remittance-receipts" bucket
  status           text        not null default 'submitted' check (status in ('submitted', 'verified', 'rejected')),
  admin_note       text,
  submitted_at     timestamptz not null default now(),
  reviewed_at      timestamptz,
  reviewed_by      text
);
alter table public.remittances enable row level security;
create index if not exists remittances_team_leader_idx on public.remittances (team_leader_id);

do $$ begin
  alter table public.registrations
    add constraint registrations_remittance_fk foreign key (remittance_id) references public.remittances (id) on delete set null;
exception when duplicate_object then null; end $$;
create index if not exists registrations_remittance_idx on public.registrations (remittance_id);

-- A TL sends the money for some of their agents. All or nothing.
create or replace function public.create_remittance(
  p_team_leader_id bigint, p_registration_ids bigint[], p_method text, p_reference_no text, p_receipt_path text
) returns public.remittances language plpgsql as $$
declare
  v_ids    bigint[];
  v_leader public.team_leaders;
  v_count  integer;
  v_amount numeric;
  v_row    public.remittances;
begin
  select array_agg(distinct x) into v_ids from unnest(p_registration_ids) as x;
  if v_ids is null then raise exception 'NO_AGENTS'; end if;
  select * into v_leader from public.team_leaders where id = p_team_leader_id;
  if not found then raise exception 'NO_LEADER'; end if;

  perform 1 from public.registrations where id = any (v_ids) for update;
  select count(*), coalesce(sum(amount), 0) into v_count, v_amount
    from public.registrations
   where id = any (v_ids) and team_leader_id = p_team_leader_id and payment_status = 'paid_to_tl';
  if v_count <> array_length(v_ids, 1) then raise exception 'AGENTS_NOT_ELIGIBLE'; end if;

  insert into public.remittances (team_leader_id, team_leader_name, agent_count, amount, method, reference_no, receipt_path)
  values (p_team_leader_id, v_leader.name, v_count, v_amount, p_method, p_reference_no, p_receipt_path)
  returning * into v_row;

  update public.registrations set payment_status = 'remitted', remittance_id = v_row.id where id = any (v_ids);
  return v_row;
end $$;

-- An admin accepts or rejects a remittance. Rejecting hands the agents back to the TL.
create or replace function public.review_remittance(p_id bigint, p_verified boolean, p_note text, p_reviewer text)
returns public.remittances language plpgsql as $$
declare
  v_row public.remittances;
begin
  select * into v_row from public.remittances where id = p_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_row.status <> 'submitted' then raise exception 'ALREADY_REVIEWED'; end if;

  update public.remittances
     set status = case when p_verified then 'verified' else 'rejected' end,
         admin_note = nullif(btrim(coalesce(p_note, '')), ''),
         reviewed_at = now(),
         reviewed_by = p_reviewer
   where id = p_id
  returning * into v_row;

  if p_verified then
    update public.registrations set payment_status = 'verified' where remittance_id = p_id;
  else
    update public.registrations set payment_status = 'paid_to_tl', remittance_id = null where remittance_id = p_id;
  end if;
  return v_row;
end $$;

-- Only the server (secret key) may run these.
revoke all on function public.create_remittance(bigint, bigint[], text, text, text) from public, anon, authenticated;
revoke all on function public.review_remittance(bigint, boolean, text, text) from public, anon, authenticated;
grant execute on function public.create_remittance(bigint, bigint[], text, text, text) to service_role;
grant execute on function public.review_remittance(bigint, boolean, text, text) to service_role;

-- Private storage for receipt photos: 5 MB, images or PDF. Read only through signed links from the server.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('remittance-receipts', 'remittance-receipts', false, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'])
on conflict (id) do nothing;

notify pgrst, 'reload schema';
