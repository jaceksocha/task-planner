import type { APIContext } from "astro";

import type { ApiError } from "../../../types";

export const prerender = false;

export async function POST(context: APIContext): Promise<Response> {
  const { supabase } = context.locals;

  const { error } = await supabase.auth.signOut();

  if (error) {
    const apiError: ApiError = {
      error: { message: error.message, code: "AUTH_ERROR" },
    };
    return new Response(JSON.stringify(apiError), { status: 500 });
  }

  return new Response(
    JSON.stringify({
      data: { message: "Logged out successfully" },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
