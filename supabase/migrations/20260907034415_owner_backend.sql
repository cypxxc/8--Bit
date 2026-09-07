create table public.shop_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.shop_services (
  id text primary key,
  group_id text not null check (group_id in ('software','upgrade','care','password')),
  name text not null check (char_length(name) between 1 and 200),
  description text not null default '',
  price numeric(10,2) check (price >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  version integer not null default 1,
  updated_at timestamptz not null default now()
);
create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  ticket_code text not null unique default ('8BIT-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
  idempotency_key uuid not null unique,
  source text not null check (source in ('web','store')),
  customer_name text not null,
  phone text not null,
  line_id text not null default '',
  device_type text not null,
  device_model text not null default '',
  accessories text not null default '',
  service_ids text[] not null,
  service_names text[] not null,
  description text not null default '',
  internal_notes text not null default '',
  quoted_price numeric(10,2) check (quoted_price >= 0),
  status text not null default 'pending' check (status in ('pending','received','working','ready','delivered','cancelled')),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index service_requests_status_created on public.service_requests(status,created_at desc);
create index service_requests_created on public.service_requests(created_at desc);
create table public.line_notifications (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','sending','accepted','failed','uncertain','skipped')),
  attempts integer not null default 0,
  retry_key uuid not null default gen_random_uuid(),
  detail text not null default '',
  last_attempt_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.shop_rate_limits (
  key text primary key,
  hits integer not null,
  started_at timestamptz not null default now()
);
create function public.shop_consume_limit(p_key text, p_max integer, p_seconds integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare n integer;
begin
  delete from public.shop_rate_limits where started_at < now() - interval '1 day';
  insert into public.shop_rate_limits(key,hits,started_at) values(p_key,1,now())
  on conflict(key) do update set
    hits = case when shop_rate_limits.started_at < now()-make_interval(secs=>p_seconds) then 1 else shop_rate_limits.hits+1 end,
    started_at = case when shop_rate_limits.started_at < now()-make_interval(secs=>p_seconds) then now() else shop_rate_limits.started_at end
  returning hits into n;
  return n <= p_max;
end;
$$;
create function public.shop_queue_notification() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if new.source = 'web' then
    insert into public.line_notifications(request_id) values(new.id);
  end if;
  return new;
end;
$$;
create trigger queue_service_notification after insert on public.service_requests
for each row execute function public.shop_queue_notification();

-- Only the authenticated, authorized server accesses these tables.
-- No direct browser access to customer data, even for signed-in users.
alter table public.shop_admins enable row level security;
alter table public.shop_services enable row level security;
alter table public.service_requests enable row level security;
alter table public.line_notifications enable row level security;
alter table public.shop_rate_limits enable row level security;
revoke all on public.shop_admins, public.shop_services, public.service_requests, public.line_notifications, public.shop_rate_limits from anon, authenticated;
grant all on public.shop_admins, public.shop_services, public.service_requests, public.line_notifications, public.shop_rate_limits to service_role;
revoke all on function public.shop_consume_limit(text,integer,integer) from public, anon, authenticated;
revoke all on function public.shop_queue_notification() from public, anon, authenticated;
grant execute on function public.shop_consume_limit(text,integer,integer) to service_role;
grant execute on function public.shop_queue_notification() to service_role;
