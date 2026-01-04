"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InscriptionCertificate } from "./inscription-certificate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Shield, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface VerificationData {
  verified: boolean;
  configured: boolean;
  canVerify?: boolean;
  txHash?: string;
  documentHash?: string;
  verifiedAt?: string;
  baseScanUrl?: string;
}

interface VerificationSectionProps {
  documentId: string;
  documentTitle: string;
  documentStatus: string;
  className?: string;
}

export function VerificationSection({
  documentId,
  documentStatus,
  className,
}: VerificationSectionProps) {
  const [data, setData] = useState<VerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInscribing, setIsInscribing] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/verify`);
      setData(await res.json());
    } catch {
      setData({ verified: false, configured: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [documentId]);

  const handleInscribe = async () => {
    setIsInscribing(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/verify`, {
        method: "POST",
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to inscribe");
      }

      toast.success("Inscribed on Base");
      fetchStatus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Inscription failed");
    } finally {
      setIsInscribing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not completed yet
  if (documentStatus !== "completed") {
    return (
      <Card className={className}>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">Blockchain Inscription</p>
              <p className="text-sm text-muted-foreground">
                Available after all signatures are collected.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not configured
  if (!data?.configured) {
    return null; // Don't show if not configured
  }

  // Already inscribed
  if (data?.txHash && data?.documentHash && data?.verifiedAt) {
    return (
      <Card className={className}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Inscribed on Base</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(data.verifiedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    View Inscription
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md p-0 overflow-hidden">
                  <DialogHeader>
                    <DialogTitle className="sr-only">Inscription Certificate</DialogTitle>
                  </DialogHeader>
                  <InscriptionCertificate
                    hash={data.documentHash}
                    txHash={data.txHash}
                    verifiedAt={new Date(data.verifiedAt)}
                    baseScanUrl={data.baseScanUrl!}
                  />
                </DialogContent>
              </Dialog>
              <Button asChild variant="ghost" size="sm">
                <a href={data.baseScanUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Can inscribe
  return (
    <Card className={className}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">Blockchain Inscription</p>
              <p className="text-sm text-muted-foreground">
                Record document hash on Base.
              </p>
            </div>
          </div>
          <Button
            onClick={handleInscribe}
            disabled={isInscribing}
            variant="outline"
            size="sm"
          >
            {isInscribing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Inscribing...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Inscribe
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
