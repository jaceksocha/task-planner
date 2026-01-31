interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface ChatCompletionResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.0-flash-exp:free";

export class OpenRouterService {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || DEFAULT_MODEL;
  }

  async chat(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<string> {
    const request: ChatCompletionRequest = {
      model: this.model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 500,
    };

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": "https://task-planner.local",
        "X-Title": "Task Planner",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as OpenRouterError;
      throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("No response content from OpenRouter");
    }

    return data.choices[0].message.content;
  }

  async suggestTaskDescription(title: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "You are a helpful assistant that improves task descriptions. Given a task title, provide a clear, actionable description in 1-2 sentences. Be concise and practical.",
      },
      {
        role: "user",
        content: `Suggest a description for this task: "${title}"`,
      },
    ];

    return this.chat(messages, { temperature: 0.7, maxTokens: 150 });
  }

  async suggestPriority(title: string, description?: string, dueDate?: string): Promise<"low" | "medium" | "high"> {
    const context = [
      `Task title: ${title}`,
      description ? `Description: ${description}` : null,
      dueDate ? `Due date: ${dueDate}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          'You are a helpful assistant that suggests task priorities. Analyze the task and respond with ONLY one word: "low", "medium", or "high". Consider urgency, importance, and due date.',
      },
      {
        role: "user",
        content: context,
      },
    ];

    const response = await this.chat(messages, { temperature: 0.3, maxTokens: 10 });
    const priority = response.toLowerCase().trim();

    if (priority === "low" || priority === "medium" || priority === "high") {
      return priority;
    }

    return "medium";
  }

  async improveDescription(title: string, description: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "You are a helpful assistant that improves task descriptions. Make the description clearer, more actionable, and well-structured. Keep it concise (2-3 sentences max). Do not add unnecessary details.",
      },
      {
        role: "user",
        content: `Task: "${title}"\nCurrent description: "${description}"\n\nImprove this description:`,
      },
    ];

    return this.chat(messages, { temperature: 0.5, maxTokens: 200 });
  }

  async summarizeWeeklyTasks(
    tasks: Array<{
      title: string;
      description: string | null;
      priority: string;
      completed_at: string;
      category?: string;
    }>
  ): Promise<string> {
    // Build context from tasks
    const tasksSummary = tasks
      .map((task, index) => {
        const parts = [
          `${index + 1}. ${task.title}`,
          task.description ? `   Description: ${task.description}` : null,
          `   Priority: ${task.priority}`,
          task.category ? `   Category: ${task.category}` : null,
          `   Completed: ${new Date(task.completed_at).toLocaleDateString()}`,
        ];
        return parts.filter(Boolean).join("\n");
      })
      .join("\n\n");

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are a helpful assistant that analyzes completed tasks and provides insightful weekly summaries. Create a concise summary (3-4 paragraphs) that:
1. Highlights key accomplishments
2. Identifies patterns or themes in the work
3. Notes productivity trends (high priority items, categories focused on)
4. Provides brief encouragement or actionable insights

Be specific, positive, and actionable. Format in markdown.`,
      },
      {
        role: "user",
        content: `Here are my completed tasks from the past 7 days:\n\n${tasksSummary}\n\nProvide a weekly summary.`,
      },
    ];

    return this.chat(messages, { temperature: 0.7, maxTokens: 500 });
  }
}

export function createOpenRouterService(): OpenRouterService | null {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new OpenRouterService(apiKey);
}
