import type { ApiError, ApiResponse } from "../types";

/**
 * Creates a JSON response with proper headers
 */
export function jsonResponse<T>(data: T, status = 200): Response {
  const response: ApiResponse<T> = { data };
  return new Response(JSON.stringify(response), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Creates a standardized error response
 */
export function errorResponse(message: string, code: string, status = 400): Response {
  const error: ApiError = {
    error: { message, code },
  };
  return new Response(JSON.stringify(error), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Common error responses
 */
export const ApiErrors = {
  unauthorized: () => errorResponse("Authentication required", "UNAUTHORIZED", 401),
  notFound: (resource: string) => errorResponse(`${resource} not found`, "NOT_FOUND", 404),
  validationError: (message: string) => errorResponse(message, "VALIDATION_ERROR", 400),
  internalError: (message: string) => errorResponse(message, "INTERNAL_ERROR", 500),
  invalidJson: () => errorResponse("Invalid JSON body", "VALIDATION_ERROR", 400),
} as const;
