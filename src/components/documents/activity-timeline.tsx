"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  PenTool,
  Clock,
  ScrollText,
  Send,
  XCircle,
  CreditCard,
  FileEdit,
  Focus,
  MousePointerClick,
  Activity,
  Lock,
  ShieldCheck,
  Link2,
  Download,
  LayoutGrid,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DocumentEvent {
  id: string;
  document_id: string;
  recipient_id: string | null;
  event_type: string;
  event_data: Record<string, unknown> | null;
  created_at: string | null;
  recipient: {
    name: string | null;
    email: string;
  } | null;
}

interface ActivityTimelineProps {
  documentId: string;
  className?: string;
}

// Event type configuration
const eventConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  // Server-side events (from sign/send routes)
  document_viewed: {
    icon: Eye,
    label: "Viewed Document",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  document_signed: {
    icon: PenTool,
    label: "Signed Document",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  document_declined: {
    icon: XCircle,
    label: "Declined to Sign",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  document_sent: {
    icon: Send,
    label: "Document Sent",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  document_locked: {
    icon: Lock,
    label: "Document Locked",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  blockchain_verified: {
    icon: ShieldCheck,
    label: "Blockchain Verified",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  ethscription_completed: {
    icon: ShieldCheck,
    label: "Calldata Inscribed",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  ethscription_failed: {
    icon: XCircle,
    label: "Inscription Failed",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  // Client-side tracking events
  page_view: {
    icon: Eye,
    label: "Opened Document",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  time_spent: {
    icon: Clock,
    label: "Time on Page",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  scroll_depth: {
    icon: ScrollText,
    label: "Scroll Progress",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  session_end: {
    icon: Activity,
    label: "Session Ended",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  page_focus: {
    icon: Focus,
    label: "Returned to Page",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
  page_blur: {
    icon: MousePointerClick,
    label: "Switched Tabs",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  // Payment events
  payment_completed: {
    icon: CreditCard,
    label: "Payment Completed",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  // Edit events
  document_edited: {
    icon: FileEdit,
    label: "Document Edited",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  // Block-level analytics
  block_viewed: {
    icon: LayoutGrid,
    label: "Section Viewed",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  block_times: {
    icon: Timer,
    label: "Section Time",
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
  // Link and download tracking
  link_clicked: {
    icon: Link2,
    label: "Clicked Link",
    color: "text-sky-600",
    bgColor: "bg-sky-100",
  },
  pdf_downloaded: {
    icon: Download,
    label: "Downloaded PDF",
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  // Legacy event types (for backwards compatibility)
  viewed: {
    icon: Eye,
    label: "Viewed",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  signed: {
    icon: PenTool,
    label: "Signed",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  declined: {
    icon: XCircle,
    label: "Declined",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  sent: {
    icon: Send,
    label: "Sent",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  resent: {
    icon: Send,
    label: "Resent",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
};

// Default config for unknown event types
const defaultEventConfig = {
  icon: Activity,
  label: "Activity",
  color: "text-gray-600",
  bgColor: "bg-gray-100",
};

// Format relative time
function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "Unknown time";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "Just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

// Format event data for display
function formatEventData(
  eventType: string,
  eventData: Record<string, unknown> | null
): string | null {
  if (!eventData) return null;

  switch (eventType) {
    case "time_spent":
      const seconds = eventData.seconds as number;
      if (seconds < 60) return `${seconds} seconds`;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0
        ? `${minutes}m ${remainingSeconds}s`
        : `${minutes} minute${minutes === 1 ? "" : "s"}`;

    case "scroll_depth":
      return `${eventData.percentage}% viewed`;

    case "session_end":
      const totalSeconds = eventData.total_time_seconds as number;
      const maxDepth = eventData.max_scroll_depth as number;
      if (!totalSeconds && !maxDepth) return null;
      const timeStr =
        totalSeconds < 60
          ? `${totalSeconds}s`
          : `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;
      return `${timeStr} on page, ${maxDepth}% scrolled`;

    case "declined":
    case "document_declined":
      return eventData.reason ? `Reason: ${eventData.reason}` : null;

    case "document_signed":
      const signatureType = eventData.signature_type as string;
      return signatureType ? `Signature type: ${signatureType}` : null;

    case "document_edited":
      if (eventData.previous_version && eventData.new_version) {
        return `Version ${eventData.previous_version} → ${eventData.new_version}`;
      }
      return null;

    case "blockchain_verified":
      const txHash = eventData.txHash as string;
      return txHash ? `TX: ${txHash.slice(0, 10)}...` : null;

    case "ethscription_completed":
      const ethTxHash = eventData.txHash as string;
      const network = eventData.network as string;
      return ethTxHash ? `${network}: ${ethTxHash.slice(0, 10)}...` : null;

    case "ethscription_failed":
      const ethError = eventData.error as string;
      return ethError ? ethError.slice(0, 50) : "Inscription failed";

    case "document_locked":
      return eventData.reason === "first_signature" ? "First signature received" : null;

    case "block_viewed":
      const blockType = eventData.blockType as string;
      return blockType ? `${blockType} block` : null;

    case "block_times":
      const blocks = eventData.blocks as Record<string, number>;
      if (!blocks) return null;
      const entries = Object.entries(blocks);
      if (entries.length === 0) return null;
      const total = entries.reduce((sum, [, time]) => sum + time, 0);
      return `${entries.length} sections, ${total}s total`;

    case "link_clicked":
      const linkText = eventData.linkText as string;
      const url = eventData.url as string;
      if (linkText) return `"${linkText.slice(0, 30)}${linkText.length > 30 ? '...' : ''}"`;
      if (url) return url.slice(0, 40) + (url.length > 40 ? '...' : '');
      return null;

    case "pdf_downloaded":
      return null;

    default:
      return null;
  }
}

export function ActivityTimeline({
  documentId,
  className,
}: ActivityTimelineProps) {
  const [events, setEvents] = useState<DocumentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(`/api/documents/${documentId}/events`);
        if (!res.ok) throw new Error("Failed to load events");
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvents();
  }, [documentId]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No activity yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          {/* Events */}
          <div className="space-y-4">
            {events.map((event, index) => {
              const config = eventConfig[event.event_type] || defaultEventConfig;
              const Icon = config.icon;
              const formattedData = formatEventData(
                event.event_type,
                event.event_data
              );
              const isFirst = index === 0;

              return (
                <div key={event.id} className="relative flex gap-4 pl-2">
                  {/* Icon */}
                  <div
                    className={cn(
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      config.bgColor
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">{config.label}</span>
                      {isFirst && (
                        <Badge variant="secondary" className="text-xs">
                          Latest
                        </Badge>
                      )}
                    </div>

                    {/* Recipient info */}
                    {event.recipient && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {event.recipient.name || event.recipient.email}
                      </p>
                    )}

                    {/* Event data */}
                    {formattedData && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {formattedData}
                      </p>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(event.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
