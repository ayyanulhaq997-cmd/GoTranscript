-- 1. Create a table for profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text not null check (role in ('client', 'transcriber', 'admin')) default 'client',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Create policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- 4. Create a trigger to automatically create a profile for every new user
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'client');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 5. Attach the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
