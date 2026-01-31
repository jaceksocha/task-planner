import type { APIContext } from "astro";

import { UpdateTaskSchema, type ApiError, type ApiResponse, type TaskDTO } from "../../../types";

export const prerender = false;

// GET /api/tasks/:id - Get single task
export async function GET(context: APIContext): Promise<Response> {
  const { supabase, user } = context.locals;
  const { id } = context.params;

  if (!user) {
    const error: ApiError = {
      error: { message: "Authentication required", code: "UNAUTHORIZED" },
    };
    return new Response(JSON.stringify(error), { status: 401 });
  }

  if (!id) {
    const error: ApiError = {
      error: { message: "Task ID required", code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).eq("user_id", user.id).single();

  if (error || !data) {
    const apiError: ApiError = {
      error: { message: "Task not found", code: "NOT_FOUND" },
    };
    return new Response(JSON.stringify(apiError), { status: 404 });
  }

  const response: ApiResponse<TaskDTO> = { data: data as TaskDTO };
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// PUT /api/tasks/:id - Update task
export async function PUT(context: APIContext): Promise<Response> {
  const { supabase, user } = context.locals;
  const { id } = context.params;

  if (!user) {
    const error: ApiError = {
      error: { message: "Authentication required", code: "UNAUTHORIZED" },
    };
    return new Response(JSON.stringify(error), { status: 401 });
  }

  if (!id) {
    const error: ApiError = {
      error: { message: "Task ID required", code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  // Parse body
  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    const error: ApiError = {
      error: { message: "Invalid JSON body", code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const parseResult = UpdateTaskSchema.safeParse(body);

  if (!parseResult.success) {
    const error: ApiError = {
      error: { message: parseResult.error.errors[0].message, code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const updateData = parseResult.data;

  // If status is changing to "done", set completed_at
  if (updateData.status === "done") {
    (updateData as Record<string, unknown>).completed_at = new Date().toISOString();
  } else if (updateData.status && updateData.status !== "done") {
    (updateData as Record<string, unknown>).completed_at = null;
  }

  // Update task
  const { data, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !data) {
    const apiError: ApiError = {
      error: { message: "Task not found", code: "NOT_FOUND" },
    };
    return new Response(JSON.stringify(apiError), { status: 404 });
  }

  const response: ApiResponse<TaskDTO> = { data: data as TaskDTO };
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// DELETE /api/tasks/:id - Delete task
export async function DELETE(context: APIContext): Promise<Response> {
  const { supabase, user } = context.locals;
  const { id } = context.params;

  if (!user) {
    const error: ApiError = {
      error: { message: "Authentication required", code: "UNAUTHORIZED" },
    };
    return new Response(JSON.stringify(error), { status: 401 });
  }

  if (!id) {
    const error: ApiError = {
      error: { message: "Task ID required", code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    const apiError: ApiError = {
      error: { message: error.message, code: "INTERNAL_ERROR" },
    };
    return new Response(JSON.stringify(apiError), { status: 500 });
  }

  return new Response(null, { status: 204 });
}
