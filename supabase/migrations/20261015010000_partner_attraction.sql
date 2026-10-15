alter table public.partner_agreements add column if not exists revenue_share_pct numeric(5,2) not null default 0 check (revenue_share_pct >= 0 and revenue_share_pct <= 100);
alter table public.partner_agreements add column if not exists allowed_actions jsonb not null default '[]'::jsonb;
alter table public.partner_agreements drop constraint if exists partner_agreements_status_check;
alter table public.partner_agreements add constraint partner_agreements_status_check check (status in ('draft','pending','signed','suspended','expired'));

create or replace function public.partner_marketplace_is_enabled()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.integration_feature_flags f
    where f.key = 'partner_marketplace' and f.enabled = true
  ) and exists (
    select 1 from public.partner_agreements a
    where a.status = 'signed' and (a.expires_at is null or a.expires_at > now())
  );
$$;
revoke all on function public.partner_marketplace_is_enabled() from public;
grant execute on function public.partner_marketplace_is_enabled() to authenticated;
