import { createBrowserClient, createServerClient, type CookieOptions } from "@supabase/ssr";
import type { AstroCookies } from "astro";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Public environment variables for browser client
const publicSupabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const publicSupabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY;

// Client-side Supabase client (for React components)
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(publicSupabaseUrl, publicSupabaseAnonKey);
}

// Server-side Supabase client (for Astro pages and API routes)
export function createSupabaseServerClient(cookies: AstroCookies) {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const cookieName = "sb-vrsvajmxpugrtexrjgfc-auth-token";
        const cookie = cookies.get(cookieName);
        if (cookie) {
          // Cookie value is base64-encoded JSON - return as-is, Supabase SSR will handle it
          return [{ name: cookieName, value: cookie.value }];
        }
        return [];
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        for (const { name, value, options } of cookiesToSet) {
          cookies.set(name, value, {
            path: options.path ?? "/",
            maxAge: options.maxAge,
            domain: options.domain,
            // Force secure to false for localhost development
            secure: import.meta.env.PROD ? options.secure : false,
            httpOnly: options.httpOnly,
            sameSite: options.sameSite as "lax" | "strict" | "none" | undefined,
          });
        }
      },
    },
  });
}

export type SupabaseClient = ReturnType<typeof createSupabaseServerClient>;
