import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Calendar, TrendingUp } from "lucide-react";

interface WeeklySummaryData {
  summary: string;
  taskCount: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export function WeeklySummary() {
  const [data, setData] = useState<WeeklySummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/summarize-week");
      const result = await response.json();

      if ("error" in result) {
        throw new Error(result.error.message);
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${startDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", options)}`;
  };

  // Simple markdown to HTML converter for basic formatting
  const markdownToHtml = (markdown: string): string => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3 class="font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="font-semibold text-lg mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="font-bold text-xl mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n\n/g, '</p><p class="mb-2">')
      .replace(/^(.+)$/gim, '<p class="mb-2">$1</p>')
      .replace(/<\/p><p class="mb-2"><\/p>/g, "");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Summary
            </CardTitle>
            <CardDescription>AI-powered insights on your completed tasks</CardDescription>
          </div>
          <Button onClick={fetchSummary} disabled={isLoading} variant="outline" size="sm">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Summary
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

        {!data && !isLoading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Click "Generate Summary" to see your weekly insights</p>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDateRange(data.dateRange.start, data.dateRange.end)}
              </div>
              <div>
                {data.taskCount} {data.taskCount === 1 ? "task" : "tasks"} completed
              </div>
            </div>

            <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: markdownToHtml(data.summary) }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
