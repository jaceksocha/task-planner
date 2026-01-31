import { createBrowserClient, createServerClient, type CookieOptions } from "@supabase/ssr";
import type { AstroCookies } from "astro";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Client-side Supabase client (for React components)
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Server-side Supabase client (for Astro pages and API routes)
export function createSupabaseServerClient(cookies: AstroCookies) {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const allCookies: { name: string; value: string }[] = [];
        for (const [name, value] of Object.entries(cookies)) {
          if (typeof value === "object" && value !== null && "value" in value) {
            allCookies.push({ name, value: (value as { value: string }).value });
          }
        }
        // Use the headers approach for Astro
        return parseCookiesFromAstro(cookies);
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        for (const { name, value, options } of cookiesToSet) {
          cookies.set(name, value, {
            path: options.path ?? "/",
            maxAge: options.maxAge,
            domain: options.domain,
            secure: options.secure,
            httpOnly: options.httpOnly,
            sameSite: options.sameSite as "lax" | "strict" | "none" | undefined,
          });
        }
      },
    },
  });
}

function parseCookiesFromAstro(cookies: AstroCookies): { name: string; value: string }[] {
  const result: { name: string; value: string }[] = [];

  // Known Supabase auth cookie patterns
  const cookieNames = [
    "sb-access-token",
    "sb-refresh-token",
    // Supabase also uses project-specific cookies like sb-<project-ref>-auth-token
  ];

  // Try to get common auth cookies
  for (const name of cookieNames) {
    const cookie = cookies.get(name);
    if (cookie?.value) {
      result.push({ name, value: cookie.value });
    }
  }

  // Also try to get any cookie that starts with "sb-"
  // Astro cookies don't provide a way to iterate all cookies directly,
  // so we'll rely on the auth-token pattern
  const authTokenCookie = cookies.get("sb-auth-token");
  if (authTokenCookie?.value) {
    result.push({ name: "sb-auth-token", value: authTokenCookie.value });
  }

  return result;
}

export type SupabaseClient = ReturnType<typeof createSupabaseServerClient>;
