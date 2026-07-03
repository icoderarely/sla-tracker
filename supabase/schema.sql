-- Client Communication & SLA Tracker schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  contact_info text,
  created_at timestamptz not null default now()
);

create table if not exists threads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  title text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  severity text check (severity in ('P0', 'P1', 'P2', 'P3')),
  tag text check (tag in ('bug', 'feature', 'question')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  sla_breach_notified_at timestamptz
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references threads (id) on delete cascade,
  body text not null,
  sent_at timestamptz not null default now(),
  sender text not null default 'me',
  is_update boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists threads_client_id_idx on threads (client_id);
create index if not exists threads_status_idx on threads (status);
create index if not exists messages_thread_id_idx on messages (thread_id);
create index if not exists messages_sent_at_idx on messages (sent_at);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Any authenticated user (single-user or small shared team) can read/write.
-- ---------------------------------------------------------------------------

alter table clients enable row level security;
alter table threads enable row level security;
alter table messages enable row level security;

drop policy if exists "authenticated full access" on clients;
create policy "authenticated full access" on clients
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated full access" on threads;
create policy "authenticated full access" on threads
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated full access" on messages;
create policy "authenticated full access" on messages
  for all
  to authenticated
  using (true)
  with check (true);
