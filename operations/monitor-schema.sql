-- Additive module. No existing Company tables or records are modified.
create table if not exists public.tech_monitor_targets (
  id text primary key, name text not null, url text, kind text not null default 'company',
  access_mode text not null default 'custom', owner_label text not null default 'Tech.NO-Log.IA',
  catalog_verified_at timestamptz not null default now(),
  status text not null default 'unknown' check (status in ('healthy','warning','critical','unknown')),
  checked_at timestamptz, code text, detail text, next_action text,
  http_status int, latency_ms int, healthy_streak int not null default 0,
  last_observation_id uuid
);
create table if not exists public.tech_monitor_runs (
  id uuid primary key default gen_random_uuid(), source text not null,
  target_id text references public.tech_monitor_targets(id), started_at timestamptz not null default now(),
  completed_at timestamptz, status text not null default 'running', checked_count int not null default 0, error_code text
);
create table if not exists public.tech_monitor_observations (
  id uuid primary key default gen_random_uuid(), run_id uuid not null references public.tech_monitor_runs(id),
  target_id text not null references public.tech_monitor_targets(id), checked_at timestamptz not null,
  status text not null check (status in ('healthy','warning','critical','unknown')), code text not null,
  detail text not null, next_action text not null, http_status int, latency_ms int, attempts int not null,
  unique(run_id,target_id)
);
create index if not exists tech_monitor_observations_target_time on public.tech_monitor_observations(target_id,checked_at desc);
create index if not exists tech_monitor_runs_started on public.tech_monitor_runs(started_at desc);
create table if not exists public.tech_monitor_incidents (
  id uuid primary key default gen_random_uuid(), target_id text not null references public.tech_monitor_targets(id),
  status text not null default 'open' check (status in ('open','acknowledged','resolved')),
  severity text not null, code text not null, detail text not null, next_action text not null,
  opened_at timestamptz not null, last_seen_at timestamptz not null, resolved_at timestamptz,
  observation_id uuid not null references public.tech_monitor_observations(id),
  owner_label text not null default 'Tech.NO-Log.IA'
);
create unique index if not exists tech_monitor_one_active_incident on public.tech_monitor_incidents(target_id) where status in ('open','acknowledged');
create table if not exists public.tech_monitor_actions (
  id uuid primary key default gen_random_uuid(), incident_id uuid not null references public.tech_monitor_incidents(id),
  operation_id text not null unique, actor text not null, note text not null, created_at timestamptz not null default now()
);
alter table public.tech_monitor_targets enable row level security;
alter table public.tech_monitor_runs enable row level security;
alter table public.tech_monitor_observations enable row level security;
alter table public.tech_monitor_incidents enable row level security;
alter table public.tech_monitor_actions enable row level security;
revoke all on public.tech_monitor_targets,public.tech_monitor_runs,public.tech_monitor_observations,public.tech_monitor_incidents,public.tech_monitor_actions from anon,authenticated;
grant all on public.tech_monitor_targets,public.tech_monitor_runs,public.tech_monitor_observations,public.tech_monitor_incidents,public.tech_monitor_actions to service_role;

create or replace function public.tech_monitor_begin(p_source text,p_target_id text default null) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare v_id uuid;
begin
  perform pg_advisory_xact_lock(747320260912);
  if p_source not in ('scheduled','manual','verification') then raise exception 'INVALID_SOURCE'; end if;
  if exists(select 1 from public.tech_monitor_runs where completed_at is null and started_at>now()-interval '150 seconds') then
    return jsonb_build_object('busy',true);
  end if;
  if p_source='manual' and exists(select 1 from public.tech_monitor_runs where started_at>now()-interval '30 seconds') then
    return jsonb_build_object('busy',true);
  end if;
  update public.tech_monitor_runs set status='failed',completed_at=now(),error_code='RUN_TIMEOUT' where completed_at is null;
  insert into public.tech_monitor_runs(source,target_id) values(p_source,p_target_id) returning id into v_id;
  return jsonb_build_object('id',v_id,'busy',false);
end $$;

