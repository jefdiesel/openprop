"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  Link2,
  Loader2,
  Search,
  Settings,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

// Types
interface PandaDocItem {
  id: string;
  name: string;
  type: "template" | "document";
  status?: string;
  dateCreated: string;
  dateModified: string;
}

// Mock data for templates and documents
const mockTemplates: PandaDocItem[] = [
  {
    id: "tpl_1",
    name: "Service Agreement Template",
    type: "template",
    dateCreated: "2024-01-01T10:00:00Z",
    dateModified: "2024-01-10T15:30:00Z",
  },
  {
    id: "tpl_2",
    name: "Project Proposal Template",
    type: "template",
    dateCreated: "2023-12-15T09:00:00Z",
    dateModified: "2024-01-05T11:20:00Z",
  },
  {
    id: "tpl_3",
    name: "NDA Template",
    type: "template",
    dateCreated: "2023-11-20T14:00:00Z",
    dateModified: "2023-12-28T16:45:00Z",
  },
  {
    id: "tpl_4",
    name: "Consulting Agreement",
    type: "template",
    dateCreated: "2023-10-10T08:00:00Z",
    dateModified: "2024-01-02T09:15:00Z",
  },
  {
    id: "tpl_5",
    name: "Sales Quote Template",
    type: "template",
    dateCreated: "2023-09-05T11:00:00Z",
    dateModified: "2023-12-20T13:30:00Z",
  },
];

const mockDocuments: PandaDocItem[] = [
  {
    id: "doc_1",
    name: "Acme Corp - Service Agreement",
    type: "document",
    status: "completed",
    dateCreated: "2024-01-12T10:00:00Z",
    dateModified: "2024-01-14T15:30:00Z",
  },
  {
    id: "doc_2",
    name: "Tech Startup - Project Proposal",
    type: "document",
    status: "completed",
    dateCreated: "2024-01-08T09:00:00Z",
    dateModified: "2024-01-10T11:20:00Z",
  },
  {
    id: "doc_3",
    name: "Global Inc - NDA",
    type: "document",
    status: "draft",
    dateCreated: "2024-01-05T14:00:00Z",
    dateModified: "2024-01-06T16:45:00Z",
  },
];

type ImportStep = "connect" | "select" | "configure" | "import" | "success";

interface ImportOptions {
  importAsTemplates: boolean;
  preserveVariables: boolean;
  includeSignatureFields: boolean;
  includePricingTables: boolean;
}

