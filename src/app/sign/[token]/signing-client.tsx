"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DocumentViewer } from "@/components/signing/document-viewer";
import { SigningProgress, type SigningStep } from "@/components/signing/signing-progress";
import { SignActionBar } from "@/components/signing/sign-action-bar";
import { CompletionScreen } from "@/components/signing/completion-screen";
import { PaymentStep } from "@/components/payments/payment-step";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FileText, X, Menu, Download } from "lucide-react";
import type { SigningDocument } from "@/lib/actions/signing";
import type { Block } from "@/types/blocks";
import type { Block as DbBlock, SignatureData, PaymentStatus } from "@/types/database";

interface SigningClientProps {
  token: string;
  initialDocument: SigningDocument;
}

export function SigningClient({ token, initialDocument }: SigningClientProps) {
  const searchParams = useSearchParams();
  const [document, setDocument] = useState(initialDocument);
  const [content, setContent] = useState<DbBlock[]>(initialDocument.content);
  const [currentStep, setCurrentStep] = useState<SigningStep>("review");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Check for payment completion from URL (redirect after Stripe payment)
  useEffect(() => {
    if (searchParams.get("payment") === "complete") {
      setPaymentStatus("succeeded");
      setPaymentCompleted(true);
    }
  }, [searchParams]);

  // Calculate signature requirements
  const signatureStats = useMemo(() => {
    const signatureBlocks = content.filter((block) => block.type === "signature");
    const requiredSignatures = signatureBlocks.filter(
      (block) => (block as any).required
    ).length;
    const completedSignatures = signatureBlocks.filter(
      (block) => (block as any).signedData || (block as any).signatureValue
    ).length;

    return {
      total: signatureBlocks.length,
      required: requiredSignatures,
      completed: completedSignatures,
      allRequiredComplete: completedSignatures >= requiredSignatures,
    };
  }, [content]);

  // Determine current step based on state and payment timing
  useEffect(() => {
    const paymentBefore = document.paymentTiming === "before_signature";
    const paymentAfter = document.paymentTiming === "after_signature" || !document.paymentTiming;

    if (signedAt) {
      // Already signed
      if (document.requiresPayment && paymentAfter && !paymentCompleted) {
        // Payment required after signing and not yet completed
        setCurrentStep("pay");
      } else {
        setCurrentStep("complete");
      }
    } else if (document.requiresPayment && paymentBefore && !paymentCompleted) {
      // Payment required before signing - show payment step first
      setCurrentStep("pay");
    } else if (signatureStats.allRequiredComplete && signatureStats.required > 0) {
      setCurrentStep("sign");
    } else {
      setCurrentStep("review");
    }
  }, [signatureStats, signedAt, document.requiresPayment, document.paymentTiming, paymentCompleted]);

  // Handle payment completion
  const handlePaymentComplete = useCallback(() => {
    setPaymentStatus("succeeded");
    setPaymentCompleted(true);
    // If already signed, move to complete
    if (signedAt) {
      setCurrentStep("complete");
    }
    toast.success("Payment completed successfully!");
  }, [signedAt]);

  // Handle payment error
  const handlePaymentError = useCallback((error: string) => {
    toast.error(error || "Payment failed. Please try again.");
  }, []);

  // Handle block changes (for signatures and pricing)
  const handleBlockChange = useCallback((blockId: string, updatedBlock: Block) => {
    setContent((prevContent) =>
      prevContent.map((block) => {
        if (block.id === blockId) {
          // Merge the update with the existing block
          if (block.type === "signature" && updatedBlock.type === "signature") {
            return {
              ...block,
              signedData: updatedBlock.signatureValue,
              signedAt: updatedBlock.signedAt,
            } as DbBlock;
          }
          // For other block types, just return the updated block
          return { ...block, ...updatedBlock } as DbBlock;
        }
        return block;
      })
    );
  }, []);

  // Submit signature
  const handleSubmit = useCallback(async () => {
    if (!signatureStats.allRequiredComplete) {
      toast.error("Please complete all required signatures before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the signature data from content
      const signatureBlock = content.find(
        (block) => block.type === "signature" && ((block as any).signedData || (block as any).signatureValue)
      );

      const signatureData: SignatureData = {
        type: "drawn",
        data: (signatureBlock as any)?.signedData || (signatureBlock as any)?.signatureValue || "",
        signedAt: new Date().toISOString(),
      };

      const response = await fetch(`/api/sign/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signatureData,
          updatedContent: content,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit signature");
      }

      setSignedAt(result.signedAt);
      setCurrentStep("complete");
      toast.success("Document signed successfully!");
    } catch (error) {
      console.error("Error submitting signature:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit signature"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [token, content, signatureStats.allRequiredComplete]);

  // Handle decline
  const handleDecline = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/sign/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "decline",
          reason: declineReason,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to decline document");
      }

      toast.success("Document declined");
      setShowDeclineDialog(false);
      // Redirect or show declined state
      window.location.href = "/";
    } catch (error) {
      console.error("Error declining document:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to decline document"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [token, declineReason]);

  // Show completion screen if signed
  if (currentStep === "complete" && signedAt) {
    return (
      <CompletionScreen
        documentTitle={document.title}
        recipientName={document.recipient.name || undefined}
        recipientEmail={document.recipient.email}
        signedAt={signedAt}
        showConfetti={true}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:h-16">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9"
              style={{
                backgroundColor: document.settings?.brandColor || "hsl(var(--primary))",
              }}
            >
              <FileText className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">
                {document.title}
              </h1>
              <p className="text-xs text-muted-foreground">
                Signing as {document.recipient.name || document.recipient.email}
              </p>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 sm:flex">
            {document.settings?.allowDownload && (
              <Button variant="ghost" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-background px-4 py-3 sm:hidden">
            <div className="space-y-1">
              <p className="font-medium text-foreground">{document.title}</p>
              <p className="text-sm text-muted-foreground">
                Signing as {document.recipient.name || document.recipient.email}
              </p>
            </div>
            {document.settings?.allowDownload && (
              <Button variant="ghost" size="sm" className="mt-3 w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Progress indicator */}
      <div className="border-b bg-muted/30 py-3 sm:py-4">
        <SigningProgress
          currentStep={currentStep}
          showPaymentStep={document.requiresPayment}
        />
      </div>

      {/* Document viewer - show only when not on payment step */}
      {currentStep !== "pay" && (
        <main className="flex-1 pb-32">
          <DocumentViewer
            content={content}
            title={document.title}
            onBlockChange={handleBlockChange}
            className="min-h-full"
          />
        </main>
      )}

      {/* Payment step - shown when payment is required (before or after signing) */}
      {currentStep === "pay" && document.requiresPayment && (
        <main className="flex-1 pb-32 px-4 py-8">
          <div className="mx-auto max-w-xl">
            <PaymentStep
              amount={document.paymentAmount || 0}
              currency={document.paymentCurrency || "USD"}
              documentId={document.id}
              recipientId={document.recipient.id}
              documentTitle={document.title}
              onPaymentComplete={handlePaymentComplete}
              onPaymentError={handlePaymentError}
              paymentTiming={document.paymentTiming || "before_signature"}
              isCompleted={paymentCompleted}
            />
          </div>
        </main>
      )}

      {/* Action bar - hide when on payment step */}
      {currentStep !== "pay" && (
        <SignActionBar
          requiredSignatures={signatureStats.required}
          completedSignatures={signatureStats.completed}
          onSign={handleSubmit}
          onDecline={() => setShowDeclineDialog(true)}
          isSubmitting={isSubmitting}
          disabled={document.recipient.status === "signed"}
        />
      )}

      {/* Decline dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Decline to Sign</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this document? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for declining (optional)"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowDeclineDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDecline}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Declining..." : "Decline Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
