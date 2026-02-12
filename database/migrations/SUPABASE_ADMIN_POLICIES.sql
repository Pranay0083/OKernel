-- MIGRATION: Admin Access Policies
-- Run this in Supabase SQL Editor

-- 1. UTILITY FUNCTION (Cleaner Policies)
-- This function checks if the current user is in the admin_whitelist
create or replace function is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from admin_whitelist
    where email = auth.jwt() ->> 'email'
  );
end;
$$ language plpgsql security definer;


-- 2. UPDATE user_feedback (The Private Inbox)
-- Allow Admins to READ (Select) and DELETE
drop policy if exists "Enable select for service_role only" on user_feedback;

create policy "Allow admins to read feedback"
on user_feedback
for select
to authenticated
using ( is_admin() );

create policy "Allow admins to delete feedback"
on user_feedback
for delete
to authenticated
using ( is_admin() );


-- 3. UPDATE featured_reviews (The Public Showcase)
-- Allow Admins to INSERT (Feature) and DELETE (Remove)
drop policy if exists "Enable modification for service_role only" on featured_reviews;

create policy "Allow admins to manage featured"
on featured_reviews
for all
to authenticated
using ( is_admin() )
with check ( is_admin() );
