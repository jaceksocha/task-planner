import type { APIContext } from "astro";
import { createOpenRouterService } from "../../../lib/services/openrouter";
import type { ApiError } from "../../../types";

export const prerender = false;

interface WeeklySummaryResponse {
  summary: string;
  taskCount: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export async function GET(context: APIContext): Promise<Response> {
  const { supabase, user } = context.locals;

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

  try {
    // Calculate date 7 days ago
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // Fetch completed tasks from last 7 days with category names
    const { data: tasks, error: dbError } = await supabase
      .from("tasks")
      .select(
        `
        title,
        description,
        priority,
        completed_at,
        category_id,
        categories (
          name
        )
      `
      )
      .eq("user_id", user.id)
      .eq("status", "done")
      .gte("completed_at", startDate.toISOString())
      .lte("completed_at", endDate.toISOString())
      .order("completed_at", { ascending: false });

    if (dbError) {
      throw new Error(dbError.message);
    }

    // If no tasks completed, return empty state message
    if (!tasks || tasks.length === 0) {
      const response: { data: WeeklySummaryResponse } = {
        data: {
          summary: "No tasks completed in the past 7 days. Start marking tasks as done to see your weekly summary!",
          taskCount: 0,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        },
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Transform tasks for AI (handle the join result)
    const tasksForAI = tasks.map((task: any) => ({
      title: task.title,
      description: task.description,
      priority: task.priority,
      completed_at: task.completed_at,
      category: task.categories?.name || undefined,
    }));

    // Generate summary
    const summary = await openRouter.summarizeWeeklyTasks(tasksForAI);

    const response: { data: WeeklySummaryResponse } = {
      data: {
        summary,
        taskCount: tasks.length,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const error: ApiError = {
      error: {
        message: err instanceof Error ? err.message : "Failed to generate summary",
        code: "INTERNAL_ERROR",
      },
    };
    return new Response(JSON.stringify(error), { status: 500 });
  }
}
