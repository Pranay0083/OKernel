-- MIGRATION: SQL Execution Function (God Mode)
-- Run this in Supabase SQL Editor

-- 1. Create the exec_sql function
-- This allows admins to run ANY query and get JSON back.
-- SECURITY DEFINER: Runs with permissions of the creator (postgres/admin), bypassing RLS.
-- This is strictly protected by the is_admin() check.

create or replace function exec_sql(query text)
returns json as $$
declare
  result json;
begin
  -- 1. Strict Access Control
  if not is_admin() then
    raise exception 'Access Denied: Admin privileges required.';
  end if;

  -- 2. Execute the query and capture result as JSON
  -- We wrap the user's query in a SELECT json_agg(...) wrapper
  execute format('select json_agg(t) from (%s) t', query) into result;

  -- 3. Return empty array if null
  if result is null then
    result := '[]'::json;
  end if;

  return result;
exception when others then
  -- Return the error message as a JSON object so the UI can display it
  return json_build_object('error', SQLERRM);
end;
$$ language plpgsql security definer;
