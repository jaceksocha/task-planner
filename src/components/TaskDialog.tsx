import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TaskDTO, CategoryDTO, CreateTaskCommand, UpdateTaskCommand, ApiResponse } from "../types";
import { Sparkles, Loader2 } from "lucide-react";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskDTO | null;
  categories: CategoryDTO[];
  onSave: (data: CreateTaskCommand | UpdateTaskCommand) => void;
  isLoading?: boolean;
}

interface AISuggestion {
  suggestion: string;
  type: string;
}

export function TaskDialog({ open, onOpenChange, task, categories, onSave, isLoading }: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">("todo");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [categoryId, setCategoryId] = useState<string>("");
  const [dueDate, setDueDate] = useState("");

  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setCategoryId(task.category_id || "");
      setDueDate(task.due_date || "");
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setCategoryId("");
      setDueDate("");
    }
    setAiError(null);
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const data: CreateTaskCommand | UpdateTaskCommand = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      category_id: categoryId || undefined,
      due_date: dueDate || undefined,
    };

    onSave(data);
  };

  const callAI = async (type: "description" | "priority" | "improve") => {
    if (!title.trim()) {
      setAiError("Please enter a title first");
      return;
    }

    setAiLoading(type);
    setAiError(null);

    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim() || undefined,
          due_date: dueDate || undefined,
        }),
      });

      const result: ApiResponse<AISuggestion> = await response.json();

      if ("error" in result) {
        throw new Error(result.error.message);
      }

      const suggestion = result.data.suggestion;

      switch (type) {
        case "description":
        case "improve":
          setDescription(suggestion);
          break;
        case "priority":
          if (suggestion === "low" || suggestion === "medium" || suggestion === "high") {
            setPriority(suggestion);
          }
          break;
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI suggestion failed");
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Make changes to your task." : "Add a new task to your list."}
            </DialogDescription>
          </DialogHeader>

          {aiError && (
            <div className="bg-red-50 text-red-600 p-2 rounded text-sm mt-2">
              {aiError}
              <button type="button" onClick={() => setAiError(null)} className="ml-2 underline">
                Dismiss
              </button>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description</Label>
                <div className="flex gap-1">
                  {description ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => callAI("improve")}
                      disabled={aiLoading !== null || !title.trim()}
                      className="h-7 text-xs"
                    >
                      {aiLoading === "improve" ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="mr-1 h-3 w-3" />
                      )}
                      Improve
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => callAI("description")}
                      disabled={aiLoading !== null || !title.trim()}
                      className="h-7 text-xs"
                    >
                      {aiLoading === "description" ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="mr-1 h-3 w-3" />
                      )}
                      Suggest
                    </Button>
                  )}
                </div>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description (optional)"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="priority">Priority</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => callAI("priority")}
                    disabled={aiLoading !== null || !title.trim()}
                    className="h-6 text-xs px-2"
                  >
                    {aiLoading === "priority" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
