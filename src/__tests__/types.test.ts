import { describe, it, expect } from "vitest";
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskQuerySchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  TaskStatus,
  TaskPriority,
} from "../types";

describe("TaskStatus", () => {
  it("should accept valid status values", () => {
    expect(TaskStatus.parse("todo")).toBe("todo");
    expect(TaskStatus.parse("in_progress")).toBe("in_progress");
    expect(TaskStatus.parse("done")).toBe("done");
  });

  it("should reject invalid status values", () => {
    expect(() => TaskStatus.parse("invalid")).toThrow();
    expect(() => TaskStatus.parse("")).toThrow();
  });
});

describe("TaskPriority", () => {
  it("should accept valid priority values", () => {
    expect(TaskPriority.parse("low")).toBe("low");
    expect(TaskPriority.parse("medium")).toBe("medium");
    expect(TaskPriority.parse("high")).toBe("high");
  });

  it("should reject invalid priority values", () => {
    expect(() => TaskPriority.parse("urgent")).toThrow();
    expect(() => TaskPriority.parse("")).toThrow();
  });
});

describe("CreateTaskSchema", () => {
  it("should accept valid task data", () => {
    const validTask = {
      title: "Test Task",
      description: "Test description",
      status: "todo",
      priority: "medium",
    };
    const result = CreateTaskSchema.parse(validTask);
    expect(result.title).toBe("Test Task");
    expect(result.description).toBe("Test description");
  });

  it("should accept minimal task data with defaults", () => {
    const minimalTask = { title: "Minimal Task" };
    const result = CreateTaskSchema.parse(minimalTask);
    expect(result.title).toBe("Minimal Task");
    expect(result.status).toBe("todo");
    expect(result.priority).toBe("medium");
  });

  it("should reject task without title", () => {
    expect(() => CreateTaskSchema.parse({})).toThrow();
  });

  it("should reject task with empty title", () => {
    expect(() => CreateTaskSchema.parse({ title: "" })).toThrow();
  });

  it("should reject task with title exceeding max length", () => {
    const longTitle = "a".repeat(256);
    expect(() => CreateTaskSchema.parse({ title: longTitle })).toThrow();
  });

  it("should accept valid due date", () => {
    const taskWithDate = {
      title: "Task",
      due_date: "2024-12-31",
    };
    const result = CreateTaskSchema.parse(taskWithDate);
    expect(result.due_date).toBe("2024-12-31");
  });

  it("should reject invalid due date format", () => {
    const taskWithBadDate = {
      title: "Task",
      due_date: "not-a-date",
    };
    expect(() => CreateTaskSchema.parse(taskWithBadDate)).toThrow();
  });

  it("should accept valid category_id UUID", () => {
    const taskWithCategory = {
      title: "Task",
      category_id: "550e8400-e29b-41d4-a716-446655440000",
    };
    const result = CreateTaskSchema.parse(taskWithCategory);
    expect(result.category_id).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("should reject invalid category_id", () => {
    const taskWithBadCategory = {
      title: "Task",
      category_id: "not-a-uuid",
    };
    expect(() => CreateTaskSchema.parse(taskWithBadCategory)).toThrow();
  });
});

describe("UpdateTaskSchema", () => {
  it("should accept partial task data", () => {
    const partialUpdate = { title: "Updated Title" };
    const result = UpdateTaskSchema.parse(partialUpdate);
    expect(result.title).toBe("Updated Title");
  });

  it("should accept empty object (no updates)", () => {
    const result = UpdateTaskSchema.parse({});
    expect(result).toEqual({});
  });

  it("should accept nullable description", () => {
    const result = UpdateTaskSchema.parse({ description: null });
    expect(result.description).toBeNull();
  });

  it("should accept nullable due_date", () => {
    const result = UpdateTaskSchema.parse({ due_date: null });
    expect(result.due_date).toBeNull();
  });

  it("should accept nullable category_id", () => {
    const result = UpdateTaskSchema.parse({ category_id: null });
    expect(result.category_id).toBeNull();
  });
});

describe("TaskQuerySchema", () => {
  it("should accept valid query parameters", () => {
    const query = {
      status: "todo",
      priority: "high",
      category_id: "550e8400-e29b-41d4-a716-446655440000",
      sort: "due_date",
      order: "asc",
    };
    const result = TaskQuerySchema.parse(query);
    expect(result.status).toBe("todo");
    expect(result.priority).toBe("high");
    expect(result.sort).toBe("due_date");
    expect(result.order).toBe("asc");
  });

  it("should apply default order", () => {
    const result = TaskQuerySchema.parse({});
    expect(result.order).toBe("desc");
  });

  it("should reject invalid sort field", () => {
    expect(() => TaskQuerySchema.parse({ sort: "invalid" })).toThrow();
  });

  it("should reject invalid order value", () => {
    expect(() => TaskQuerySchema.parse({ order: "random" })).toThrow();
  });
});

describe("CreateCategorySchema", () => {
  it("should accept valid category data", () => {
    const category = {
      name: "Work",
      color: "#ff5733",
    };
    const result = CreateCategorySchema.parse(category);
    expect(result.name).toBe("Work");
    expect(result.color).toBe("#ff5733");
  });

  it("should accept category without color", () => {
    const category = { name: "Personal" };
    const result = CreateCategorySchema.parse(category);
    expect(result.name).toBe("Personal");
    expect(result.color).toBeUndefined();
  });

  it("should reject empty category name", () => {
    expect(() => CreateCategorySchema.parse({ name: "" })).toThrow();
  });

  it("should reject category name exceeding max length", () => {
    const longName = "a".repeat(101);
    expect(() => CreateCategorySchema.parse({ name: longName })).toThrow();
  });

  it("should accept valid hex colors", () => {
    expect(CreateCategorySchema.parse({ name: "Test", color: "#fff" }).color).toBe("#fff");
    expect(CreateCategorySchema.parse({ name: "Test", color: "#FFFFFF" }).color).toBe("#FFFFFF");
    expect(CreateCategorySchema.parse({ name: "Test", color: "#123abc" }).color).toBe("#123abc");
  });

  it("should reject invalid hex colors", () => {
    expect(() => CreateCategorySchema.parse({ name: "Test", color: "red" })).toThrow();
    expect(() => CreateCategorySchema.parse({ name: "Test", color: "#gggggg" })).toThrow();
    expect(() => CreateCategorySchema.parse({ name: "Test", color: "123456" })).toThrow();
  });
});

describe("UpdateCategorySchema", () => {
  it("should accept partial category data", () => {
    const result = UpdateCategorySchema.parse({ name: "Updated" });
    expect(result.name).toBe("Updated");
  });

  it("should accept empty object", () => {
    const result = UpdateCategorySchema.parse({});
    expect(result).toEqual({});
  });

  it("should accept nullable color", () => {
    const result = UpdateCategorySchema.parse({ color: null });
    expect(result.color).toBeNull();
  });
});
