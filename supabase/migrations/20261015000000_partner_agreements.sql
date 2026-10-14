-- Partner marketplace is contract-gated and disabled by default. No transaction path exists.
create table if not exists public.partner_agreements (
  id uuid primary key default gen_random_uuid(),
  partner_id text not null check (char_length(partner_id) between 1 and 120),
  partner_name text not null check (char_length(partner_name) between 1 and 160),
  status text not null default 'pending' check (status in ('pending','active','suspended','expired')),
  signed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integration_feature_flags (
  key text primary key,
  enabled boolean not null default false,
  requires_partner_agreement boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.integration_feature_flags(key, enabled, requires_partner_agreement)
values ('partner_marketplace', false, true)
on conflict (key) do nothing;

alter table public.partner_agreements enable row level security;
alter table public.integration_feature_flags enable row level security;

-- Admin UI remains read-only unless the JWT carries an explicit admin role.
drop policy if exists "partner_admin_read" on public.partner_agreements;
create policy "partner_admin_read" on public.partner_agreements for select using ((auth.jwt() ->> 'role') = 'admin');
drop policy if exists "partner_admin_write" on public.partner_agreements;
create policy "partner_admin_write" on public.partner_agreements for all using ((auth.jwt() ->> 'role') = 'admin') with check ((auth.jwt() ->> 'role') = 'admin');
drop policy if exists "feature_flags_authenticated_read" on public.integration_feature_flags;
create policy "feature_flags_authenticated_read" on public.integration_feature_flags for select to authenticated using (true);
revoke all on table public.partner_agreements from anon;
revoke all on table public.integration_feature_flags from anon;
grant select, insert, update, delete on public.partner_agreements to authenticated;
grant select on public.integration_feature_flags to authenticated;

alter table public.workflow_runs drop constraint if exists workflow_runs_status_check;
alter table public.workflow_runs add constraint workflow_runs_status_check check (status in ('draft','queued','awaiting-consent','running','awaiting-user','completed','cancelled','failed'));
