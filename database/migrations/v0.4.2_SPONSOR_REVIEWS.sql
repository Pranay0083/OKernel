-- MIGRATION: Sponsor Reviews System
-- Run this in Supabase SQL Editor.

create table if not exists public.sponsor_reviews (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    message text,
    amount numeric default 0,
    is_visible boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.sponsor_reviews enable row level security;

-- Drop existng policies (safety check)
drop policy if exists "Allow public read access to sponsor_reviews" on public.sponsor_reviews;
drop policy if exists "Allow admins to manage sponsor_reviews" on public.sponsor_reviews;

-- Policy: Everyone can READ (public)
create policy "Allow public read access to sponsor_reviews"
on public.sponsor_reviews for select
to anon, authenticated
using (true);

-- Policy: Only Admins can MANAGE (Insert, Update, Delete)
create policy "Allow admins to manage sponsor_reviews"
on public.sponsor_reviews for all
to authenticated
using ( is_admin() )
with check ( is_admin() );

-- Seed Data (Empty for now as requested, but good to have a comment)
-- No initial seed data for reviews, will start with 0.
