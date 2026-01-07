"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  Users,
  Clock,
  ArrowDown,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DocumentAnalyticsProps {
  documentId: string;
  className?: string;
}

interface AnalyticsData {
  totalViews: number;
  uniqueViewers: number;
  avgTimeSpent: number; // in seconds
  avgScrollDepth: number; // percentage
  completionRate: number; // percentage
  viewsByDay: Array<{
    date: string;
    views: number;
  }>;
  blockEngagement: Array<{
    blockId: string;
    blockType: string;
    viewCount: number;
  }>;
}

// Format time in seconds to "Xm Ys"
function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

// Format percentage
function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function DocumentAnalytics({
  documentId,
  className,
}: DocumentAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/documents/${documentId}/analytics`);
        if (!res.ok) throw new Error("Failed to load analytics");
        const data = await res.json();
        // Transform API response to component format
        setAnalytics({
          totalViews: data.summary?.totalViews ?? 0,
          uniqueViewers: data.summary?.uniqueViewers ?? 0,
          avgTimeSpent: data.summary?.avgTimeSpent ?? 0,
          avgScrollDepth: data.summary?.avgScrollDepth ?? 0,
          completionRate: data.summary?.completionRate ?? 0,
          viewsByDay: data.engagement?.viewsByDay ?? [],
          blockEngagement: data.blocks ?? [],
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics"
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, [documentId]);

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              No analytics data available
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxViewsByDay = Math.max(
    ...analytics.viewsByDay.map((d) => d.views),
    1
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Total Views */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Views
                </p>
                <h3 className="text-2xl font-bold tracking-tight">
                  {analytics.totalViews}
                </h3>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Eye className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unique Viewers */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Unique Viewers
                </p>
                <h3 className="text-2xl font-bold tracking-tight">
                  {analytics.uniqueViewers}
                </h3>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg. Time Spent */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Time Spent
                </p>
                <h3 className="text-2xl font-bold tracking-tight">
                  {formatTime(analytics.avgTimeSpent)}
                </h3>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg. Scroll Depth */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Scroll Depth
                </p>
                <h3 className="text-2xl font-bold tracking-tight">
                  {formatPercentage(analytics.avgScrollDepth)}
                </h3>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <ArrowDown className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </p>
                <h3 className="text-2xl font-bold tracking-tight">
                  {formatPercentage(analytics.completionRate)}
                </h3>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Views by Day */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Views by Day</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.viewsByDay.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No daily view data available
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.viewsByDay.map((day) => {
                const barWidth = (day.views / maxViewsByDay) * 100;
                const date = new Date(day.date);
                const formattedDate = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div key={day.date} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formattedDate}
                      </span>
                      <span className="font-medium">{day.views} views</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Block Engagement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Block Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.blockEngagement.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No block engagement data available
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.blockEngagement.map((block, index) => (
                <div
                  key={block.blockId}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {block.blockType.replace(/_/g, " ")} Block
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {block.blockId.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {block.viewCount} view{block.viewCount !== 1 ? "s" : ""}
                    </Badge>
                    {index === 0 && (
                      <Badge variant="default" className="text-xs">
                        Top
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
