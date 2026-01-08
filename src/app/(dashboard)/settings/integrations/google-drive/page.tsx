"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Cloud,
  FolderOpen,
  Loader2,
  RefreshCw,
  Settings2,
  Trash2,
  Upload,
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConnectionStatus {
  connected: boolean;
  accountEmail: string | null;
  connectedAt: string | null;
  lastSync: string | null;
  tokenExpired?: boolean;
  settings: {
    folderId?: string;
    folderName?: string;
    autoBackup: boolean;
    subfolderPattern: "none" | "monthly" | "yearly";
  } | null;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  iconLink?: string;
}

interface DriveFilesResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

export default function GoogleDriveSettingsPage() {
  const [connection, setConnection] = React.useState<ConnectionStatus>({
    connected: false,
    accountEmail: null,
    connectedAt: null,
    lastSync: null,
    settings: null,
  });
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isSavingSettings, setIsSavingSettings] = React.useState(false);

  // Folder picker state
  const [showFolderPicker, setShowFolderPicker] = React.useState(false);
  const [files, setFiles] = React.useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = React.useState(false);
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);
  const [folderPath, setFolderPath] = React.useState<Array<{ id: string; name: string }>>([]);

  // Settings state
  const [autoBackup, setAutoBackup] = React.useState(false);
  const [subfolderPattern, setSubfolderPattern] = React.useState<"none" | "monthly" | "yearly">("none");
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | undefined>();
  const [selectedFolderName, setSelectedFolderName] = React.useState<string | undefined>();

  React.useEffect(() => {
    loadConnectionStatus();
  }, []);

  React.useEffect(() => {
    if (connection.settings) {
      setAutoBackup(connection.settings.autoBackup);
      setSubfolderPattern(connection.settings.subfolderPattern);
      setSelectedFolderId(connection.settings.folderId);
      setSelectedFolderName(connection.settings.folderName);
    }
  }, [connection.settings]);

  const loadConnectionStatus = async () => {
    try {
      const response = await fetch("/api/integrations/google-drive/status");
      const data = await response.json();
      setConnection(data);
    } catch (error) {
      console.error("Failed to load connection status:", error);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch("/api/integrations/google-drive/connect");
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await fetch("/api/integrations/google-drive/disconnect", { method: "POST" });
      setConnection({
        connected: false,
        accountEmail: null,
        connectedAt: null,
        lastSync: null,
        settings: null,
      });
    } catch (error) {
      console.error("Failed to disconnect:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRefreshConnection = async () => {
    setIsRefreshing(true);
    try {
      await loadConnectionStatus();
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const response = await fetch("/api/integrations/google-drive/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId: selectedFolderId,
          folderName: selectedFolderName,
          autoBackup,
          subfolderPattern,
        }),
      });

      if (response.ok) {
        await loadConnectionStatus();
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const loadFiles = async (folderId?: string) => {
    setIsLoadingFiles(true);
    try {
      const url = new URL("/api/integrations/google-drive/files", window.location.origin);
      if (folderId) {
        url.searchParams.set("folderId", folderId);
      }
      const response = await fetch(url);
      const data: DriveFilesResponse = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleOpenFolderPicker = () => {
    setShowFolderPicker(true);
    setCurrentFolderId(null);
    setFolderPath([]);
    loadFiles();
  };

  const handleSelectFolder = (file: DriveFile) => {
    if (file.mimeType === "application/vnd.google-apps.folder") {
      const newPath = [...folderPath, { id: file.id, name: file.name }];
      setFolderPath(newPath);
      setCurrentFolderId(file.id);
      loadFiles(file.id);
    }
  };

  const handleGoToFolder = (index: number) => {
    if (index === -1) {
      // Go to root
      setFolderPath([]);
      setCurrentFolderId(null);
      loadFiles();
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      const folderId = newPath[newPath.length - 1].id;
      setCurrentFolderId(folderId);
      loadFiles(folderId);
    }
  };

  const handleConfirmFolder = () => {
    if (currentFolderId) {
      setSelectedFolderId(currentFolderId);
      setSelectedFolderName(folderPath[folderPath.length - 1]?.name || "Selected Folder");
    } else {
      setSelectedFolderId(undefined);
      setSelectedFolderName("My Drive (Root)");
    }
    setShowFolderPicker(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const settingsChanged =
    connection.settings?.autoBackup !== autoBackup ||
    connection.settings?.subfolderPattern !== subfolderPattern ||
    connection.settings?.folderId !== selectedFolderId;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/integrations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background">
            <svg className="h-7 w-7" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
              <path
                d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
                fill="#0066da"
              />
              <path
                d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
                fill="#00ac47"
              />
              <path
                d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
                fill="#ea4335"
              />
              <path
                d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
                fill="#00832d"
              />
              <path
                d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
                fill="#2684fc"
              />
              <path
                d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
                fill="#ffba00"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Google Drive</h1>
            <p className="text-sm text-muted-foreground">
              Automatically backup documents to Google Drive
            </p>
          </div>
        </div>
      </div>

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>
                Connect your Google Drive account to enable auto-backup of completed documents.
              </CardDescription>
            </div>
            {connection.connected ? (
              <Badge className="bg-green-600">
                <Check className="mr-1 h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary">Not Connected</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {connection.connected ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Account</p>
                    <p className="text-sm text-muted-foreground">
                      {connection.accountEmail || "Connected Account"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Connected Since</p>
                    <p className="text-sm text-muted-foreground">
                      {connection.connectedAt
                        ? formatDate(connection.connectedAt)
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Your Google Drive account is connected and ready for backups.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshConnection}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Cloud className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium">No Connection</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Connect your Google Drive account to enable automatic backups.
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  What you can do after connecting:
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Automatically backup completed documents
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Upload signed PDFs to a specific folder
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Organize backups by month or year
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          {connection.connected ? (
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Disconnect
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Connect Google Drive
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Backup Settings */}
      {connection.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Backup Settings
            </CardTitle>
            <CardDescription>
              Configure how documents are backed up to Google Drive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Backup Folder */}
            <div className="space-y-2">
              <Label>Backup Folder</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 justify-start"
                  onClick={handleOpenFolderPicker}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  {selectedFolderName || "Select a folder..."}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose where completed documents will be saved in your Google Drive.
              </p>
            </div>

            {/* Auto-Backup Toggle */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="auto-backup">Automatic Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically upload documents to Google Drive when completed
                </p>
              </div>
              <Switch
                id="auto-backup"
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
              />
            </div>

            {/* Subfolder Pattern */}
            <div className="space-y-2">
              <Label htmlFor="subfolder-pattern">Subfolder Organization</Label>
              <Select
                value={subfolderPattern}
                onValueChange={(value) => setSubfolderPattern(value as "none" | "monthly" | "yearly")}
              >
                <SelectTrigger id="subfolder-pattern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None - Save directly to folder</SelectItem>
                  <SelectItem value="monthly">Monthly - Create subfolders by month</SelectItem>
                  <SelectItem value="yearly">Yearly - Create subfolders by year</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Organize backups into subfolders by time period
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button
              onClick={handleSaveSettings}
              disabled={isSavingSettings || !settingsChanged}
              className="w-full"
            >
              {isSavingSettings ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Folder Picker Dialog */}
      <Dialog open={showFolderPicker} onOpenChange={setShowFolderPicker}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Backup Folder</DialogTitle>
            <DialogDescription>
              Choose where to save your completed documents in Google Drive.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleGoToFolder(-1)}
                className="h-auto p-1"
              >
                My Drive
              </Button>
              {folderPath.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  <span className="text-muted-foreground">/</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleGoToFolder(index)}
                    className="h-auto p-1"
                  >
                    {folder.name}
                  </Button>
                </React.Fragment>
              ))}
            </div>

            {/* File List */}
            <ScrollArea className="h-[400px] rounded-md border">
              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : files.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No folders found
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {files
                    .filter((file) => file.mimeType === "application/vnd.google-apps.folder")
                    .map((file) => (
                      <button
                        key={file.id}
                        onClick={() => handleSelectFolder(file)}
                        className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-muted"
                      >
                        <FolderOpen className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{file.name}</span>
                      </button>
                    ))}
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFolderPicker(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmFolder}>
              Select {folderPath.length > 0 ? "This" : "Root"} Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Section */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Understanding automatic backups to Google Drive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">When are documents backed up?</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>- When a document status changes to "completed"</li>
                <li>- When all required signatures are collected</li>
                <li>- Only if auto-backup is enabled</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">What gets uploaded?</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>- Final signed PDF with all signatures</li>
                <li>- Original filename with timestamp</li>
                <li>- Organized in your chosen folder structure</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
