"use client";

import * as React from "react";
import { Send, Eye, PenLine, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FunnelStage {
  name: string;
  count: number;
  icon: React.ElementType;
}

interface FunnelData {
  sent: number;
  viewed: number;
  signed: number;
  completed: number;
  avgTimeToComplete?: number; // in days
}

interface ConversionFunnelProps {
  className?: string;
}

export function ConversionFunnel({ className }: ConversionFunnelProps) {
  const [data, setData] = React.useState<FunnelData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchFunnelData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/funnel");

        if (!response.ok) {
          throw new Error("Failed to fetch funnel data");
        }

        const funnelData = await response.json();
        // Transform API response to component format
        const stageMap: Record<string, number> = {};
        (funnelData.stages || []).forEach((stage: { name: string; count: number }) => {
          stageMap[stage.name.toLowerCase()] = stage.count;
        });
        setData({
          sent: stageMap.sent || 0,
          viewed: stageMap.viewed || 0,
          signed: stageMap.signed || 0,
          completed: stageMap.completed || 0,
          avgTimeToComplete: funnelData.avgTimeToComplete,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFunnelData();
  }, []);

  if (isLoading) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {error || "No funnel data available"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stages: FunnelStage[] = [
    { name: "Sent", count: data.sent, icon: Send },
    { name: "Viewed", count: data.viewed, icon: Eye },
    { name: "Signed", count: data.signed, icon: PenLine },
    { name: "Completed", count: data.completed, icon: CheckCircle },
  ];

  // Calculate percentages relative to sent (first stage)
  const getPercentage = (count: number): number => {
    if (data.sent === 0) return 0;
    return Math.round((count / data.sent) * 100);
  };

  // Calculate conversion rate from previous stage
  const getConversionFromPrevious = (index: number): number => {
    if (index === 0) return 100;
    const previousCount = stages[index - 1].count;
    if (previousCount === 0) return 0;
    return Math.round((stages[index].count / previousCount) * 100);
  };

  // Overall conversion rate (Sent → Completed)
  const overallConversion = getPercentage(data.completed);

  // Calculate width for each bar (based on percentage of sent)
  const getBarWidth = (count: number): number => {
    const percentage = getPercentage(count);
    // Ensure minimum width for visibility if count > 0
    return count > 0 ? Math.max(percentage, 5) : 0;
  };

  const isEmpty = data.sent === 0;

  if (isEmpty) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Send className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm font-medium">No proposals sent yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Send your first proposal to see conversion metrics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Conversion Funnel</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Track proposal progress through each stage
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {overallConversion}% conversion
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Funnel visualization */}
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const percentage = getPercentage(stage.count);
            const barWidth = getBarWidth(stage.count);
            const conversionFromPrevious = getConversionFromPrevious(index);

            return (
              <div key={stage.name} className="space-y-2">
                {/* Stage header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {index > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {conversionFromPrevious}% from previous
                      </span>
                    )}
                    <span className="text-sm font-bold tabular-nums">
                      {stage.count}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      ({percentage}%)
                    </span>
                  </div>
                </div>

                {/* Horizontal bar */}
                <div className="relative h-8 w-full overflow-hidden rounded-lg bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-lg transition-all duration-500",
                      index === 0 && "bg-blue-500",
                      index === 1 && "bg-indigo-500",
                      index === 2 && "bg-violet-500",
                      index === 3 && "bg-purple-500"
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional metrics */}
        {data.avgTimeToComplete !== undefined && data.avgTimeToComplete > 0 && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Average time to complete
              </span>
              <span className="text-sm font-semibold">
                {data.avgTimeToComplete === 1
                  ? "1 day"
                  : `${data.avgTimeToComplete.toFixed(1)} days`}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
