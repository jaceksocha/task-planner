import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerClient } from "../db/supabase.client";

// Routes that don't require authentication
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context.cookies);
  context.locals.supabase = supabase;

  // Get the current user from session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  context.locals.user = user;

  const pathname = context.url.pathname;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
  const isApiRoute = pathname.startsWith("/api/");

  // For protected API routes, return 401 if not authenticated
  if (isApiRoute && !isPublicRoute && !user) {
    return new Response(
      JSON.stringify({
        error: { message: "Authentication required", code: "UNAUTHORIZED" },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // For protected pages, redirect to login
  if (!isApiRoute && !isPublicRoute && !user) {
    return context.redirect("/login");
  }

  // For auth pages, redirect to home if already logged in
  if ((pathname === "/login" || pathname === "/register") && user) {
    return context.redirect("/");
  }

  return next();
});
