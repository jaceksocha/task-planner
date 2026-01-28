# Database Planning: Task Planner

## Overview

This document defines the database schema for the Task Planner application based on the requirements in `prd.md`.

---

## Entities

### 1. Users (Managed by Supabase Auth)
Supabase Auth handles user authentication. We'll create a `profiles` table to store additional user data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, FK to auth.users | User identifier |
| email | text | not null | User email (from auth) |
| display_name | text | nullable | User display name |
| created_at | timestamptz | default now() | Account creation time |
| updated_at | timestamptz | default now() | Last update time |

### 2. Categories
Groups for organizing tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Category identifier |
| user_id | uuid | FK to profiles, not null | Owner of the category |
| name | text | not null | Category name |
| color | text | nullable | Hex color code (e.g., #FF5733) |
| created_at | timestamptz | default now() | Creation time |
| updated_at | timestamptz | default now() | Last update time |

**Constraints:**
- Unique (user_id, name) - no duplicate category names per user

### 3. Tasks
Main entity for task management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Task identifier |
| user_id | uuid | FK to profiles, not null | Owner of the task |
| category_id | uuid | FK to categories, nullable | Optional category |
| title | text | not null | Task title |
| description | text | nullable | Task description |
| status | text | not null, default 'todo' | Status: todo, in_progress, done |
| priority | text | not null, default 'medium' | Priority: low, medium, high |
| due_date | date | nullable | Optional due date |
| completed_at | timestamptz | nullable | When task was completed |
| created_at | timestamptz | default now() | Creation time |
| updated_at | timestamptz | default now() | Last update time |

**Constraints:**
- status IN ('todo', 'in_progress', 'done')
- priority IN ('low', 'medium', 'high')

---

## Entity Relationships

```
auth.users (1) ──────── (1) profiles
                              │
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               │
         categories (0..*)  tasks (0..*)     │
              │               │               │
              └───────────────┘               │
                    │                         │
                    └─────────────────────────┘

Relationships:
- profiles.id → auth.users.id (1:1)
- categories.user_id → profiles.id (many:1)
- tasks.user_id → profiles.id (many:1)
- tasks.category_id → categories.id (many:1, optional)
```

---

## Row Level Security (RLS) Policies

### profiles table

| Policy | Operation | Role | Definition |
|--------|-----------|------|------------|
| profiles_select_own | SELECT | authenticated | user_id = auth.uid() |
| profiles_insert_own | INSERT | authenticated | user_id = auth.uid() |
| profiles_update_own | UPDATE | authenticated | user_id = auth.uid() |
| profiles_delete_own | DELETE | authenticated | user_id = auth.uid() |

### categories table

| Policy | Operation | Role | Definition |
|--------|-----------|------|------------|
| categories_select_own | SELECT | authenticated | user_id = auth.uid() |
| categories_insert_own | INSERT | authenticated | user_id = auth.uid() |
| categories_update_own | UPDATE | authenticated | user_id = auth.uid() |
| categories_delete_own | DELETE | authenticated | user_id = auth.uid() |

### tasks table

| Policy | Operation | Role | Definition |
|--------|-----------|------|------------|
| tasks_select_own | SELECT | authenticated | user_id = auth.uid() |
| tasks_insert_own | INSERT | authenticated | user_id = auth.uid() |
| tasks_update_own | UPDATE | authenticated | user_id = auth.uid() |
| tasks_delete_own | DELETE | authenticated | user_id = auth.uid() |

---

## Indexes

| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| tasks | idx_tasks_user_id | user_id | Filter tasks by user |
| tasks | idx_tasks_status | user_id, status | Filter by status |
| tasks | idx_tasks_due_date | user_id, due_date | Sort by due date |
| tasks | idx_tasks_category | category_id | Filter by category |
| categories | idx_categories_user_id | user_id | Filter categories by user |

---

## Triggers

### Auto-update `updated_at`
Create a trigger function to automatically update `updated_at` on row modification.

```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

Apply to all tables with `updated_at` column.

### Auto-create profile on signup
When a user signs up via Supabase Auth, automatically create a profile record.

```sql
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;
```

---

## Migration Order

1. Create `profiles` table with RLS
2. Create trigger for auto-profile creation
3. Create `categories` table with RLS
4. Create `tasks` table with RLS
5. Create indexes
6. Create `updated_at` triggers

---

## Scalability Considerations

- **UUID primary keys:** Allow distributed ID generation
- **Indexes on user_id:** All queries will filter by user
- **Soft deletes (future):** Consider adding `deleted_at` column for soft deletes
- **Pagination:** Implement cursor-based pagination for task lists
- **Archiving (future):** Consider archiving old completed tasks

---

## Security Considerations

- All tables have RLS enabled
- Users can only access their own data
- No public/anon access to any tables
- Auth handled by Supabase Auth (email/password)
- API key stored in environment variables

---

## Data Types Reference

| PostgreSQL Type | Use Case |
|-----------------|----------|
| uuid | Primary keys, foreign keys |
| text | Variable-length strings |
| timestamptz | Timestamps with timezone |
| date | Date without time |
