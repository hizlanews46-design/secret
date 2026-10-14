create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id text not null check (char_length(service_id) between 1 and 80),
  service_name text not null check (char_length(service_name) between 1 and 120),
  kind text not null check (kind in ('discover', 'provision', 'rotate')),
  status text not null default 'awaiting-consent' check (status in ('queued', 'awaiting-consent', 'running', 'completed', 'cancelled', 'failed')),
  detail text not null check (char_length(detail) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (char_length(action) between 1 and 120),
  resource_type text not null check (char_length(resource_type) between 1 and 80),
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workflow_runs_user_created_idx on public.workflow_runs(user_id, created_at desc);
create index if not exists workflow_runs_user_status_idx on public.workflow_runs(user_id, status);
create index if not exists audit_events_user_created_idx on public.audit_events(user_id, created_at desc);
create index if not exists user_vault_variable_name_idx on public.user_vault(user_id, variable_name);

alter table public.workflow_runs enable row level security;
alter table public.audit_events enable row level security;

 drop policy if exists "workflow_runs_self" on public.workflow_runs;
create policy "workflow_runs_self" on public.workflow_runs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 drop policy if exists "audit_events_self" on public.audit_events;
create policy "audit_events_self" on public.audit_events for select using (auth.uid() = user_id);
drop policy if exists "audit_events_insert_self" on public.audit_events;
create policy "audit_events_insert_self" on public.audit_events for insert with check (auth.uid() = user_id);

revoke all on table public.workflow_runs, public.audit_events from anon;
grant select, insert, update on table public.workflow_runs to authenticated;
grant select, insert on table public.audit_events to authenticated;

drop trigger if exists workflow_runs_updated_at on public.workflow_runs;
create trigger workflow_runs_updated_at before update on public.workflow_runs for each row execute procedure public.set_updated_at();
