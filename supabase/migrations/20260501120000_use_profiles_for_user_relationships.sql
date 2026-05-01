-- Use public.profiles as the app user table.
-- profiles.id stays equal to auth.users.id, so auth.uid() can be compared directly.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create unique index if not exists profiles_email_unique_idx
  on public.profiles (email)
  where email is not null;

insert into public.profiles (id, email, name, full_name)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name'),
  au.raw_user_meta_data->>'full_name'
from auth.users au
on conflict (id) do update
set
  email = coalesce(public.profiles.email, excluded.email),
  name = coalesce(public.profiles.name, excluded.name),
  full_name = coalesce(public.profiles.full_name, excluded.full_name),
  updated_at = now();

do $$
begin
  if to_regclass('public.users') is not null
    and exists (
      select 1
      from pg_attribute
      where attrelid = 'public.users'::regclass
        and attname = 'id'
        and atttypid = 'uuid'::regtype
    )
  then
    insert into public.profiles (id, email, name, full_name)
    select u.id, u.email, u.name, u.name
    from public.users u
    join auth.users au on au.id = u.id
    on conflict (id) do update
    set
      email = coalesce(public.profiles.email, excluded.email),
      name = coalesce(public.profiles.name, excluded.name),
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      updated_at = now();
  end if;
end $$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = coalesce(public.profiles.name, excluded.name),
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by authenticated users" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Profiles are readable by authenticated users"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

alter table public.listings add column if not exists address text;
alter table public.listings add column if not exists price_label text;
alter table public.listings add column if not exists baths numeric default 0 check (baths >= 0);
alter table public.listings add column if not exists images jsonb not null default '[]'::jsonb;
alter table public.listings add column if not exists available_from date;
alter table public.listings add column if not exists available_to date;
alter table public.listings add column if not exists landlord_phone text;
alter table public.listings add column if not exists landlord_email text;
alter table public.listings add column if not exists latitude numeric;
alter table public.listings add column if not exists longitude numeric;
alter table public.listings add column if not exists host_id uuid;

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    join unnest(con.conkey) as key(attnum) on true
    join pg_attribute att on att.attrelid = rel.oid and att.attnum = key.attnum
    where nsp.nspname = 'public'
      and rel.relname = 'listings'
      and con.contype = 'f'
      and att.attname = 'host_id'
  loop
    execute format('alter table public.listings drop constraint %I', constraint_record.conname);
  end loop;
end $$;

alter table public.listings
  add constraint listings_host_id_profiles_fkey
  foreign key (host_id) references public.profiles(id) on delete cascade not valid;

create index if not exists listings_host_id_idx on public.listings (host_id);

alter table public.listings enable row level security;

drop policy if exists "Public read access" on public.listings;
drop policy if exists "Authenticated users can insert" on public.listings;
drop policy if exists "Users can insert own listings" on public.listings;
drop policy if exists "Users can update own listings" on public.listings;
drop policy if exists "Users can delete own listings" on public.listings;

create policy "Public read access"
  on public.listings
  for select
  using (true);

create policy "Users can insert own listings"
  on public.listings
  for insert
  to authenticated
  with check (host_id = auth.uid());

create policy "Users can update own listings"
  on public.listings
  for update
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

create policy "Users can delete own listings"
  on public.listings
  for delete
  to authenticated
  using (host_id = auth.uid());

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists favorites_user_id_idx on public.favorites (user_id);
create index if not exists favorites_listing_id_idx on public.favorites (listing_id);
create unique index if not exists favorites_user_id_listing_id_unique_idx
  on public.favorites (user_id, listing_id);

alter table public.favorites enable row level security;

drop policy if exists "Users can read own favorites" on public.favorites;
drop policy if exists "Users can insert own favorites" on public.favorites;
drop policy if exists "Users can delete own favorites" on public.favorites;

create policy "Users can read own favorites"
  on public.favorites
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own favorites"
  on public.favorites
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can delete own favorites"
  on public.favorites
  for delete
  to authenticated
  using (user_id = auth.uid());

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, profile_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists conversations_created_by_idx on public.conversations (created_by);
create index if not exists conversation_participants_profile_id_idx
  on public.conversation_participants (profile_id);
create index if not exists messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at);
create index if not exists messages_sender_id_idx on public.messages (sender_id);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

create or replace function public.is_conversation_participant(
  conversation_id_to_check uuid,
  profile_id_to_check uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = conversation_id_to_check
      and cp.profile_id = profile_id_to_check
  );
$$;

create or replace function public.is_conversation_creator(
  conversation_id_to_check uuid,
  profile_id_to_check uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversations c
    where c.id = conversation_id_to_check
      and c.created_by = profile_id_to_check
  );
$$;

drop policy if exists "Users can create conversations" on public.conversations;
drop policy if exists "Participants can read conversations" on public.conversations;
drop policy if exists "Creators can update conversations" on public.conversations;
drop policy if exists "Users can add themselves to conversations" on public.conversation_participants;
drop policy if exists "Participants can read participants" on public.conversation_participants;
drop policy if exists "Participants can update own participant row" on public.conversation_participants;
drop policy if exists "Participants can read messages" on public.messages;
drop policy if exists "Participants can send messages" on public.messages;

create policy "Users can create conversations"
  on public.conversations
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Participants can read conversations"
  on public.conversations
  for select
  to authenticated
  using (
    created_by = auth.uid()
    or public.is_conversation_participant(id, auth.uid())
  );

create policy "Creators can update conversations"
  on public.conversations
  for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Users can add themselves to conversations"
  on public.conversation_participants
  for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    or public.is_conversation_creator(conversation_id, auth.uid())
  );

create policy "Participants can read participants"
  on public.conversation_participants
  for select
  to authenticated
  using (public.is_conversation_participant(conversation_id, auth.uid()));

create policy "Participants can update own participant row"
  on public.conversation_participants
  for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "Participants can read messages"
  on public.messages
  for select
  to authenticated
  using (public.is_conversation_participant(conversation_id, auth.uid()));

create policy "Participants can send messages"
  on public.messages
  for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_conversation_participant(conversation_id, auth.uid())
  );
