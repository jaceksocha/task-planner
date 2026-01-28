-- migration: 20260128205136_initial_schema.sql
-- purpose: create initial database schema for task planner
-- tables: profiles, categories, tasks
-- includes: rls policies, indexes, triggers

-- ============================================================================
-- trigger function: update_updated_at
-- purpose: automatically update updated_at column on row modification
-- ============================================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- table: profiles
-- purpose: store additional user data (extends auth.users)
-- ============================================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable row level security
alter table profiles enable row level security;

-- rls policies for profiles (authenticated users can only access their own data)
-- policy: select own profile
create policy profiles_select_own on profiles
  for select
  to authenticated
  using (id = auth.uid());

-- policy: insert own profile
create policy profiles_insert_own on profiles
  for insert
  to authenticated
  with check (id = auth.uid());

-- policy: update own profile
create policy profiles_update_own on profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- policy: delete own profile
create policy profiles_delete_own on profiles
  for delete
  to authenticated
  using (id = auth.uid());

-- trigger: auto-update updated_at for profiles
create trigger profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at();

-- ============================================================================
-- function: handle_new_user
-- purpose: automatically create profile when user signs up
-- ============================================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- trigger: auto-create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- ============================================================================
-- table: categories
-- purpose: group tasks by category/project
-- ============================================================================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- unique category names per user
  unique (user_id, name)
);

-- enable row level security
alter table categories enable row level security;

-- rls policies for categories (authenticated users can only access their own categories)
-- policy: select own categories
create policy categories_select_own on categories
  for select
  to authenticated
  using (user_id = auth.uid());

-- policy: insert own categories
create policy categories_insert_own on categories
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- policy: update own categories
create policy categories_update_own on categories
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- policy: delete own categories
create policy categories_delete_own on categories
  for delete
  to authenticated
  using (user_id = auth.uid());

-- index: filter categories by user
create index idx_categories_user_id on categories(user_id);

-- trigger: auto-update updated_at for categories
create trigger categories_updated_at
  before update on categories
  for each row
  execute function update_updated_at();

-- ============================================================================
-- table: tasks
-- purpose: main entity for task management
-- ============================================================================
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable row level security
alter table tasks enable row level security;

-- rls policies for tasks (authenticated users can only access their own tasks)
-- policy: select own tasks
create policy tasks_select_own on tasks
  for select
  to authenticated
  using (user_id = auth.uid());

-- policy: insert own tasks
create policy tasks_insert_own on tasks
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- policy: update own tasks
create policy tasks_update_own on tasks
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- policy: delete own tasks
create policy tasks_delete_own on tasks
  for delete
  to authenticated
  using (user_id = auth.uid());

-- indexes for common query patterns
-- index: filter tasks by user
create index idx_tasks_user_id on tasks(user_id);

-- index: filter tasks by status
create index idx_tasks_status on tasks(user_id, status);

-- index: sort tasks by due date
create index idx_tasks_due_date on tasks(user_id, due_date);

-- index: filter tasks by category
create index idx_tasks_category on tasks(category_id);

-- trigger: auto-update updated_at for tasks
create trigger tasks_updated_at
  before update on tasks
  for each row
  execute function update_updated_at();

-- ============================================================================
-- end of migration
-- ============================================================================
