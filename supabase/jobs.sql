-- 1. Create jobs table
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  file_url text not null,
  status text not null check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS on jobs table
alter table public.jobs enable row level security;

-- 3. RLS Policies for jobs
create policy "Clients can insert their own jobs" on public.jobs
  for insert with check (auth.uid() = user_id);

create policy "Clients can view their own jobs" on public.jobs
  for select using (auth.uid() = user_id);

-- Admin & Transcriber policies (for future use/dashboard)
create policy "Admins and Transcribers can view all jobs" on public.jobs
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and role in ('admin', 'transcriber')
    )
  );

create policy "Admins and Transcribers can update pending/in_progress jobs" on public.jobs
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and role in ('admin', 'transcriber')
    )
  );

-- 4. Create storage bucket for audio-files
insert into storage.buckets (id, name, public) 
values ('audio-files', 'audio-files', false)
on conflict do nothing;

-- 5. RLS Policies for audio-files bucket
create policy "Users can upload their own audio files"
  on storage.objects for insert
  with check (
    bucket_id = 'audio-files' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view their own audio files"
  on storage.objects for select
  using (
    bucket_id = 'audio-files' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins and transcribers can view any audio files"
  on storage.objects for select
  using (
    bucket_id = 'audio-files' and 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and role in ('admin', 'transcriber')
    )
  );
