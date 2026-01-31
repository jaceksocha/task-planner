import type { APIContext } from "astro";

import { UpdateCategorySchema, type ApiError, type ApiResponse, type CategoryDTO } from "../../../types";

export const prerender = false;

// GET /api/categories/:id - Get single category
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
      error: { message: "Category ID required", code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const { data, error } = await supabase.from("categories").select("*").eq("id", id).eq("user_id", user.id).single();

  if (error || !data) {
    const apiError: ApiError = {
      error: { message: "Category not found", code: "NOT_FOUND" },
    };
    return new Response(JSON.stringify(apiError), { status: 404 });
  }

  const response: ApiResponse<CategoryDTO> = { data: data as CategoryDTO };
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// PUT /api/categories/:id - Update category
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
      error: { message: "Category ID required", code: "VALIDATION_ERROR" },
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

  const parseResult = UpdateCategorySchema.safeParse(body);

  if (!parseResult.success) {
    const error: ApiError = {
      error: { message: parseResult.error.errors[0].message, code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const updateData = parseResult.data;

  // Update category
  const { data, error } = await supabase
    .from("categories")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
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
      error: { message: "Category not found", code: "NOT_FOUND" },
    };
    return new Response(JSON.stringify(apiError), { status: 404 });
  }

  if (!data) {
    const apiError: ApiError = {
      error: { message: "Category not found", code: "NOT_FOUND" },
    };
    return new Response(JSON.stringify(apiError), { status: 404 });
  }

  const response: ApiResponse<CategoryDTO> = { data: data as CategoryDTO };
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// DELETE /api/categories/:id - Delete category
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
      error: { message: "Category ID required", code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const { error } = await supabase.from("categories").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    const apiError: ApiError = {
      error: { message: error.message, code: "INTERNAL_ERROR" },
    };
    return new Response(JSON.stringify(apiError), { status: 500 });
  }

  return new Response(null, { status: 204 });
}
