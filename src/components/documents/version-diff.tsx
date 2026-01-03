"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Block } from "@/types/database";

interface VersionDiffProps {
  oldVersion: {
    title: string;
    content: Block[];
    versionNumber: number;
  };
  newVersion: {
    title: string;
    content: Block[];
    versionNumber: number;
  };
  viewMode?: "unified" | "side-by-side";
}

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNumber?: number;
}

interface BlockDiff {
  type: "added" | "removed" | "modified" | "unchanged";
  oldBlock?: Block;
  newBlock?: Block;
  textDiff?: DiffLine[];
}

function getTextFromBlock(block: Block): string {
  if (!block) return "";

  switch (block.type) {
    case "text":
      return block.content || "";
    case "heading":
      return `# ${block.content || ""}`;
    case "signature":
      return block.signedData ? "[Signed]" : "[Signature: Sign here]";
    case "image":
      return `[Image: ${block.alt || "Image"}]`;
    case "divider":
      return "---";
    case "spacer":
      return "";
    case "table":
      return `[Table: ${(block.rows?.length || 0)} rows]`;
    case "pricing-table":
      return `[Pricing Table: ${(block.items?.length || 0)} items]`;
    case "payment":
      return `[Payment: ${block.amount || 0} ${block.currency || "USD"}]`;
    case "date":
      return block.value || "[Date field]";
    case "checkbox":
      return block.checked ? `[x] ${block.label}` : `[ ] ${block.label}`;
    case "text-input":
      return block.value || `[Input: ${block.label || "Text field"}]`;
    case "page-break":
      return "--- Page Break ---";
    default:
      return JSON.stringify(block);
  }
}

function computeTextDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const diff: DiffLine[] = [];

  // Simple LCS-based diff
  const lcs = computeLCS(oldLines, newLines);

  let oldIdx = 0;
  let newIdx = 0;
  let lcsIdx = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (lcsIdx < lcs.length && oldIdx < oldLines.length && oldLines[oldIdx] === lcs[lcsIdx]) {
      if (newIdx < newLines.length && newLines[newIdx] === lcs[lcsIdx]) {
        diff.push({ type: "unchanged", content: lcs[lcsIdx], lineNumber: newIdx + 1 });
        oldIdx++;
        newIdx++;
        lcsIdx++;
      } else if (newIdx < newLines.length) {
        diff.push({ type: "added", content: newLines[newIdx], lineNumber: newIdx + 1 });
        newIdx++;
      }
    } else if (oldIdx < oldLines.length) {
      diff.push({ type: "removed", content: oldLines[oldIdx] });
      oldIdx++;
    } else if (newIdx < newLines.length) {
      diff.push({ type: "added", content: newLines[newIdx], lineNumber: newIdx + 1 });
      newIdx++;
    }
  }

  return diff;
}

function computeLCS(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const lcs: string[] = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
}

function computeBlockDiff(oldContent: Block[], newContent: Block[]): BlockDiff[] {
  const diffs: BlockDiff[] = [];
  const oldMap = new Map(oldContent.map(b => [b.id, b]));
  const newMap = new Map(newContent.map(b => [b.id, b]));

  // Find removed and modified blocks
  for (const oldBlock of oldContent) {
    const newBlock = newMap.get(oldBlock.id);
    if (!newBlock) {
      diffs.push({ type: "removed", oldBlock });
    } else {
      const oldText = getTextFromBlock(oldBlock);
      const newText = getTextFromBlock(newBlock);
      if (oldText !== newText) {
        diffs.push({
          type: "modified",
          oldBlock,
          newBlock,
          textDiff: computeTextDiff(oldText, newText),
        });
      } else {
        diffs.push({ type: "unchanged", oldBlock, newBlock });
      }
    }
  }

  // Find added blocks
  for (const newBlock of newContent) {
    if (!oldMap.has(newBlock.id)) {
      diffs.push({ type: "added", newBlock });
    }
  }

  return diffs;
}

