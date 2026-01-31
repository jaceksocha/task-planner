import type { APIContext } from "astro";
import { z } from "zod";
import { createOpenRouterService } from "../../../lib/services/openrouter";
import type { ApiError } from "../../../types";

export const prerender = false;

const SuggestRequestSchema = z.object({
  type: z.enum(["description", "priority", "improve"]),
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  due_date: z.string().date().optional(),
});

type SuggestRequest = z.infer<typeof SuggestRequestSchema>;

interface SuggestResponse {
  suggestion: string;
  type: SuggestRequest["type"];
}

export async function POST(context: APIContext): Promise<Response> {
  const { user } = context.locals;

  if (!user) {
    const error: ApiError = {
      error: { message: "Authentication required", code: "UNAUTHORIZED" },
    };
    return new Response(JSON.stringify(error), { status: 401 });
  }

  const openRouter = createOpenRouterService();

  if (!openRouter) {
    const error: ApiError = {
      error: {
        message: "AI service not configured. Please add OPENROUTER_API_KEY to your environment.",
        code: "SERVICE_UNAVAILABLE",
      },
    };
    return new Response(JSON.stringify(error), { status: 503 });
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    const error: ApiError = {
      error: { message: "Invalid JSON body", code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const parseResult = SuggestRequestSchema.safeParse(body);

  if (!parseResult.success) {
    const error: ApiError = {
      error: { message: parseResult.error.errors[0].message, code: "VALIDATION_ERROR" },
    };
    return new Response(JSON.stringify(error), { status: 400 });
  }

  const { type, title, description, due_date } = parseResult.data;

  try {
    let suggestion: string;

    switch (type) {
      case "description":
        suggestion = await openRouter.suggestTaskDescription(title);
        break;
      case "priority":
        suggestion = await openRouter.suggestPriority(title, description, due_date);
        break;
      case "improve":
        if (!description) {
          const error: ApiError = {
            error: { message: "Description is required for improve type", code: "VALIDATION_ERROR" },
          };
          return new Response(JSON.stringify(error), { status: 400 });
        }
        suggestion = await openRouter.improveDescription(title, description);
        break;
    }

    const response: { data: SuggestResponse } = {
      data: { suggestion, type },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const error: ApiError = {
      error: {
        message: err instanceof Error ? err.message : "AI service error",
        code: "INTERNAL_ERROR",
      },
    };
    return new Response(JSON.stringify(error), { status: 500 });
  }
}
