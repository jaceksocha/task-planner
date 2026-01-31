import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenRouterService } from "../lib/services/openrouter";

describe("OpenRouterService", () => {
  let service: OpenRouterService;
  const mockApiKey = "test-api-key";

  beforeEach(() => {
    service = new OpenRouterService(mockApiKey);
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should create service with provided API key", () => {
      const svc = new OpenRouterService("my-api-key");
      expect(svc).toBeInstanceOf(OpenRouterService);
    });

    it("should use default model when not specified", () => {
      const svc = new OpenRouterService("my-api-key");
      expect(svc).toBeInstanceOf(OpenRouterService);
    });

    it("should use custom model when provided", () => {
      const svc = new OpenRouterService("my-api-key", "custom-model");
      expect(svc).toBeInstanceOf(OpenRouterService);
    });
  });

  describe("chat", () => {
    it("should make API call with correct parameters", async () => {
      const mockResponse = {
        id: "test-id",
        choices: [
          {
            message: {
              role: "assistant",
              content: "Test response",
            },
            finish_reason: "stop",
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const messages = [{ role: "user" as const, content: "Hello" }];
      const result = await service.chat(messages);

      expect(result).toBe("Test response");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockApiKey}`,
          }),
        })
      );
    });

    it("should throw error on API failure", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            error: { message: "API Error", type: "error", code: "500" },
          }),
      });

      const messages = [{ role: "user" as const, content: "Hello" }];

      await expect(service.chat(messages)).rejects.toThrow("API Error");
    });

    it("should throw error when no response content", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "test-id",
            choices: [],
          }),
      });

      const messages = [{ role: "user" as const, content: "Hello" }];

      await expect(service.chat(messages)).rejects.toThrow("No response content from OpenRouter");
    });
  });

  describe("suggestTaskDescription", () => {
    it("should return suggested description", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: "Review and update the project documentation.",
                },
              },
            ],
          }),
      });

      const result = await service.suggestTaskDescription("Update docs");

      expect(result).toBe("Review and update the project documentation.");
    });
  });

  describe("suggestPriority", () => {
    it("should return valid priority for low priority task", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "low" } }],
          }),
      });

      const result = await service.suggestPriority("Clean up old files");

      expect(result).toBe("low");
    });

    it("should return valid priority for high priority task", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "high" } }],
          }),
      });

      const result = await service.suggestPriority("Fix critical bug", "Production is down");

      expect(result).toBe("high");
    });

    it("should return medium as default for invalid response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "urgent" } }],
          }),
      });

      const result = await service.suggestPriority("Some task");

      expect(result).toBe("medium");
    });
  });

  describe("improveDescription", () => {
    it("should return improved description", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content:
                    "Thoroughly review all API endpoints for potential security vulnerabilities and performance bottlenecks.",
                },
              },
            ],
          }),
      });

      const result = await service.improveDescription("Review API", "check the API");

      expect(result).toBe(
        "Thoroughly review all API endpoints for potential security vulnerabilities and performance bottlenecks."
      );
    });
  });
});
