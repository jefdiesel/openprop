"use client";

import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, Youtube, ExternalLink } from "lucide-react";
import type { VideoBlockData, BlockComponentProps } from "@/types/blocks";

// Extract video ID and provider from URL
function parseVideoUrl(url: string): { provider: VideoBlockData["provider"]; embedUrl: string | null } {
  if (!url) {
    return { provider: undefined, embedUrl: null };
  }

  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
    };
  }

  // Loom
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (loomMatch) {
    return {
      provider: "loom",
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      provider: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  // Other - try to use as-is if it looks like an embed URL
  if (url.includes("embed") || url.includes("player")) {
    return { provider: "other", embedUrl: url };
  }

  return { provider: undefined, embedUrl: null };
}

function getProviderIcon(provider?: VideoBlockData["provider"]) {
  switch (provider) {
    case "youtube":
      return <Youtube className="h-5 w-5" />;
    case "loom":
      return <Video className="h-5 w-5" />;
    default:
      return <Video className="h-5 w-5" />;
  }
}

function getProviderName(provider?: VideoBlockData["provider"]) {
  switch (provider) {
    case "youtube":
      return "YouTube";
    case "loom":
      return "Loom";
    case "vimeo":
      return "Vimeo";
    case "other":
      return "Video";
    default:
      return "Video";
  }
}

export function VideoBlock({
  block,
  mode,
  onChange,
}: BlockComponentProps<VideoBlockData>) {
  const { provider, embedUrl } = useMemo(() => parseVideoUrl(block.url), [block.url]);

  const handleUrlChange = useCallback(
    (url: string) => {
      if (onChange) {
        const { provider } = parseVideoUrl(url);
        onChange({ ...block, url, provider });
      }
    },
    [block, onChange]
  );

  // View/Sign mode
  if (mode === "view" || mode === "sign") {
    if (!embedUrl) {
      return null;
    }

    return (
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Embedded video"
        />
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4">
      {embedUrl ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getProviderIcon(provider)}
            <span>{getProviderName(provider)} Video</span>
          </div>
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full rounded-lg border"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded video"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8">
          <Video className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground text-center">
            Enter a YouTube, Loom, or Vimeo URL below
          </p>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="video-url">Video URL</Label>
        <div className="flex items-center gap-2">
          <Input
            id="video-url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={block.url}
            onChange={(e) => handleUrlChange(e.target.value)}
          />
          {block.url && (
            <a
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Supports YouTube, Loom, and Vimeo URLs
        </p>
      </div>
    </div>
  );
}
