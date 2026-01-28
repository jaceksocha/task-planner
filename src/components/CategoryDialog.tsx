import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryDTO, CreateCategoryCommand } from "../types";
import { Settings, Plus, Pencil, Trash2 } from "lucide-react";

interface CategoryDialogProps {
  userId: string;
  categories: CategoryDTO[];
  onCategoriesChange: () => void;
}

const colorOptions = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#6b7280", // gray
];

export function CategoryDialog({ userId, categories, onCategoriesChange }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(colorOptions[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setColor(editingCategory.color || colorOptions[0]);
    } else {
      setName("");
      setColor(colorOptions[0]);
    }
    setError(null);
  }, [editingCategory]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const data: CreateCategoryCommand = {
        name: name.trim(),
        color,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || "Failed to save category");
      }

      setEditingCategory(null);
      setName("");
      setColor(colorOptions[0]);
      onCategoriesChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (category: CategoryDTO) => {
    if (!confirm(`Delete category "${category.name}"?`)) return;

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
        headers: { "x-user-id": userId },
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      onCategoriesChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>Create and organize your task categories.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 text-red-600 p-2 rounded text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">{editingCategory ? "Edit Category" : "New Category"}</Label>
            <div className="flex gap-2">
              <Input
                id="categoryName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                className="flex-1"
              />
              <Button onClick={handleSave} disabled={isLoading || !name.trim()} size="sm">
                {editingCategory ? "Save" : <Plus className="h-4 w-4" />}
              </Button>
              {editingCategory && (
                <Button variant="outline" size="sm" onClick={() => setEditingCategory(null)}>
                  Cancel
                </Button>
              )}
            </div>
            <div className="flex gap-1">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-gray-900" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="border-t pt-4">
              <Label className="mb-2 block">Your Categories</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color || "#6b7280" }} />
                      <span>{category.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
