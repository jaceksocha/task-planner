import type { APIContext } from "astro";
import { z } from "zod";

import type { ApiError } from "../../../types";

export const prerender = false;

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
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

  const parseResult = ForgotPasswordSchema.safeParse(body);

  if (!parseResult.success) {
    const error: ApiError = {
      error: { message: parseResult.error.errors[0].message, code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const { email } = parseResult.data;

  // Send password reset email
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${context.url.origin}/reset-password`,
  });

  if (error) {
    const apiError: ApiError = {
      error: { message: error.message, code: "AUTH_ERROR" },
    };
    return new Response(JSON.stringify(apiError), { status: 400 });
  }

  // Always return success to prevent email enumeration attacks
  return new Response(
    JSON.stringify({
      data: {
        message: "If an account exists with this email, you will receive a password reset link.",
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
