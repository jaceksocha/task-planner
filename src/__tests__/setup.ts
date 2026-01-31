import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock import.meta.env
vi.stubGlobal("import.meta.env", {
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_KEY: "test-key",
  OPENROUTER_API_KEY: "test-openrouter-key",
});

// Mock fetch globally
global.fetch = vi.fn();