create or replace function public.tech_monitor_record(p_run_id uuid,p_target_id text,p_status text,p_code text,p_detail text,p_next_action text,p_http_status int,p_latency_ms int,p_attempts int,p_checked_at timestamptz) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare v_observation uuid; v_target public.tech_monitor_targets%rowtype;
begin
  if p_status not in ('healthy','warning','critical','unknown') then raise exception 'INVALID_STATUS'; end if;
  if p_checked_at>now()+interval '30 seconds' then raise exception 'INVALID_TIME'; end if;
  if not exists(select 1 from public.tech_monitor_runs where id=p_run_id and completed_at is null) then raise exception 'RUN_NOT_ACTIVE'; end if;
  select * into strict v_target from public.tech_monitor_targets where id=p_target_id for update;
  insert into public.tech_monitor_observations(run_id,target_id,checked_at,status,code,detail,next_action,http_status,latency_ms,attempts)
  values(p_run_id,p_target_id,p_checked_at,p_status,p_code,p_detail,p_next_action,p_http_status,p_latency_ms,p_attempts)
  on conflict(run_id,target_id) do nothing returning id into v_observation;
  if v_observation is null then return jsonb_build_object('replayed',true); end if;
  if v_target.checked_at is not null and v_target.checked_at>p_checked_at then return jsonb_build_object('stale',true); end if;
  update public.tech_monitor_targets set status=p_status,checked_at=p_checked_at,code=p_code,detail=p_detail,next_action=p_next_action,
    http_status=p_http_status,latency_ms=p_latency_ms,last_observation_id=v_observation,
    healthy_streak=case when p_status='healthy' then healthy_streak+1 else 0 end where id=p_target_id;
  if p_status in ('critical','warning') then
    insert into public.tech_monitor_incidents(target_id,severity,code,detail,next_action,opened_at,last_seen_at,observation_id)
    values(p_target_id,p_status,p_code,p_detail,p_next_action,p_checked_at,p_checked_at,v_observation)
    on conflict(target_id) where status in ('open','acknowledged') do update set
      severity=excluded.severity,code=excluded.code,detail=excluded.detail,next_action=excluded.next_action,
      last_seen_at=excluded.last_seen_at,observation_id=excluded.observation_id;
  elsif p_status='healthy' and v_target.healthy_streak>=1 then
    update public.tech_monitor_incidents set status='resolved',resolved_at=p_checked_at,last_seen_at=p_checked_at,observation_id=v_observation
      where target_id=p_target_id and status in ('open','acknowledged');
  end if;
  return jsonb_build_object('id',v_observation);
end $$;

create or replace function public.tech_monitor_ack(p_incident_id uuid,p_operation_id text,p_actor text,p_note text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare v_id uuid;
begin
  if length(p_note)<5 or length(p_note)>2000 or length(p_actor)>160 or length(p_operation_id)<8 or length(p_operation_id)>200 then raise exception 'INVALID_ACTION'; end if;
  perform 1 from public.tech_monitor_incidents where id=p_incident_id and status in ('open','acknowledged') for update;
  if not found then raise exception 'INCIDENT_NOT_OPEN'; end if;
  if exists(select 1 from public.tech_monitor_actions where operation_id=p_operation_id and (incident_id<>p_incident_id or note<>p_note or actor<>p_actor)) then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
  insert into public.tech_monitor_actions(incident_id,operation_id,actor,note) values(p_incident_id,p_operation_id,p_actor,p_note)
    on conflict(operation_id) do nothing returning id into v_id;
  update public.tech_monitor_incidents set status='acknowledged' where id=p_incident_id;
  return jsonb_build_object('recorded',true,'replayed',v_id is null);
end $$;

revoke execute on function public.tech_monitor_begin(text,text) from public,anon,authenticated;
revoke execute on function public.tech_monitor_record(uuid,text,text,text,text,text,int,int,int,timestamptz) from public,anon,authenticated;
revoke execute on function public.tech_monitor_ack(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.tech_monitor_begin(text,text),public.tech_monitor_record(uuid,text,text,text,text,text,int,int,int,timestamptz),public.tech_monitor_ack(uuid,text,text,text) to service_role;
