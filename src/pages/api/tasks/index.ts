import type { APIContext } from "astro";

import { CreateTaskSchema, TaskQuerySchema, type ApiError, type ApiResponse, type TaskDTO } from "../../../types";

export const prerender = false;

// GET /api/tasks - List tasks
export async function GET(context: APIContext): Promise<Response> {
  const { supabase } = context.locals;

  // For now, use a test user ID (in production, get from auth)
  // TODO: Replace with actual auth when Supabase Auth is implemented
  const userId = context.request.headers.get("x-user-id");

  if (!userId) {
    const error: ApiError = {
      error: { message: "User ID required (x-user-id header)", code: "UNAUTHORIZED" },
    };
    return new Response(JSON.stringify(error), { status: 401 });
  }

  // Parse query params
  const url = new URL(context.request.url);
  const queryResult = TaskQuerySchema.safeParse({
    status: url.searchParams.get("status") || undefined,
    priority: url.searchParams.get("priority") || undefined,
    category_id: url.searchParams.get("category_id") || undefined,
    sort: url.searchParams.get("sort") || undefined,
    order: url.searchParams.get("order") || "desc",
  });

  if (!queryResult.success) {
    const error: ApiError = {
      error: { message: queryResult.error.message, code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const query = queryResult.data;

  // Build query
  let dbQuery = supabase.from("tasks").select("*").eq("user_id", userId);

  if (query.status) {
    dbQuery = dbQuery.eq("status", query.status);
  }
  if (query.priority) {
    dbQuery = dbQuery.eq("priority", query.priority);
  }
  if (query.category_id) {
    dbQuery = dbQuery.eq("category_id", query.category_id);
  }

  // Sorting
  const sortField = query.sort || "created_at";
  const ascending = query.order === "asc";
  dbQuery = dbQuery.order(sortField, { ascending });

  const { data, error } = await dbQuery;

  if (error) {
    const apiError: ApiError = {
      error: { message: error.message, code: "INTERNAL_ERROR" },
    };
    return new Response(JSON.stringify(apiError), { status: 500 });
  }

  const response: ApiResponse<TaskDTO[]> = { data: data as TaskDTO[] };
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// POST /api/tasks - Create task
export async function POST(context: APIContext): Promise<Response> {
  const { supabase } = context.locals;

  const userId = context.request.headers.get("x-user-id");

  if (!userId) {
    const error: ApiError = {
      error: { message: "User ID required (x-user-id header)", code: "UNAUTHORIZED" },
    };
    return new Response(JSON.stringify(error), { status: 401 });
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

  const parseResult = CreateTaskSchema.safeParse(body);

  if (!parseResult.success) {
    const error: ApiError = {
      error: { message: parseResult.error.errors[0].message, code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const taskData = parseResult.data;

  // Insert task
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      ...taskData,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    const apiError: ApiError = {
      error: { message: error.message, code: "INTERNAL_ERROR" },
    };
    return new Response(JSON.stringify(apiError), { status: 500 });
  }

  const response: ApiResponse<TaskDTO> = { data: data as TaskDTO };
  return new Response(JSON.stringify(response), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
