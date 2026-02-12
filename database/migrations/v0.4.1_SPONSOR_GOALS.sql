-- MIGRATION: Sponsor Goals System
-- Run this in Supabase SQL Editor.

create table if not exists public.sponsor_goals (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    current_amount integer default 0,
    target_amount integer not null,
    is_active boolean default true,
    rank integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.sponsor_goals enable row level security;

-- Drop existing policies to ensure clean state
drop policy if exists "Allow public read access" on public.sponsor_goals;
drop policy if exists "Allow authenticated full access" on public.sponsor_goals;
drop policy if exists "Allow public read access to sponsor_goals" on public.sponsor_goals;
drop policy if exists "Allow admins to manage sponsor_goals" on public.sponsor_goals;

-- Policy: Everyone can READ (public)
create policy "Allow public read access to sponsor_goals"
on public.sponsor_goals for select
to anon, authenticated
using (true);

-- Policy: Only Admins can MANAGE (Insert, Update, Delete)
create policy "Allow admins to manage sponsor_goals"
on public.sponsor_goals for all
to authenticated
using ( is_admin() )
with check ( is_admin() );

-- Seed Data (Check if exists first to avoid dupes without unique constraint)
insert into public.sponsor_goals (title, description, current_amount, target_amount, rank)
select 'Server & Domain Costs', 'Annual hosting and domain renewal for hackmist.tech', 12, 50, 1
where not exists (select 1 from public.sponsor_goals where title = 'Server & Domain Costs');

insert into public.sponsor_goals (title, description, current_amount, target_amount, rank)
select 'Apple Developer Account', 'Required to sign and notarize the macOS desktop app', 0, 99, 2
where not exists (select 1 from public.sponsor_goals where title = 'Apple Developer Account');
