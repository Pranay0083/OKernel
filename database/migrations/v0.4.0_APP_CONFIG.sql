-- MIGRATION: App Configuration & Versioning
-- Run this in Supabase SQL Editor to enable dynamic system configuration.

create table if not exists app_config (
    key text primary key,
    value text not null,
    description text,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table app_config enable row level security;

-- Policy: Everyone can READ config (public)
create policy "Allow public read access to config"
on app_config for select
to anon, authenticated
using (true);

-- Policy: Only Admins can UPDATE config
create policy "Allow admins to update config"
on app_config for update
to authenticated
using ( is_admin() )
with check ( is_admin() );

-- Seed Data (v0.4.0)
insert into app_config (key, value, description)
values 
    ('app_version', 'v0.4.0', 'Current system version displayed in UI'),
    ('system_status', 'ONLINE', 'Global system status (ONLINE, MAINTENANCE, OFFLINE)'),
    ('motd', 'SysCore Engine Updated.', 'Message of the day')
on conflict (key) do update 
set value = excluded.value;
