-- Saved Gardens junction table
-- Links users to gardens they have saved/favorited

create table if not exists public.saved_gardens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  garden_id uuid references public.gardens(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, garden_id)
);

-- Enable RLS
alter table public.saved_gardens enable row level security;

-- Users can only see their own saved gardens
create policy "Users can view own saved gardens"
  on public.saved_gardens for select
  using (auth.uid() = user_id);

-- Users can only save gardens for themselves
create policy "Users can insert own saved gardens"
  on public.saved_gardens for insert
  with check (auth.uid() = user_id);

-- Users can only remove their own saved gardens
create policy "Users can delete own saved gardens"
  on public.saved_gardens for delete
  using (auth.uid() = user_id);
