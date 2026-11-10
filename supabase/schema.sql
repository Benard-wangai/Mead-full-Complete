-- Mead social platform schema. Run in the Supabase SQL editor (once per project).
-- Enables RLS so the anon/authenticated keys cannot read other users' private data.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text,
  username text unique,
  full_name text,
  bio text,
  avatar_url text,
  language text default 'en',
  country_code text,
  push_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists language text;
alter table public.profiles add column if not exists country_code text;
alter table public.profiles add column if not exists push_token text;

create unique index if not exists profiles_username_key on public.profiles (username) where username is not null;

-- ---------------------------------------------------------------------------
-- Social graph + content
-- ---------------------------------------------------------------------------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null default '',
  media_url text,
  media_type text,
  kind text not null default 'post',
  target_type text not null default 'worldwide',
  target_countries text[],
  is_boosted boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.brews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  caption text,
  media_url text,
  media_type text,
  target_type text,
  target_countries text[],
  is_paid boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  caption text,
  video_url text not null,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Messaging
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'direct',
  name text,
  created_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Groups, marketplace, live, votes, etc.
-- ---------------------------------------------------------------------------
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  creator_id uuid references public.profiles (id) on delete set null,
  is_private boolean not null default false,
  is_mega boolean not null default false,
  category text default 'General',
  member_count integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.groups add column if not exists creator_id uuid;
alter table public.groups add column if not exists image_url text;
alter table public.groups add column if not exists is_private boolean default false;
alter table public.groups add column if not exists is_mega boolean default false;
alter table public.groups add column if not exists category text;
alter table public.groups add column if not exists member_count integer default 1;

create table if not exists public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  price numeric not null,
  currency text not null default 'USD',
  image_url text,
  images text[],
  location text,
  category text default 'General',
  stock integer not null default 1,
  seller_name text,
  rating numeric default 0,
  is_verified boolean default false,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists seller_id uuid;
alter table public.products add column if not exists images text[];
alter table public.products add column if not exists category text;
alter table public.products add column if not exists status text default 'active';

create table if not exists public.escrow_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id text,
  buyer_id uuid references public.profiles (id) on delete set null,
  seller_id uuid references public.profiles (id) on delete set null,
  amount numeric not null,
  commission numeric,
  currency text default 'USD',
  status text not null default 'pending',
  paystack_reference text,
  created_at timestamptz not null default now(),
  released_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text,
  title text,
  body text,
  data jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid references public.profiles (id) on delete set null,
  options jsonb not null default '[]'::jsonb,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.user_votes (
  vote_id uuid not null references public.votes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  option_index integer not null,
  created_at timestamptz not null default now(),
  primary key (vote_id, user_id)
);

