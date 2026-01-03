"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, History, Clock, FileEdit, Send, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VersionDiff } from "@/components/documents/version-diff";
import type { Block } from "@/types/database";

interface Version {
  id: string;
  versionNumber: number;
  title: string;
  content: Block[];
  changeType: "created" | "edited" | "sent" | "resent" | "current";
  changeDescription: string | null;
  createdAt: string;
  createdByUser: {
    name: string | null;
    email: string | null;
  };
}

interface DocumentInfo {
  id: string;
  title: string;
  currentVersion: number;
  status: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const changeTypeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  created: { icon: <FileEdit className="h-4 w-4" />, label: "Created", color: "text-blue-600" },
  edited: { icon: <FileEdit className="h-4 w-4" />, label: "Edited", color: "text-yellow-600" },
  sent: { icon: <Send className="h-4 w-4" />, label: "Sent", color: "text-green-600" },
  resent: { icon: <Send className="h-4 w-4" />, label: "Resent", color: "text-purple-600" },
  current: { icon: <Clock className="h-4 w-4" />, label: "Current", color: "text-primary" },
};

export default function DocumentHistoryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [document, setDocument] = useState<DocumentInfo | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected versions for comparison
  const [oldVersionId, setOldVersionId] = useState<string | null>(null);
  const [newVersionId, setNewVersionId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVersions() {
      try {
        const res = await fetch(`/api/documents/${resolvedParams.id}/versions`);
        if (!res.ok) throw new Error("Failed to load version history");
        const data = await res.json();
        setDocument(data.document);
        setVersions(data.versions);

        // Default: compare previous version to current
        if (data.versions.length >= 2) {
          setNewVersionId(data.versions[0].id); // current
          setOldVersionId(data.versions[1].id); // previous
        } else if (data.versions.length === 1) {
          setNewVersionId(data.versions[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load version history");
      } finally {
        setIsLoading(false);
      }
    }
    fetchVersions();
  }, [resolvedParams.id]);

  const oldVersion = versions.find(v => v.id === oldVersionId);
  const newVersion = versions.find(v => v.id === newVersionId);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading version history...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error || "Document not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/documents/${resolvedParams.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-bold">Version History</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {document.title} - {versions.length} version{versions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/documents/${resolvedParams.id}`}>
            View Document
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Version List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Versions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-0">
            {versions.map((version) => {
              const config = changeTypeConfig[version.changeType] || changeTypeConfig.edited;
              const isSelected = version.id === oldVersionId || version.id === newVersionId;

              return (
                <button
                  key={version.id}
                  onClick={() => {
                    // Toggle selection logic
                    if (version.id === newVersionId) return; // Can't change new version to same
                    if (version.id === oldVersionId) {
                      setOldVersionId(null);
                    } else {
                      setOldVersionId(version.id);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors border-l-2 ${
                    isSelected ? "border-l-primary bg-accent/50" : "border-l-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={config.color}>{config.icon}</span>
                      <span className="font-medium">
                        v{version.versionNumber}
                      </span>
                      {version.changeType === "current" && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(version.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {version.changeDescription || config.label}
                  </p>
                  {version.createdByUser?.name && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {version.createdByUser.name}
                    </p>
                  )}
                </button>
              );
            })}
            {versions.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No version history available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diff Viewer */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Compare Versions</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={oldVersionId || ""}
                  onValueChange={(value) => setOldVersionId(value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Old version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions
                      .filter(v => v.id !== newVersionId)
                      .map((version) => (
                        <SelectItem key={version.id} value={version.id}>
                          v{version.versionNumber}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">→</span>
                <Select
                  value={newVersionId || ""}
                  onValueChange={(value) => setNewVersionId(value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="New version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions
                      .filter(v => v.id !== oldVersionId)
                      .map((version) => (
                        <SelectItem key={version.id} value={version.id}>
                          v{version.versionNumber}
                          {version.changeType === "current" && " (Current)"}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {oldVersion && newVersion ? (
              <VersionDiff
                oldVersion={{
                  title: oldVersion.title,
                  content: oldVersion.content || [],
                  versionNumber: oldVersion.versionNumber,
                }}
                newVersion={{
                  title: newVersion.title,
                  content: newVersion.content || [],
                  versionNumber: newVersion.versionNumber,
                }}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Select two versions to compare</p>
                <p className="text-sm mt-1">
                  Click on versions in the list or use the dropdowns above
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
