import * as React from "react";
import { Eye, FileSignature, Send, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActivityType = "sent" | "viewed" | "signed" | "completed" | "expired";

export interface Activity {
  id: string;
  type: ActivityType;
  documentTitle: string;
  recipientName: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: Activity[];
  className?: string;
}

const activityConfig: Record<
  ActivityType,
  { icon: React.ElementType; color: string; label: string }
> = {
  sent: {
    icon: Send,
    color: "text-blue-600 bg-blue-100",
    label: "Document sent to",
  },
  viewed: {
    icon: Eye,
    color: "text-yellow-600 bg-yellow-100",
    label: "Document viewed by",
  },
  signed: {
    icon: FileSignature,
    color: "text-purple-600 bg-purple-100",
    label: "Document signed by",
  },
  completed: {
    icon: CheckCircle,
    color: "text-green-600 bg-green-100",
    label: "Document completed by",
  },
  expired: {
    icon: Clock,
    color: "text-red-600 bg-red-100",
    label: "Document expired for",
  },
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {activities.map((activity, index) => {
        const config = activityConfig[activity.type] || activityConfig.sent;
        const Icon = config.icon;

        return (
          <div
            key={activity.id}
            className={cn(
              "flex items-start gap-3",
              index !== activities.length - 1 &&
                "pb-4 border-b border-border/50"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                config.color
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="text-muted-foreground">{config.label}</span>{" "}
                <span className="font-medium">{activity.recipientName}</span>
              </p>
              <p className="text-sm font-medium truncate">
                {activity.documentTitle}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatRelativeTime(activity.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
