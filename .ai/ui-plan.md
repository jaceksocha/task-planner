# UI Plan - Task Planner

## Overview

A simple, responsive task management interface built with Astro, React, and Tailwind CSS.

## Key Views

### 1. Dashboard / Task List (Home Page)

**Route:** `/`

**Components:**
- Header with app title
- Task filters (status, priority, category)
- Task list with task cards
- Add task button (opens dialog)
- Empty state when no tasks

**Task Card Features:**
- Title and description preview
- Status badge (todo, in_progress, done)
- Priority indicator (color-coded: low=gray, medium=yellow, high=red)
- Category badge (if assigned)
- Due date (if set)
- Quick actions: mark complete, edit, delete

### 2. Task Dialog (Create/Edit)

**Trigger:** Add button or edit action

**Form Fields:**
- Title (required, text input)
- Description (optional, textarea)
- Status (select: todo, in_progress, done)
- Priority (select: low, medium, high)
- Category (select from user categories)
- Due date (date picker)

### 3. Category Management

**Access:** Settings/sidebar or dedicated page

**Features:**
- List of categories with color indicators
- Add new category
- Edit category (name, color)
- Delete category

## Component Structure

```
src/components/
├── ui/                    # Shadcn/ui components
├── TaskList.tsx           # Main task list container
├── TaskCard.tsx           # Individual task display
├── TaskDialog.tsx         # Create/Edit task form dialog
├── TaskFilters.tsx        # Status/priority/category filters
├── CategoryList.tsx       # Category management
├── CategoryDialog.tsx     # Create/Edit category dialog
└── EmptyState.tsx         # Empty state display
```

## User Flows

### Creating a Task
1. User clicks "Add Task" button
2. Dialog opens with empty form
3. User fills title (required) and optional fields
4. User clicks "Create"
5. Task appears in list
6. Dialog closes

### Completing a Task
1. User clicks checkbox or "Complete" button on task card
2. Task status updates to "done"
3. Task shows completed styling (strikethrough, muted)

### Filtering Tasks
1. User selects status/priority/category filters
2. Task list updates to show matching tasks
3. URL updates with query params (optional)

## Styling Guidelines

- Use Tailwind's neutral color palette
- Cards with subtle borders and shadows
- Color-coded priorities:
  - Low: `text-gray-500`
  - Medium: `text-yellow-500`
  - High: `text-red-500`
- Status badges with distinct colors:
  - Todo: `bg-gray-100`
  - In Progress: `bg-blue-100`
  - Done: `bg-green-100`

## Responsive Design

- Mobile-first approach
- Single column on mobile
- Cards stack vertically
- Dialog becomes full-screen on mobile
- Filters collapse to dropdown on mobile

## State Management

- Use React Query or SWR for data fetching (optional)
- Local component state for UI interactions
- Form state managed by controlled components

## API Integration

All data operations via REST API:
- `GET /api/tasks` - List tasks with filters
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
