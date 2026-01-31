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

  // Manually clear the session cookie
  const cookieName = `sb-vrsvajmxpugrtexrjgfc-auth-token`;
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Set-Cookie", `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);

  return new Response(
    JSON.stringify({
      data: { message: "Logged out successfully" },
    }),
    {
      status: 200,
      headers,
    }
  );
}
