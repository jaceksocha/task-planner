# API Specification: Task Planner

## Overview

REST API endpoints for the Task Planner application. All endpoints require authentication via Supabase Auth.

---

## Base URL

- **Local:** `http://localhost:4321/api`
- **Production:** `https://your-domain.com/api`

---

## Authentication

All API endpoints use Supabase Auth. Include the access token in requests:

```
Authorization: Bearer <access_token>
```

---

## Endpoints

### Tasks

#### GET /api/tasks
List all tasks for the authenticated user.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status: todo, in_progress, done |
| priority | string | No | Filter by priority: low, medium, high |
| category_id | uuid | No | Filter by category |
| sort | string | No | Sort field: due_date, created_at, priority |
| order | string | No | Sort order: asc, desc (default: desc) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string | null",
      "status": "todo | in_progress | done",
      "priority": "low | medium | high",
      "due_date": "date | null",
      "category_id": "uuid | null",
      "completed_at": "timestamp | null",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

---

#### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "status": "todo | in_progress | done (default: todo)",
  "priority": "low | medium | high (default: medium)",
  "due_date": "date (optional)",
  "category_id": "uuid (optional)"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "title": "string",
    ...
  }
}
```

**Errors:**
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated

---

#### GET /api/tasks/:id
Get a single task by ID.

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "title": "string",
    ...
  }
}
```

**Errors:**
- `404 Not Found` - Task not found or not owned by user

---

#### PUT /api/tasks/:id
Update an existing task.

**Request Body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "status": "todo | in_progress | done (optional)",
  "priority": "low | medium | high (optional)",
  "due_date": "date | null (optional)",
  "category_id": "uuid | null (optional)"
}
```

**Response:** `200 OK`

**Note:** When status changes to "done", `completed_at` is automatically set.

---

#### DELETE /api/tasks/:id
Delete a task.

**Response:** `204 No Content`

---

### Categories

#### GET /api/categories
List all categories for the authenticated user.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "color": "string | null",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

---

#### POST /api/categories
Create a new category.

**Request Body:**
```json
{
  "name": "string (required)",
  "color": "string (optional, hex color)"
}
```

**Response:** `201 Created`

---

#### PUT /api/categories/:id
Update a category.

**Request Body:**
```json
{
  "name": "string (optional)",
  "color": "string | null (optional)"
}
```

**Response:** `200 OK`

---

#### DELETE /api/categories/:id
Delete a category. Tasks in this category will have `category_id` set to null.

**Response:** `204 No Content`

---

## DTOs and Command Models

### Task DTOs

```typescript
// Response DTO
interface TaskDTO {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  category_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Create Command
interface CreateTaskCommand {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  category_id?: string;
}

// Update Command
interface UpdateTaskCommand {
  title?: string;
  description?: string | null;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string | null;
  category_id?: string | null;
}
```

### Category DTOs

```typescript
// Response DTO
interface CategoryDTO {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

// Create Command
interface CreateCategoryCommand {
  name: string;
  color?: string;
}

// Update Command
interface UpdateCategoryCommand {
  name?: string;
  color?: string | null;
}
```

---

## Error Response Format

All errors follow this format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid auth token |
| FORBIDDEN | 403 | Not allowed to access resource |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input data |
| INTERNAL_ERROR | 500 | Server error |

---

## Validation Rules

### Task
- `title`: Required, 1-255 characters
- `description`: Optional, max 5000 characters
- `status`: Must be one of: todo, in_progress, done
- `priority`: Must be one of: low, medium, high
- `due_date`: Valid ISO date format (YYYY-MM-DD)
- `category_id`: Valid UUID, must exist and belong to user

### Category
- `name`: Required, 1-100 characters, unique per user
- `color`: Optional, valid hex color (#RRGGBB or #RGB)