function DiffLineView({ line }: { line: DiffLine }) {
  return (
    <div
      className={cn(
        "px-4 py-0.5 font-mono text-sm whitespace-pre-wrap",
        line.type === "added" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        line.type === "removed" && "bg-red-100 text-red-800 line-through dark:bg-red-900/30 dark:text-red-300",
        line.type === "unchanged" && "text-muted-foreground"
      )}
    >
      <span className="inline-block w-6 text-xs text-muted-foreground mr-2">
        {line.type === "added" && "+"}
        {line.type === "removed" && "-"}
        {line.type === "unchanged" && " "}
      </span>
      {line.content || " "}
    </div>
  );
}

function BlockDiffView({ diff }: { diff: BlockDiff }) {
  if (diff.type === "unchanged") {
    return (
      <div className="border-l-2 border-transparent pl-2 py-2 opacity-60">
        <span className="text-sm text-muted-foreground">
          {getTextFromBlock(diff.newBlock!)}
        </span>
      </div>
    );
  }

  if (diff.type === "added") {
    return (
      <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-r">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-green-700 dark:text-green-300 bg-green-200 dark:bg-green-800 px-2 py-0.5 rounded">
            + Added Block
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {diff.newBlock?.type}
          </span>
        </div>
        <div className="text-sm text-green-800 dark:text-green-200">
          {getTextFromBlock(diff.newBlock!)}
        </div>
      </div>
    );
  }

  if (diff.type === "removed") {
    return (
      <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-r">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-red-700 dark:text-red-300 bg-red-200 dark:bg-red-800 px-2 py-0.5 rounded">
            - Removed Block
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {diff.oldBlock?.type}
          </span>
        </div>
        <div className="text-sm text-red-800 dark:text-red-200 line-through">
          {getTextFromBlock(diff.oldBlock!)}
        </div>
      </div>
    );
  }

  if (diff.type === "modified") {
    return (
      <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-r">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-200 dark:bg-yellow-800 px-2 py-0.5 rounded">
            ~ Modified Block
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {diff.newBlock?.type}
          </span>
        </div>
        <div className="space-y-0 rounded border overflow-hidden">
          {diff.textDiff?.map((line, idx) => (
            <DiffLineView key={idx} line={line} />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export function VersionDiff({ oldVersion, newVersion, viewMode = "unified" }: VersionDiffProps) {
  const blockDiffs = React.useMemo(
    () => computeBlockDiff(oldVersion.content || [], newVersion.content || []),
    [oldVersion.content, newVersion.content]
  );

  const titleChanged = oldVersion.title !== newVersion.title;
  const hasChanges = titleChanged || blockDiffs.some(d => d.type !== "unchanged");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            Comparing:
          </span>
          <span className="font-medium text-red-600 dark:text-red-400">
            Version {oldVersion.versionNumber}
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="font-medium text-green-600 dark:text-green-400">
            Version {newVersion.versionNumber}
          </span>
        </div>
        {!hasChanges && (
          <span className="text-sm text-muted-foreground">
            No changes
          </span>
        )}
      </div>

      {/* Title diff */}
      {titleChanged && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Title
          </h4>
          <div className="rounded border overflow-hidden">
            <div className="bg-red-100 dark:bg-red-900/30 px-4 py-2 text-red-800 dark:text-red-300 line-through">
              <span className="text-xs mr-2">-</span>
              {oldVersion.title}
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 text-green-800 dark:text-green-300">
              <span className="text-xs mr-2">+</span>
              {newVersion.title}
            </div>
          </div>
        </div>
      )}

      {/* Content diff */}
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Content Blocks
        </h4>
        <div className="space-y-2">
          {blockDiffs.map((diff, idx) => (
            <BlockDiffView key={idx} diff={diff} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 pt-4 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span>Added</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span>Removed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded" />
          <span>Modified</span>
        </div>
      </div>
    </div>
  );
}
