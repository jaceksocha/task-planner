import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskDTO, CategoryDTO } from "../types";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface TaskCardProps {
  task: TaskDTO;
  category?: CategoryDTO;
  onToggleComplete: (task: TaskDTO) => void;
  onEdit: (task: TaskDTO) => void;
  onDelete: (task: TaskDTO) => void;
}

const priorityColors = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

const statusColors = {
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export function TaskCard({ task, category, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const isCompleted = task.status === "done";

  return (
    <Card className={isCompleted ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggleComplete(task)}
            className="mt-1"
            aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          />
          <div className="flex-1 min-w-0">
            <CardTitle className={`text-base ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
              {task.title}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Task actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {task.description && (
          <p className={`text-sm text-muted-foreground mb-3 ${isCompleted ? "line-through" : ""}`}>
            {task.description.length > 100 ? `${task.description.slice(0, 100)}...` : task.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className={statusColors[task.status]}>
            {statusLabels[task.status]}
          </Badge>
          <Badge variant="secondary" className={priorityColors[task.priority]}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
          {category && (
            <Badge variant="outline" style={{ borderColor: category.color, color: category.color }}>
              {category.name}
            </Badge>
          )}
          {task.due_date && (
            <Badge variant="outline" className="text-muted-foreground">
              Due: {new Date(task.due_date).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
