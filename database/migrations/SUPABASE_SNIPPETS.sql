-- SQL Migration: Snippets Table
-- Use this in your Supabase SQL Editor to enable snippet persistence.

create table if not exists public.snippets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  code text not null,
  language text not null,
  name text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.snippets enable row level security;

-- Policies
create policy "Users can view their own snippets"
on public.snippets for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own snippets"
on public.snippets for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own snippets"
on public.snippets for update
to authenticated
using (auth.uid() = user_id);

create policy "Users can delete their own snippets"
on public.snippets for delete
to authenticated
using (auth.uid() = user_id);

-- Index for fast user_id lookups
create index if not exists snippets_user_id_idx on public.snippets (user_id);
