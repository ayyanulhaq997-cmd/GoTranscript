-- 1. Add assigned_to column to jobs table
alter table public.jobs 
add column assigned_to uuid references auth.users null;

-- 2. Update RLS policies to allow transcribers to update assigned_to
drop policy if exists "Admins and Transcribers can update pending/in_progress jobs" on public.jobs;

create policy "Admins and Transcribers can update pending/in_progress jobs" on public.jobs
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and role in ('admin', 'transcriber')
    )
  );

-- 3. Transcribers can view jobs assigned to them or pending jobs
drop policy if exists "Admins and Transcribers can view all jobs" on public.jobs;

create policy "Admins and Transcribers can view all jobs" on public.jobs
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and role in ('admin', 'transcriber')
    )
  );
