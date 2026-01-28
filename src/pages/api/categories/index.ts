import type { APIContext } from "astro";

import { CreateCategorySchema, type ApiError, type ApiResponse, type CategoryDTO } from "../../../types";

export const prerender = false;

// GET /api/categories - List categories
export async function GET(context: APIContext): Promise<Response> {
  const { supabase } = context.locals;

  const userId = context.request.headers.get("x-user-id");

  if (!userId) {
    const error: ApiError = {
      error: { message: "User ID required (x-user-id header)", code: "UNAUTHORIZED" },
    };
    return new Response(JSON.stringify(error), { status: 401 });
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    const apiError: ApiError = {
      error: { message: error.message, code: "INTERNAL_ERROR" },
    };
    return new Response(JSON.stringify(apiError), { status: 500 });
  }

  const response: ApiResponse<CategoryDTO[]> = { data: data as CategoryDTO[] };
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// POST /api/categories - Create category
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

  const parseResult = CreateCategorySchema.safeParse(body);

  if (!parseResult.success) {
    const error: ApiError = {
      error: { message: parseResult.error.errors[0].message, code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const categoryData = parseResult.data;

  // Insert category
  const { data, error } = await supabase
    .from("categories")
    .insert({
      ...categoryData,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    // Check for unique constraint violation
    if (error.code === "23505") {
      const apiError: ApiError = {
        error: { message: "Category with this name already exists", code: "VALIDATION_ERROR" },
      };
      return new Response(JSON.stringify(apiError), { status: 400 });
    }

    const apiError: ApiError = {
      error: { message: error.message, code: "INTERNAL_ERROR" },
    };
    return new Response(JSON.stringify(apiError), { status: 500 });
  }

  const response: ApiResponse<CategoryDTO> = { data: data as CategoryDTO };
  return new Response(JSON.stringify(response), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
