-- Create a table to store execution traces
create table if not exists public.execution_traces (
  id uuid default gen_random_uuid() primary key,
  job_id text not null,
  trace_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.execution_traces enable row level security;

-- Allow public read access (for now, or restrict to auth users)
create policy "Allow public read access" on public.execution_traces
  for select using (true);

-- Allow authenticated insert (or service role)
-- Assuming backend uses service role or anon key with policy
create policy "Allow insert" on public.execution_traces
  for insert with check (true);

-- Create index on job_id for fast lookups
create index if not exists execution_traces_job_id_idx on public.execution_traces (job_id);
