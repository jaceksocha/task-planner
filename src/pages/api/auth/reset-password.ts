import type { APIContext } from "astro";
import { z } from "zod";

import type { ApiError } from "../../../types";

export const prerender = false;

const ResetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(context: APIContext): Promise<Response> {
  const { supabase } = context.locals;

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    const error: ApiError = {
      error: { message: "Invalid JSON body", code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const parseResult = ResetPasswordSchema.safeParse(body);

  if (!parseResult.success) {
    const error: ApiError = {
      error: { message: parseResult.error.errors[0].message, code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const { password } = parseResult.data;

  // Update user's password (token is in session from email link)
  const { data, error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    const apiError: ApiError = {
      error: { message: error.message, code: "AUTH_ERROR" },
    };
    return new Response(JSON.stringify(apiError), { status: 400 });
  }

  return new Response(
    JSON.stringify({
      data: {
        message: "Password updated successfully",
        user: data.user,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
