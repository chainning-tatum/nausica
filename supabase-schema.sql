-- Nausica schema
-- Run this in your Supabase SQL editor

-- Prompts table: one prompt per day
create table prompts (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  date date not null unique,
  created_at timestamptz default now()
);

-- Entries table
create table entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  prompt_id uuid references prompts(id) on delete cascade,
  content text not null,
  visibility text not null default 'private' check (visibility in ('private', 'public', 'anonymous')),
  word_count int generated always as (array_length(regexp_split_to_array(trim(content), '\s+'), 1)) stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, prompt_id)
);

-- RLS policies
alter table prompts enable row level security;
alter table entries enable row level security;

-- Anyone can read prompts
create policy "Prompts are public" on prompts
  for select using (true);

-- Users can read their own entries
create policy "Users can read own entries" on entries
  for select using (auth.uid() = user_id);

-- Public and anonymous entries are readable by everyone
create policy "Public entries are readable" on entries
  for select using (visibility in ('public', 'anonymous'));

-- Users can insert their own entries
create policy "Users can insert own entries" on entries
  for insert with check (auth.uid() = user_id);

-- Users can update their own entries
create policy "Users can update own entries" on entries
  for update using (auth.uid() = user_id);

-- Users can delete their own entries
create policy "Users can delete own entries" on entries
  for delete using (auth.uid() = user_id);

-- Seed some prompts
insert into prompts (text, date) values
  ('What are you quietly proud of that no one else knows about?', current_date),
  ('Describe a moment this week where time felt different.', current_date + 1),
  ('What would you do with one hour completely alone and unobserved?', current_date + 2),
  ('What belief have you changed your mind on in the last year?', current_date + 3),
  ('Write about something you keep meaning to say but haven''t.', current_date + 4),
  ('What does your ideal ordinary day look like?', current_date + 5),
  ('What are you avoiding right now, and why?', current_date + 6);
