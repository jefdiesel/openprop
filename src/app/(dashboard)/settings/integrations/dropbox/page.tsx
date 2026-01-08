"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Cloud,
  ExternalLink,
  Folder,
  FolderOpen,
  Loader2,
  RefreshCw,
  Save,
  Settings2,
  Trash2,
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConnectionStatus {
  connected: boolean;
  accountEmail: string | null;
  accountId: string | null;
  connectedAt: string | null;
  lastSync: string | null;
  tokenExpired?: boolean;
  path?: string;
  autoBackup?: boolean;
  subfolderPattern?: string;
}

interface FolderItem {
  id: string;
  name: string;
  path: string;
  type: "folder";
}

interface DropboxSettings {
  path: string;
  autoBackup: boolean;
  subfolderPattern: string;
}

export default function DropboxSettingsPage() {
  const [connection, setConnection] = React.useState<ConnectionStatus>({
    connected: false,
    accountEmail: null,
    accountId: null,
    connectedAt: null,
    lastSync: null,
  });
  const [settings, setSettings] = React.useState<DropboxSettings>({
    path: "/OpenProposal",
    autoBackup: false,
    subfolderPattern: "monthly",
  });
  const [folders, setFolders] = React.useState<FolderItem[]>([]);
  const [currentPath, setCurrentPath] = React.useState("");
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoadingFolders, setIsLoadingFolders] = React.useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = React.useState(false);
  const [tempPath, setTempPath] = React.useState(settings.path);

  // Load connection status on mount
  React.useEffect(() => {
    loadConnectionStatus();
  }, []);

  // Load settings when connected
  React.useEffect(() => {
    if (connection.connected) {
      loadSettings();
    }
  }, [connection.connected]);

  const loadConnectionStatus = async () => {
    try {
      const response = await fetch("/api/integrations/dropbox/status");
      const data = await response.json();
      setConnection(data);
    } catch (error) {
      console.error("Failed to load connection status:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/integrations/dropbox/settings");
      const data = await response.json();
      setSettings(data);
      setTempPath(data.path);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const loadFolders = async (path: string) => {
    setIsLoadingFolders(true);
    try {
      const response = await fetch(
        `/api/integrations/dropbox/files?path=${encodeURIComponent(path)}`
      );
      const data = await response.json();
      setFolders(data.folders || []);
      setCurrentPath(path);
    } catch (error) {
      console.error("Failed to load folders:", error);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch("/api/integrations/dropbox/connect");
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
      await fetch("/api/integrations/dropbox/disconnect", { method: "POST" });
      setConnection({
        connected: false,
        accountEmail: null,
        accountId: null,
        connectedAt: null,
        lastSync: null,
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
    setIsSaving(true);
    try {
      const response = await fetch("/api/integrations/dropbox/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        await loadConnectionStatus();
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFolderSelect = (path: string) => {
    setTempPath(path);
  };

  const handleConfirmFolderSelection = () => {
    setSettings({ ...settings, path: tempPath });
    setFolderDialogOpen(false);
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
            <Cloud className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dropbox</h1>
            <p className="text-sm text-muted-foreground">
              Auto-backup signed PDFs and manage attachments
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
                Connect your Dropbox account to enable automatic backups.
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
                  Your Dropbox account is connected and ready for backups.
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
                  Connect your Dropbox account to enable automatic backups.
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  What you can do after connecting:
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Automatically backup signed PDFs to Dropbox
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Organize backups by month or year
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Access your files from anywhere
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
                  Connect Dropbox
                  <ArrowRight className="ml-2 h-4 w-4" />
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
            <CardTitle>Backup Settings</CardTitle>
            <CardDescription>
              Configure where and how signed PDFs are backed up to Dropbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auto-backup toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex-1">
                <Label htmlFor="auto-backup" className="text-base font-medium">
                  Automatic Backup
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically upload signed PDFs to Dropbox
                </p>
              </div>
              <Switch
                id="auto-backup"
                checked={settings.autoBackup}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoBackup: checked })
                }
              />
            </div>

            {/* Folder path */}
            <div className="space-y-2">
              <Label htmlFor="folder-path">Backup Folder</Label>
              <div className="flex gap-2">
                <Input
                  id="folder-path"
                  value={settings.path}
                  readOnly
                  placeholder="/OpenProposal"
                />
                <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTempPath(settings.path);
                        loadFolders("");
                      }}
                    >
                      <Folder className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Select Backup Folder</DialogTitle>
                      <DialogDescription>
                        Choose where to save your signed PDFs in Dropbox
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FolderOpen className="h-4 w-4" />
                        <span>{currentPath || "/"}</span>
                      </div>
                      <ScrollArea className="h-[300px] rounded-md border">
                        {isLoadingFolders ? (
                          <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : folders.length > 0 ? (
                          <div className="p-2">
                            {currentPath !== "" && (
                              <div
                                className="flex items-center gap-2 rounded-md p-2 hover:bg-muted cursor-pointer"
                                onClick={() => {
                                  const parentPath = currentPath.substring(
                                    0,
                                    currentPath.lastIndexOf("/")
                                  );
                                  loadFolders(parentPath);
                                }}
                              >
                                <Folder className="h-4 w-4" />
                                <span>..</span>
                              </div>
                            )}
                            {folders.map((folder) => (
                              <div
                                key={folder.id}
                                className="flex items-center justify-between gap-2 rounded-md p-2 hover:bg-muted cursor-pointer"
                                onClick={() => loadFolders(folder.path)}
                              >
                                <div className="flex items-center gap-2">
                                  <Folder className="h-4 w-4" />
                                  <span className="text-sm">{folder.name}</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFolderSelect(folder.path);
                                  }}
                                >
                                  Select
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 text-center">
                            <Folder className="h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-2 text-sm text-muted-foreground">
                              No folders found
                            </p>
                          </div>
                        )}
                      </ScrollArea>
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">
                          Selected: {tempPath || "/"}
                        </p>
                        <Button onClick={handleConfirmFolderSelection}>
                          Confirm Selection
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-sm text-muted-foreground">
                Dropbox folder where signed PDFs will be saved
              </p>
            </div>

            {/* Subfolder pattern */}
            <div className="space-y-2">
              <Label htmlFor="subfolder-pattern">Organization Pattern</Label>
              <Select
                value={settings.subfolderPattern}
                onValueChange={(value) =>
                  setSettings({ ...settings, subfolderPattern: value })
                }
              >
                <SelectTrigger id="subfolder-pattern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    No subfolders (all files in backup folder)
                  </SelectItem>
                  <SelectItem value="monthly">
                    Monthly (e.g., /2026/01/)
                  </SelectItem>
                  <SelectItem value="yearly">
                    Yearly (e.g., /2026/)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                How to organize backed up files into subfolders
              </p>
            </div>

            {/* Example path preview */}
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Example backup path:</p>
              <p className="mt-1 text-sm text-muted-foreground font-mono">
                {settings.path}
                {settings.subfolderPattern === "monthly" && "/2026/01"}
                {settings.subfolderPattern === "yearly" && "/2026"}
                /proposal-signed.pdf
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Help Section */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Understand how Dropbox backup integration works.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Automatic Backups</h4>
            <p className="text-sm text-muted-foreground">
              When auto-backup is enabled, every time a proposal is signed and finalized,
              the signed PDF will automatically be uploaded to your chosen Dropbox folder.
              Files are organized according to your selected pattern (monthly, yearly, or none).
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">File Organization</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>- <strong>None:</strong> All files in the root backup folder</li>
              <li>- <strong>Monthly:</strong> Organized by year and month (e.g., 2026/01/)</li>
              <li>- <strong>Yearly:</strong> Organized by year only (e.g., 2026/)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Security</h4>
            <p className="text-sm text-muted-foreground">
              Your Dropbox credentials are securely stored and encrypted. We only access
              the folders you specify and never read your other files.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