create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  is_live boolean not null default true,
  viewer_count integer not null default 0,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.live_comments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.mead_together_rooms (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references public.profiles (id) on delete set null,
  title text,
  activity_type text,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

create table if not exists public.mead_together_participants (
  room_id uuid not null references public.mead_together_rooms (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (room_id, user_id)
);

create table if not exists public.game_rooms (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references public.profiles (id) on delete set null,
  title text not null,
  game_type text default 'lobby',
  is_open boolean default true,
  created_at timestamptz not null default now()
);

create table if not exists public.call_sessions (
  id uuid primary key default gen_random_uuid(),
  caller_id uuid not null references public.profiles (id) on delete cascade,
  callee_id uuid not null references public.profiles (id) on delete cascade,
  is_video boolean not null default false,
  status text not null default 'ringing',
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.media_library (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete cascade,
  kind text not null,
  title text not null,
  artist text,
  year integer,
  cover_url text,
  media_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  target_type text,
  target_id uuid,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_backups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  reference text unique,
  feature text,
  amount integer,
  status text,
  raw jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Profile auto-create
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, phone, full_name, language, username)
  values (
    new.id,
    new.phone,
    coalesce(new.raw_user_meta_data->>'full_name', 'Mead member'),
    coalesce(new.raw_user_meta_data->>'language', 'en'),
    'user_' || substr(replace(new.id::text, '-', ''), 1, 10)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.touch_conversation()
returns trigger
language plpgsql
as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_message_inserted on public.messages;
create trigger on_message_inserted
  after insert on public.messages
  for each row execute procedure public.touch_conversation();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.posts enable row level security;
alter table public.brews enable row level security;
alter table public.reels enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.products enable row level security;
alter table public.escrow_transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.votes enable row level security;
alter table public.user_votes enable row level security;
alter table public.live_sessions enable row level security;
alter table public.live_comments enable row level security;
alter table public.mead_together_rooms enable row level security;
alter table public.mead_together_participants enable row level security;
alter table public.game_rooms enable row level security;
alter table public.call_sessions enable row level security;
alter table public.media_library enable row level security;
alter table public.content_reports enable row level security;
alter table public.user_backups enable row level security;
alter table public.payment_events enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','follows','posts','brews','reels','likes','comments',
    'conversations','conversation_participants','messages','groups','group_members',
    'products','escrow_transactions','notifications','votes','user_votes',
    'live_sessions','live_comments','mead_together_rooms','mead_together_participants',
    'game_rooms','call_sessions','media_library','content_reports','user_backups','payment_events'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || '_select', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_update', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete', t);
  end loop;
end $$;

create policy profiles_select on public.profiles for select to authenticated using (true);
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_insert on public.profiles for insert to authenticated with check (id = auth.uid());

create policy follows_select on public.follows for select to authenticated using (true);
create policy follows_insert on public.follows for insert to authenticated with check (follower_id = auth.uid());
create policy follows_delete on public.follows for delete to authenticated using (follower_id = auth.uid());

create policy posts_select on public.posts for select to authenticated using (true);
create policy posts_insert on public.posts for insert to authenticated with check (user_id = auth.uid());
create policy posts_delete on public.posts for delete to authenticated using (user_id = auth.uid());

create policy brews_select on public.brews for select to authenticated using (true);
create policy brews_insert on public.brews for insert to authenticated with check (user_id = auth.uid());

create policy reels_select on public.reels for select to authenticated using (true);
create policy reels_insert on public.reels for insert to authenticated with check (user_id = auth.uid());
create policy reels_delete on public.reels for delete to authenticated using (user_id = auth.uid());

create policy likes_select on public.likes for select to authenticated using (true);
create policy likes_insert on public.likes for insert to authenticated with check (user_id = auth.uid());
create policy likes_delete on public.likes for delete to authenticated using (user_id = auth.uid());

create policy comments_select on public.comments for select to authenticated using (true);
create policy comments_insert on public.comments for insert to authenticated with check (user_id = auth.uid());
create policy comments_delete on public.comments for delete to authenticated using (user_id = auth.uid());

create policy conversations_select on public.conversations for select to authenticated
  using (exists (select 1 from public.conversation_participants p where p.conversation_id = id and p.user_id = auth.uid()));
create policy conversations_insert on public.conversations for insert to authenticated with check (created_by = auth.uid());
create policy conversations_update on public.conversations for update to authenticated
  using (exists (select 1 from public.conversation_participants p where p.conversation_id = id and p.user_id = auth.uid()));

create policy conversation_participants_select on public.conversation_participants for select to authenticated
  using (user_id = auth.uid() or exists (
    select 1 from public.conversation_participants p
    where p.conversation_id = conversation_id and p.user_id = auth.uid()
  ));
create policy conversation_participants_insert on public.conversation_participants for insert to authenticated
  with check (user_id = auth.uid() or exists (
    select 1 from public.conversations c where c.id = conversation_id and c.created_by = auth.uid()
  ));

create policy messages_select on public.messages for select to authenticated
  using (exists (select 1 from public.conversation_participants p where p.conversation_id = conversation_id and p.user_id = auth.uid()));
create policy messages_insert on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and exists (
    select 1 from public.conversation_participants p where p.conversation_id = conversation_id and p.user_id = auth.uid()
  ));

create policy groups_select on public.groups for select to authenticated using (true);
create policy groups_insert on public.groups for insert to authenticated with check (creator_id = auth.uid());
create policy groups_update on public.groups for update to authenticated using (creator_id = auth.uid());

create policy group_members_select on public.group_members for select to authenticated using (true);
create policy group_members_insert on public.group_members for insert to authenticated with check (user_id = auth.uid());
create policy group_members_delete on public.group_members for delete to authenticated using (user_id = auth.uid());

create policy products_select on public.products for select to authenticated using (true);
create policy products_insert on public.products for insert to authenticated with check (seller_id = auth.uid());
create policy products_update on public.products for update to authenticated using (seller_id = auth.uid());

create policy escrow_select on public.escrow_transactions for select to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy escrow_insert on public.escrow_transactions for insert to authenticated
  with check (buyer_id = auth.uid());
create policy escrow_update on public.escrow_transactions for update to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

create policy notifications_select on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_insert on public.notifications for insert to authenticated with check (true);
create policy notifications_update on public.notifications for update to authenticated using (user_id = auth.uid());

create policy votes_select on public.votes for select to authenticated using (true);
create policy votes_insert on public.votes for insert to authenticated with check (created_by = auth.uid());
create policy user_votes_select on public.user_votes for select to authenticated using (true);
create policy user_votes_insert on public.user_votes for insert to authenticated with check (user_id = auth.uid());

create policy live_sessions_select on public.live_sessions for select to authenticated using (true);
create policy live_sessions_insert on public.live_sessions for insert to authenticated with check (host_id = auth.uid());
create policy live_sessions_update on public.live_sessions for update to authenticated using (host_id = auth.uid());
create policy live_comments_select on public.live_comments for select to authenticated using (true);
create policy live_comments_insert on public.live_comments for insert to authenticated with check (user_id = auth.uid());

create policy mead_together_rooms_select on public.mead_together_rooms for select to authenticated using (true);
create policy mead_together_rooms_insert on public.mead_together_rooms for insert to authenticated with check (host_id = auth.uid());
create policy mead_together_participants_select on public.mead_together_participants for select to authenticated using (true);
create policy mead_together_participants_insert on public.mead_together_participants for insert to authenticated with check (user_id = auth.uid());

create policy game_rooms_select on public.game_rooms for select to authenticated using (true);
create policy game_rooms_insert on public.game_rooms for insert to authenticated with check (host_id = auth.uid());
create policy game_rooms_update on public.game_rooms for update to authenticated using (host_id = auth.uid());

create policy call_sessions_select on public.call_sessions for select to authenticated
  using (caller_id = auth.uid() or callee_id = auth.uid());
create policy call_sessions_insert on public.call_sessions for insert to authenticated with check (caller_id = auth.uid());
create policy call_sessions_update on public.call_sessions for update to authenticated
  using (caller_id = auth.uid() or callee_id = auth.uid());

create policy media_library_select on public.media_library for select to authenticated using (true);
create policy media_library_insert on public.media_library for insert to authenticated with check (owner_id = auth.uid());

create policy content_reports_insert on public.content_reports for insert to authenticated with check (reporter_id = auth.uid());
create policy content_reports_select on public.content_reports for select to authenticated using (reporter_id = auth.uid());

create policy user_backups_select on public.user_backups for select to authenticated using (user_id = auth.uid());
create policy user_backups_insert on public.user_backups for insert to authenticated with check (user_id = auth.uid());

create policy payment_events_select on public.payment_events for select to authenticated using (user_id = auth.uid());

-- Storage buckets (ids must match client uploads)
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('group-avatars', 'group-avatars', true),
  ('brews', 'brews', true),
  ('posts', 'posts', true),
  ('reels', 'reels', true),
  ('products', 'products', true),
  ('media', 'media', true)
on conflict (id) do nothing;
