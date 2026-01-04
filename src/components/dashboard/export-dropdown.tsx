"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function ExportDropdown() {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (type: "documents" | "payments") => {
    setIsExporting(type);
    try {
      const response = await fetch(`/api/export/${type}`);

      if (!response.ok) {
        throw new Error(`Failed to export ${type}`);
      }

      // Get the blob and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`${type === "documents" ? "Documents" : "Payments"} exported successfully`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export ${type}`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting !== null}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export to CSV</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport("documents")}
          disabled={isExporting !== null}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Documents
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("payments")}
          disabled={isExporting !== null}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Payments
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
