-- MIGRATION: Add Rank Column
-- Run this in Supabase SQL Editor

-- 1. Add rank column
alter table featured_reviews add column if not exists rank serial;

-- 2. Initialize rank for existing items (if any match old sorting)
-- This ensures we don't have nulls or duplicates initially
with numbered as (
  select id, row_number() over (order by created_at desc) as rn
  from featured_reviews
)
update featured_reviews
set rank = numbered.rn
from numbered
where featured_reviews.id = numbered.id;

-- 3. Policy Update (Optional but good practice)
-- Ensure Admins can UPDATE the rank
create policy "Allow admins to update rank"
on featured_reviews
for update
to authenticated
using ( is_admin() )
with check ( is_admin() );
