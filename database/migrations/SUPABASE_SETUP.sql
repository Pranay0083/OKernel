-- MIGRATION: Admin Whitelist & Security
-- Run this in Supabase SQL Editor

-- 1. Create the Whitelist Table
create table if not exists admin_whitelist (
  email text primary key,
  created_at timestamptz default now()
);

-- 2. Seed the Allowed Admins
insert into admin_whitelist (email)
values 
  ('vaidityatanwar2207@gmail.com'),
  ('guptayashi11503@gmail.com')
on conflict (email) do nothing;

-- 3. ENABLE ROW LEVEL SECURITY (The "No Backdoor" Guarantee)
alter table admin_whitelist enable row level security;

-- 4. Create Policies

-- Policy A: "See Only Yourself"
-- An authenticated user can ONLY query the whitelist to see if *their own* email is present.
-- They cannot see the full list of admins.
create policy "Allow users to check their own admin status"
on admin_whitelist
for select
to authenticated
using (
  email = auth.jwt() ->> 'email'
);

-- Policy B: deny all other access to anon/authenticated (Implicit in Supabase, but good to be clear)
-- No inserts, updates, or deletes allowed for anyone except service_role.
-- Anon users cannot see this table at all.
