create table public.line_conversations (
  id uuid primary key default gen_random_uuid(),
  line_user_id text not null unique,
  display_name text not null default '',
  picture_url text,
  profile_updated_at timestamptz,
  last_message_at timestamptz,
  last_read_id bigint not null default 0,
  unread_count integer not null default 0,
  created_at timestamptz not null default now()
);
create table public.line_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.line_conversations on delete cascade,
  line_message_id text unique,
  event_id text unique,
  kind text not null,
  text text not null default '',
  metadata jsonb not null default '{}',
  unsent boolean not null default false,
  sent_at timestamptz not null,
  received_at timestamptz not null default now()
);
create index line_messages_room_time on public.line_messages(conversation_id, sent_at desc, id desc);
create index line_messages_room_id on public.line_messages(conversation_id, id);
create index line_conversations_recent on public.line_conversations(last_message_at desc nulls last, id);
create table public.line_webhook_events (
  event_id text primary key,
  received_at timestamptz not null default now()
);
create table public.line_unsent_messages (
  line_message_id text primary key,
  line_user_id text not null,
  received_at timestamptz not null default now()
);
create table public.line_inbox_state (
  id boolean primary key default true check(id),
  verified_at timestamptz not null default now(),
  message_at timestamptz
);

alter table public.line_conversations enable row level security;
alter table public.line_messages enable row level security;
alter table public.line_webhook_events enable row level security;
alter table public.line_unsent_messages enable row level security;
alter table public.line_inbox_state enable row level security;
revoke all on public.line_conversations, public.line_messages, public.line_webhook_events,
  public.line_unsent_messages, public.line_inbox_state from public, anon, authenticated;
grant all on public.line_conversations, public.line_messages, public.line_webhook_events,
  public.line_unsent_messages, public.line_inbox_state to service_role;
grant usage, select on sequence public.line_messages_id_seq to service_role;

create function public.shop_receive_line(p_event jsonb) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare
  v_room uuid; v_user text := p_event->>'userId';
  v_time timestamptz := (p_event->>'sentAt')::timestamptz;
  v_unsent boolean;
begin
  insert into public.line_webhook_events(event_id) values (p_event->>'eventId') on conflict do nothing;
  if not found then return false; end if;
  insert into public.line_conversations(line_user_id) values(v_user) on conflict do nothing;
  select id into v_room from public.line_conversations where line_user_id = v_user for update;
  if p_event->>'type' = 'unsend' then
    insert into public.line_unsent_messages(line_message_id,line_user_id)
      values(p_event->>'messageId',v_user) on conflict do nothing;
    update public.line_messages set text='', metadata='{}', unsent=true
      where conversation_id=v_room and line_message_id=p_event->>'messageId';
    return true;
  end if;
  if p_event->>'type' <> 'message' then return true; end if;
  select exists(select 1 from public.line_unsent_messages where line_message_id=p_event->>'messageId'
    and line_user_id=v_user) into v_unsent;
  insert into public.line_messages(conversation_id,line_message_id,event_id,kind,text,metadata,unsent,sent_at)
    values(v_room,p_event->>'messageId',p_event->>'eventId',p_event->>'kind',
      case when v_unsent then '' else coalesce(p_event->>'text','') end,
      case when v_unsent then '{}'::jsonb else coalesce(p_event->'metadata','{}'::jsonb) end,v_unsent,v_time)
    on conflict(line_message_id) do nothing;
  if found then
    update public.line_conversations set last_message_at=greatest(last_message_at,v_time),
      unread_count=unread_count+1 where id=v_room;
    insert into public.line_inbox_state(id,message_at) values(true,now())
      on conflict(id) do update set message_at=now(),verified_at=now();
  end if;
  return true;
end;
$$;
create function public.shop_read_line(p_room uuid, p_through bigint) returns void
language plpgsql security invoker set search_path = '' as $$
declare v_read bigint;
begin
  select last_read_id into v_read from public.line_conversations where id=p_room for update;
  if not found then return; end if;
  -- Only acknowledge a message actually belonging to this room.
  if not exists(select 1 from public.line_messages where conversation_id=p_room and id=p_through) then return; end if;
  v_read := greatest(v_read,p_through);
  update public.line_conversations set last_read_id=v_read,
    unread_count=(select count(*) from public.line_messages where conversation_id=p_room and id>v_read)
    where id=p_room;
end;
$$;
revoke all on function public.shop_receive_line(jsonb), public.shop_read_line(uuid,bigint) from public,anon,authenticated;
grant execute on function public.shop_receive_line(jsonb), public.shop_read_line(uuid,bigint) to service_role;
