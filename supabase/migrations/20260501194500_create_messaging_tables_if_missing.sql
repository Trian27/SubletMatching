-- Repair migration for projects where the profiles/listings migration was applied
-- before messaging tables were created. This is idempotent and does not create
-- duplicate tables or duplicate policies.

create extension if not exists pgcrypto;

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

notify pgrst, 'reload schema';