export default function PandaDocImportPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<ImportStep>("connect");
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [contentType, setContentType] = React.useState<"templates" | "documents">("templates");
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());
  const [importOptions, setImportOptions] = React.useState<ImportOptions>({
    importAsTemplates: true,
    preserveVariables: true,
    includeSignatureFields: true,
    includePricingTables: true,
  });
  const [importProgress, setImportProgress] = React.useState(0);
  const [importedCount, setImportedCount] = React.useState(0);
  const [failedCount, setFailedCount] = React.useState(0);

  const items = contentType === "templates" ? mockTemplates : mockDocuments;
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check connection on mount
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/integrations/pandadoc/status");
        if (response.ok) {
          const data = await response.json();
          setIsConnected(data.connected);
          if (data.connected) {
            setCurrentStep("select");
          }
        }
      } catch {
        // Not connected
      }
    };
    checkConnection();
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/integrations/pandadoc/connect");
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        // For demo, simulate connection
        setIsConnected(true);
        setCurrentStep("select");
      }
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item.id)));
    }
  };

  const handleToggleItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleStartImport = async () => {
    setCurrentStep("import");
    setImportProgress(0);
    setImportedCount(0);
    setFailedCount(0);

    const totalItems = selectedItems.size;
    let processed = 0;
    let failed = 0;

    // Simulate import process
    for (const itemId of selectedItems) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      processed++;

      // Simulate occasional failures (10% chance)
      if (Math.random() < 0.1) {
        failed++;
        setFailedCount(failed);
      } else {
        setImportedCount(processed - failed);
      }

      setImportProgress(Math.round((processed / totalItems) * 100));
    }

    // Complete
    setCurrentStep("success");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const steps = [
    { id: "connect", label: "Connect", icon: Link2 },
    { id: "select", label: "Select", icon: FileText },
    { id: "configure", label: "Configure", icon: Settings },
    { id: "import", label: "Import", icon: Upload },
    { id: "success", label: "Done", icon: Check },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = index < currentStepIndex;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    index < currentStepIndex ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const renderConnectStep = () => (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <svg
            className="h-8 w-8"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="8" fill="#4CAF50" />
            <path
              d="M8 10h5c2.5 0 4.5 2 4.5 4.5S15.5 19 13 19H10v4H8V10zm5 7c1.4 0 2.5-1.1 2.5-2.5S14.4 12 13 12h-3v5h3z"
              fill="white"
            />
            <path d="M19 10h5v2h-3v3h2v2h-2v6h-2V10z" fill="white" />
          </svg>
        </div>
        <CardTitle>Connect to PandaDoc</CardTitle>
        <CardDescription>
          Sign in to your PandaDoc account to import your templates and documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium mb-2">SendProp will be able to:</p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Read your templates and documents
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Access document content and metadata
            </li>
            <li className="flex items-center gap-2">
              <X className="h-4 w-4 text-muted-foreground" />
              <span className="line-through">Modify your PandaDoc account</span>
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleConnect} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              Connect with PandaDoc
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderSelectStep = () => (
    <div className="space-y-6">
      {/* Content Type Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={contentType === "templates" ? "default" : "outline"}
            onClick={() => {
              setContentType("templates");
              setSelectedItems(new Set());
            }}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            Templates ({mockTemplates.length})
          </Button>
          <Button
            variant={contentType === "documents" ? "default" : "outline"}
            onClick={() => {
              setContentType("documents");
              setSelectedItems(new Set());
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            Documents ({mockDocuments.length})
          </Button>
        </div>
        <Badge variant="secondary">
          {selectedItems.size} selected
        </Badge>
      </div>

      {/* Search and Select All */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${contentType}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleSelectAll}>
          {selectedItems.size === filteredItems.length ? "Deselect All" : "Select All"}
        </Button>
      </div>

      {/* Items List */}
      <Card>
        <CardContent className="p-0">
          {filteredItems.length > 0 ? (
            <div className="divide-y">
              {filteredItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => handleToggleItem(item.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{item.name}</span>
                      {item.status && (
                        <Badge
                          variant={item.status === "completed" ? "default" : "secondary"}
                          className="shrink-0"
                        >
                          {item.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Modified {formatDate(item.dateModified)}
                    </p>
                  </div>
                  {item.type === "template" ? (
                    <FolderOpen className="h-5 w-5 text-muted-foreground shrink-0" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </label>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-sm font-medium">No results found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search query.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/settings/integrations/pandadoc">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Link>
        </Button>
        <Button
          onClick={() => setCurrentStep("configure")}
          disabled={selectedItems.size === 0}
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderConfigureStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Options</CardTitle>
          <CardDescription>
            Configure how your content should be imported into SendProp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="importAsTemplates"
                checked={importOptions.importAsTemplates}
                onCheckedChange={(checked) =>
                  setImportOptions({ ...importOptions, importAsTemplates: !!checked })
                }
              />
              <div className="space-y-1">
                <Label htmlFor="importAsTemplates" className="font-medium cursor-pointer">
                  Import as templates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Import content as reusable templates that can be used to create new documents.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Checkbox
                id="preserveVariables"
                checked={importOptions.preserveVariables}
                onCheckedChange={(checked) =>
                  setImportOptions({ ...importOptions, preserveVariables: !!checked })
                }
              />
              <div className="space-y-1">
                <Label htmlFor="preserveVariables" className="font-medium cursor-pointer">
                  Preserve variables
                </Label>
                <p className="text-sm text-muted-foreground">
                  Keep PandaDoc tokens and convert them to SendProp variables.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Checkbox
                id="includeSignatureFields"
                checked={importOptions.includeSignatureFields}
                onCheckedChange={(checked) =>
                  setImportOptions({ ...importOptions, includeSignatureFields: !!checked })
                }
              />
              <div className="space-y-1">
                <Label htmlFor="includeSignatureFields" className="font-medium cursor-pointer">
                  Include signature fields
                </Label>
                <p className="text-sm text-muted-foreground">
                  Convert PandaDoc signature fields to SendProp signature blocks.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Checkbox
                id="includePricingTables"
                checked={importOptions.includePricingTables}
                onCheckedChange={(checked) =>
                  setImportOptions({ ...importOptions, includePricingTables: !!checked })
                }
              />
              <div className="space-y-1">
                <Label htmlFor="includePricingTables" className="font-medium cursor-pointer">
                  Include pricing tables
                </Label>
                <p className="text-sm text-muted-foreground">
                  Import pricing tables with items, quantities, and pricing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Import Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{selectedItems.size}</p>
              <p className="text-sm text-muted-foreground">Items to import</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{contentType === "templates" ? "Templates" : "Documents"}</p>
              <p className="text-sm text-muted-foreground">Content type</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{importOptions.importAsTemplates ? "Yes" : "No"}</p>
              <p className="text-sm text-muted-foreground">As templates</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("select")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleStartImport}>
          Start Import
          <Upload className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderImportStep = () => (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
        <CardTitle>Importing Content</CardTitle>
        <CardDescription>
          Please wait while we import your selected items from PandaDoc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{importProgress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${importProgress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {importedCount}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">Imported</p>
          </div>
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {failedCount}
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">Failed</p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Importing {selectedItems.size} items...
        </p>
      </CardContent>
    </Card>
  );

  const renderSuccessStep = () => (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle>Import Complete!</CardTitle>
        <CardDescription>
          Your content has been successfully imported from PandaDoc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Final Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-2xl font-bold">{selectedItems.size}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {importedCount}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">Success</p>
          </div>
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {failedCount}
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">Failed</p>
          </div>
        </div>

        {failedCount > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-900/20">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium">Some items could not be imported</p>
                <p className="mt-1">
                  {failedCount} item(s) failed to import. This may be due to unsupported
                  content types or formatting issues.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/settings/integrations/pandadoc">
            View History
          </Link>
        </Button>
        <Button className="flex-1" asChild>
          <Link href={importOptions.importAsTemplates ? "/templates" : "/documents"}>
            View {importOptions.importAsTemplates ? "Templates" : "Documents"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/integrations/pandadoc">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import from PandaDoc</h1>
          <p className="text-sm text-muted-foreground">
            Import your templates and documents into SendProp
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      {currentStep === "connect" && renderConnectStep()}
      {currentStep === "select" && renderSelectStep()}
      {currentStep === "configure" && renderConfigureStep()}
      {currentStep === "import" && renderImportStep()}
      {currentStep === "success" && renderSuccessStep()}
    </div>
  );
}
