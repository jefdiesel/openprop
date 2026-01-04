"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Check,
  Download,
  PartyPopper,
  FileText,
  Mail,
  Share2,
  CreditCard,
  FileCode2,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface EthscriptionInfo {
  network: string;
  recipientAddress: string;
  status: "pending" | "inscribed" | "failed";
  txHash?: string;
  explorerUrl?: string;
}

interface CompletionScreenProps {
  documentTitle: string;
  recipientName?: string;
  recipientEmail: string;
  signedAt: string;
  onDownload?: () => void;
  downloadUrl?: string;
  showConfetti?: boolean;
  className?: string;
  // Payment info
  paymentCollected?: boolean;
  paymentAmount?: number;
  paymentCurrency?: string;
  // Ethscription info
  ethscriptions?: EthscriptionInfo[];
}

// Simple confetti effect
function Confetti() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    delay: number;
    color: string;
    size: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-orange-500",
      "bg-cyan-500",
    ];

    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      duration: Math.random() * 2 + 2,
    }));

    setParticles(newParticles);

    // Clear confetti after animation
    const timer = setTimeout(() => {
      setParticles([]);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={cn("absolute rounded-sm", particle.color)}
          style={{
            left: `${particle.x}%`,
            top: "-20px",
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `confetti-fall ${particle.duration}s ease-in-out ${particle.delay}s forwards`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export function CompletionScreen({
  documentTitle,
  recipientName,
  recipientEmail,
  signedAt,
  onDownload,
  downloadUrl,
  showConfetti = true,
  className,
  paymentCollected = false,
  paymentAmount,
  paymentCurrency = "USD",
  ethscriptions = [],
}: CompletionScreenProps) {
  const [showConfettiAnimation, setShowConfettiAnimation] = useState(false);

  useEffect(() => {
    if (showConfetti) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShowConfettiAnimation(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const formattedDate = new Date(signedAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center px-4 py-8",
        className
      )}
    >
      {showConfettiAnimation && <Confetti />}

      <div className="w-full max-w-md space-y-8 text-center">
        {/* Success icon */}
        <div className="relative mx-auto">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <PartyPopper className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        {/* Success message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {paymentCollected ? "Document Signed & Payment Complete!" : "Document Signed!"}
          </h1>
          <p className="text-muted-foreground">
            {paymentCollected
              ? "Your signature and payment have been successfully recorded."
              : "Your signature has been successfully recorded."}
          </p>
        </div>

        {/* Document details card */}
        <div className="rounded-lg border bg-card p-6 text-left shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-semibold text-foreground">
                {documentTitle}
              </h2>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                {recipientEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{recipientEmail}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Signed on {formattedDate}</span>
                </div>
                {paymentCollected && paymentAmount && paymentAmount > 0 && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    <span>
                      Payment of{" "}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: paymentCurrency,
                      }).format(paymentAmount)}{" "}
                      collected
                    </span>
                  </div>
                )}
                {ethscriptions.length > 0 && ethscriptions.map((eth, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {eth.status === "pending" ? (
                      <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                    ) : eth.status === "inscribed" ? (
                      <FileCode2 className="h-4 w-4 text-purple-500" />
                    ) : (
                      <FileCode2 className="h-4 w-4 text-destructive" />
                    )}
                    <span className="flex items-center gap-1">
                      {eth.status === "pending" && `Ethscription pending on ${eth.network}...`}
                      {eth.status === "inscribed" && (
                        <>
                          Inscribed on {eth.network}
                          {eth.explorerUrl && (
                            <a
                              href={eth.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:underline inline-flex items-center gap-0.5"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </>
                      )}
                      {eth.status === "failed" && `Ethscription failed on ${eth.network}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Signer info */}
          {recipientName && (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Signed by:</span>
              <span className="font-medium text-foreground">{recipientName}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {(onDownload || downloadUrl) && (
            <Button
              onClick={onDownload}
              asChild={!!downloadUrl && !onDownload}
              className="w-full sm:w-auto"
            >
              {downloadUrl && !onDownload ? (
                <a href={downloadUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </a>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          )}
        </div>

        {/* Confirmation notice */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              A confirmation email with a copy of the signed document has been sent
              to <strong>{recipientEmail}</strong>.
            </p>
          </div>
        </div>

        {/* Close window note */}
        <p className="text-sm text-muted-foreground">
          You can safely close this window now.
        </p>
      </div>
    </div>
  );
}
