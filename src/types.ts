import { z } from "zod";

// ============================================================================
// Task Types
// ============================================================================

export const TaskStatus = z.enum(["todo", "in_progress", "done"]);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const TaskPriority = z.enum(["low", "medium", "high"]);
export type TaskPriority = z.infer<typeof TaskPriority>;

// Task DTO (response)
export interface TaskDTO {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  category_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Create Task Command
export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  status: TaskStatus.default("todo"),
  priority: TaskPriority.default("medium"),
  due_date: z.string().date().optional(),
  category_id: z.string().uuid().optional(),
});
export type CreateTaskCommand = z.infer<typeof CreateTaskSchema>;

// Update Task Command
export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: TaskStatus.optional(),
  priority: TaskPriority.optional(),
  due_date: z.string().date().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
});
export type UpdateTaskCommand = z.infer<typeof UpdateTaskSchema>;

// Task Query Params
export const TaskQuerySchema = z.object({
  status: TaskStatus.optional(),
  priority: TaskPriority.optional(),
  category_id: z.string().uuid().optional(),
  sort: z.enum(["due_date", "created_at", "priority"]).optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});
export type TaskQueryParams = z.infer<typeof TaskQuerySchema>;

// ============================================================================
// Category Types
// ============================================================================

// Category DTO (response)
export interface CategoryDTO {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

// Hex color validation
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Create Category Command
export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(hexColorRegex, "Invalid hex color").optional(),
});
export type CreateCategoryCommand = z.infer<typeof CreateCategorySchema>;

// Update Category Command
export const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(hexColorRegex, "Invalid hex color").nullable().optional(),
});
export type UpdateCategoryCommand = z.infer<typeof UpdateCategorySchema>;

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    message: string;
    code: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
