"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

interface InscriptionCertificateProps {
  hash: string;
  txHash: string;
  verifiedAt: Date;
  baseScanUrl: string;
}

export function InscriptionCertificate({
  hash,
  txHash,
  verifiedAt,
  baseScanUrl,
}: InscriptionCertificateProps) {
  const handleCopyHash = () => {
    navigator.clipboard.writeText(hash);
    toast.success("Hash copied to clipboard");
  };

  const formattedDate = verifiedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <Card className="overflow-hidden max-w-md mx-auto">
      {/* Header with logo */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 p-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-900">
            <Send className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold text-white">OpenProposal</span>
        </div>
        <p className="text-zinc-400 text-sm mt-2">Inscription</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 bg-white">
        {/* Date */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Recorded on Base</p>
          <p className="font-medium text-lg">{formattedDate}</p>
        </div>

        {/* Hash */}
        <div className="bg-zinc-50 rounded-lg p-4 border">
          <p className="text-xs text-muted-foreground mb-2 text-center">Document Hash</p>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono break-all flex-1 text-center">
              {hash}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyHash}
              className="shrink-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* BaseScan Link */}
        <div className="text-center">
          <Button asChild variant="outline" size="sm">
            <a href={baseScanUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-2" />
              View on BaseScan
            </a>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-zinc-100 px-6 py-3 text-center border-t">
        <p className="text-sm text-muted-foreground">sendprop.com</p>
      </div>
    </Card>
  );
}
