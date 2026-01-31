import type { APIContext } from "astro";
import { z } from "zod";

import type { ApiError } from "../../../types";

export const prerender = false;

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
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

  const parseResult = LoginSchema.safeParse(body);

  if (!parseResult.success) {
    const error: ApiError = {
      error: { message: parseResult.error.errors[0].message, code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const { email, password } = parseResult.data;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const apiError: ApiError = {
      error: { message: error.message, code: "AUTH_ERROR" },
    };
    return new Response(JSON.stringify(apiError), { status: 401 });
  }

  return new Response(
    JSON.stringify({
      data: {
        user: data.user,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
