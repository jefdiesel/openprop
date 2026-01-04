"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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

// Activity tracking hook
function useActivityTracking(token: string, isActive: boolean) {
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollDepthRef = useRef<number>(0);
  const lastReportedDepthRef = useRef<number>(0);
  const isFocusedRef = useRef<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Block visibility tracking
  const blockViewTimesRef = useRef<Map<string, { startTime: number; totalTime: number; viewed: boolean }>>(new Map());
  const lastBlockReportRef = useRef<number>(0);

  // Track event to API
  const trackEvent = useCallback(async (eventType: string, eventData?: Record<string, unknown>) => {
    try {
      await fetch(`/api/sign/${token}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, eventData }),
      });
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  }, [token]);

  // Track block visibility
  const trackBlockView = useCallback((blockId: string, blockType: string, isVisible: boolean) => {
    const now = Date.now();
    const blockData = blockViewTimesRef.current.get(blockId);

    if (isVisible) {
      if (!blockData) {
        // First time seeing this block
        blockViewTimesRef.current.set(blockId, { startTime: now, totalTime: 0, viewed: true });
        trackEvent("block_viewed", { blockId, blockType });
      } else if (!blockData.viewed) {
        // Re-entering view
        blockData.startTime = now;
        blockData.viewed = true;
      }
    } else if (blockData?.viewed) {
      // Leaving view - accumulate time
      blockData.totalTime += now - blockData.startTime;
      blockData.viewed = false;
    }
  }, [trackEvent]);

  // Track link clicks
  const trackLinkClick = useCallback((url: string, linkText: string) => {
    trackEvent("link_clicked", { url, linkText });
  }, [trackEvent]);

  // Calculate scroll depth percentage
  const calculateScrollDepth = useCallback(() => {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (documentHeight <= 0) return 100;
    return Math.min(100, Math.round((scrollTop / documentHeight) * 100));
  }, []);

  // Handle scroll events
  useEffect(() => {
    if (!isActive) return;

    const handleScroll = () => {
      const depth = calculateScrollDepth();
      if (depth > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = depth;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isActive, calculateScrollDepth]);

  // Handle focus/blur events
  useEffect(() => {
    if (!isActive) return;

    const handleFocus = () => {
      if (!isFocusedRef.current) {
        isFocusedRef.current = true;
        trackEvent("page_focus");
      }
    };

    const handleBlur = () => {
      if (isFocusedRef.current) {
        isFocusedRef.current = false;
        trackEvent("page_blur");
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isActive, trackEvent]);

  // Periodic tracking (every 30 seconds)
  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSpent = Math.round((now - startTimeRef.current) / 1000);
      const currentDepth = maxScrollDepthRef.current;

      // Report time spent
      trackEvent("time_spent", { seconds: timeSpent });

      // Report scroll depth if changed significantly (10% threshold)
      if (currentDepth - lastReportedDepthRef.current >= 10) {
        trackEvent("scroll_depth", { percentage: currentDepth });
        lastReportedDepthRef.current = currentDepth;
      }

      // Report block view times (every 60 seconds)
      if (now - lastBlockReportRef.current >= 60000) {
        const blockTimes: Record<string, number> = {};
        blockViewTimesRef.current.forEach((data, blockId) => {
          let totalMs = data.totalTime;
          if (data.viewed) {
            totalMs += now - data.startTime;
          }
          if (totalMs > 0) {
            blockTimes[blockId] = Math.round(totalMs / 1000);
          }
        });
        if (Object.keys(blockTimes).length > 0) {
          trackEvent("block_times", { blocks: blockTimes });
        }
        lastBlockReportRef.current = now;
      }
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, trackEvent]);

  // Report on page unload
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = () => {
      const now = Date.now();
      const timeSpent = Math.round((now - startTimeRef.current) / 1000);
      const currentDepth = maxScrollDepthRef.current;

      // Calculate final block times
      const blockTimes: Record<string, number> = {};
      blockViewTimesRef.current.forEach((data, blockId) => {
        let totalMs = data.totalTime;
        if (data.viewed) {
          totalMs += now - data.startTime;
        }
        if (totalMs > 0) {
          blockTimes[blockId] = Math.round(totalMs / 1000);
        }
      });

      // Use sendBeacon for reliable unload tracking
      const data = JSON.stringify({
        eventType: "session_end",
        eventData: {
          total_time_seconds: timeSpent,
          max_scroll_depth: currentDepth,
          block_times: blockTimes,
        },
      });

      navigator.sendBeacon(`/api/sign/${token}/track`, data);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isActive, token]);

  return { trackEvent, trackBlockView, trackLinkClick };
}

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

  // Activity tracking - only active when not on completion step
  const { trackEvent, trackBlockView, trackLinkClick } = useActivityTracking(token, currentStep !== "complete");

  // Check for payment completion from URL (redirect after Stripe payment)
  useEffect(() => {
    if (searchParams.get("payment") === "complete") {
      setPaymentStatus("succeeded");
      setPaymentCompleted(true);
    }
  }, [searchParams]);

  // Track page view on initial load
  useEffect(() => {
    trackEvent("page_view", { step: currentStep });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Check if data-uri blocks have valid EVM addresses
  const calldataStats = useMemo(() => {
    const dataUriBlocks = content.filter((block) => block.type === "data-uri");
    const blocksWithPayload = dataUriBlocks.filter((block) => {
      const blockData = (block as any).data || block;
      const payload = blockData.payload;
      return payload && payload.length > 0;
    });
    const blocksWithAddress = blocksWithPayload.filter((block) => {
      const blockData = (block as any).data || block;
      const address = blockData.recipientAddress;
      return address && /^0x[a-fA-F0-9]{40}$/.test(address);
    });

    return {
      total: blocksWithPayload.length,
      completed: blocksWithAddress.length,
      allComplete: blocksWithPayload.length === 0 || blocksWithAddress.length >= blocksWithPayload.length,
    };
  }, [content]);

  // Extract pricing table line items for payment display
  const { pricingLineItems, downPaymentPercent } = useMemo(() => {
    // Find pricing table block
    const pricingBlock = content.find((block) => block.type === "pricing-table");
    // Find payment block for down payment info
    const paymentBlock = content.find((block) => block.type === "payment");

    let items: Array<{ id: string; description: string; quantity: number; unitPrice: number }> = [];
    let downPayment = 0;

    if (pricingBlock) {
      // Handle both flat and nested data structures
      const blockData = (pricingBlock as any).data;
      const flatItems = (pricingBlock as any).items;
      const pricingItems = blockData?.items || flatItems || [];
      items = pricingItems
        // Filter out empty items (no name or zero price)
        .filter((item: any) => item.name && item.unitPrice > 0)
        .map((item: any) => ({
          id: item.id || String(Math.random()),
          description: item.name || "Item",
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
        }));
    }

    if (paymentBlock) {
      // Handle both nested (builder) and flat (database) block structures
      const blockData = (paymentBlock as any).data;
      const rawPercent = blockData?.downPaymentPercent ?? (paymentBlock as any).downPaymentPercent;
      // Robustly convert to number, handling strings, NaN, undefined, null
      if (rawPercent !== undefined && rawPercent !== null) {
        const parsed = typeof rawPercent === 'string' ? parseFloat(rawPercent) : Number(rawPercent);
        downPayment = Number.isFinite(parsed) ? parsed : 0;
      }
    }

    return { pricingLineItems: items, downPaymentPercent: downPayment };
  }, [content]);

  // Calculate actual payment amount (from pricing table or document.paymentAmount)
  const actualPaymentAmount = useMemo(() => {
    // Calculate pricing table total
    const pricingTotal = pricingLineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    // If we have pricing line items, use that total (possibly with down payment)
    if (pricingTotal > 0) {
      if (downPaymentPercent > 0 && downPaymentPercent < 100) {
        return pricingTotal * (downPaymentPercent / 100);
      }
      return pricingTotal;
    }

    // Fall back to document.paymentAmount (also apply down payment if set)
    const baseAmount = document.paymentAmount || 0;
    if (baseAmount > 0 && downPaymentPercent > 0 && downPaymentPercent < 100) {
      return baseAmount * (downPaymentPercent / 100);
    }
    return baseAmount;
  }, [pricingLineItems, downPaymentPercent, document.paymentAmount]);

  // Determine current step based on state and payment timing
  // Flow: Review -> Sign -> Pay (if required) -> Complete
  // Only run on initial load, not when user navigates manually
  const [stepInitialized, setStepInitialized] = useState(false);

  useEffect(() => {
    // Only set initial step once on mount
    if (stepInitialized) return;

    if (signedAt) {
      // Already signed - go to completion
      setCurrentStep("complete");
    } else if (signatureStats.allRequiredComplete && signatureStats.required > 0) {
      // All signatures filled - ready to sign (or pay first if required)
      setCurrentStep("sign");
    } else {
      // Default to review - show full document
      setCurrentStep("review");
    }
    setStepInitialized(true);
  }, [signatureStats, signedAt, stepInitialized]);

  // Handle signedAt changes after initialization (e.g., after successful submission)
  useEffect(() => {
    if (stepInitialized && signedAt) {
      setCurrentStep("complete");
    }
  }, [signedAt, stepInitialized]);

  // Check if payment is required before signing
  const needsPaymentBeforeSign = document.requiresPayment &&
    document.paymentTiming === "due_now" &&
    !paymentCompleted;

  // Flag to trigger auto-submit after payment
  const [pendingAutoSubmit, setPendingAutoSubmit] = useState(false);

  // Handler to go to payment step
  const handleProceedToPayment = useCallback(() => {
    setCurrentStep("pay");
  }, []);

  // Handler to go back to document from payment
  const handleBackToDocument = useCallback(() => {
    setCurrentStep("sign");
  }, []);

  // Handle payment completion - set flag to trigger auto-submit
  const handlePaymentComplete = useCallback(() => {
    setPaymentStatus("succeeded");
    setPaymentCompleted(true);
    toast.success("Payment completed successfully!");

    // If already submitted, just move to complete
    if (signedAt) {
      setCurrentStep("complete");
      return;
    }

    // Set flag to trigger auto-submit via useEffect
    setPendingAutoSubmit(true);
  }, [signedAt]);

  // Auto-submit after payment completes (via useEffect to avoid stale closures)
  useEffect(() => {
    if (!pendingAutoSubmit) return;

    const doAutoSubmit = async () => {
      // Small delay to show payment success message
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if all required signatures are complete
      if (!signatureStats.allRequiredComplete) {
        toast.error("Please complete all required signatures.");
        setCurrentStep("sign");
        setPendingAutoSubmit(false);
        return;
      }

      // Check if all calldata addresses are complete
      if (!calldataStats.allComplete) {
        toast.error("Please enter your wallet address for all calldata fields.");
        setCurrentStep("sign");
        setPendingAutoSubmit(false);
        return;
      }

      setIsSubmitting(true);

      try {
        // Find all signature blocks and look for signed data
        const signatureBlocks = content.filter((block) => block.type === "signature");
        const signedBlock = signatureBlocks.find(
          (block) => (block as any).signedData || (block as any).signatureValue
        );
        const signatureValue = (signedBlock as any)?.signedData || (signedBlock as any)?.signatureValue;

        // If there are required signatures but none are signed, error
        if (signatureStats.required > 0 && !signatureValue) {
          toast.error("Please sign the document before submitting.");
          setIsSubmitting(false);
          setCurrentStep("sign");
          setPendingAutoSubmit(false);
          return;
        }

        // Build signature data only if we have a signature
        const signatureData: SignatureData | null = signatureValue ? {
          type: "drawn",
          data: signatureValue,
          signedAt: new Date().toISOString(),
        } : null;

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
        setCurrentStep("sign");
      } finally {
        setIsSubmitting(false);
        setPendingAutoSubmit(false);
      }
    };

    doAutoSubmit();
  }, [pendingAutoSubmit, signatureStats.allRequiredComplete, signatureStats.required, calldataStats.allComplete, content, token]);

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
              signatureType: updatedBlock.signatureType,
              signatureValue: updatedBlock.signatureValue,
              signedAt: updatedBlock.signedAt,
            } as DbBlock;
          }
          // Handle data-uri blocks - update nested data property if it exists
          if (block.type === "data-uri" && updatedBlock.type === "data-uri") {
            const hasDataProp = (block as any).data !== undefined;
            if (hasDataProp) {
              return {
                ...block,
                data: {
                  ...(block as any).data,
                  recipientAddress: (updatedBlock as any).recipientAddress,
                },
              } as DbBlock;
            }
            // Flat structure - just merge
            return { ...block, ...updatedBlock } as DbBlock;
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

    if (!calldataStats.allComplete) {
      toast.error("Please enter your wallet address for all calldata fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Find all signature blocks and look for signed data
      const signatureBlocks = content.filter((block) => block.type === "signature");
      const signedBlock = signatureBlocks.find(
        (block) => (block as any).signedData || (block as any).signatureValue
      );
      const signatureValue = (signedBlock as any)?.signedData || (signedBlock as any)?.signatureValue;

      // If there are required signatures but none are signed, error
      if (signatureStats.required > 0 && !signatureValue) {
        toast.error("Please sign the document before submitting.");
        setIsSubmitting(false);
        return;
      }

      // Build signature data only if we have a signature
      const signatureData: SignatureData | null = signatureValue ? {
        type: "drawn",
        data: signatureValue,
        signedAt: new Date().toISOString(),
      } : null;

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
  }, [token, content, signatureStats.allRequiredComplete, signatureStats.required, calldataStats.allComplete]);

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

  // Handle PDF download
  const handleDownload = useCallback(async () => {
    try {
      // Track the download event
      trackEvent("pdf_downloaded");

      // Fetch the PDF
      const response = await fetch(`/api/documents/${document.id}/pdf`);
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${document.title}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    }
  }, [document.id, document.title, trackEvent]);

  // Show completion screen if signed
  if (currentStep === "complete" && signedAt) {
    return (
      <CompletionScreen
        documentTitle={document.title}
        recipientName={document.recipient.name || undefined}
        recipientEmail={document.recipient.email}
        signedAt={signedAt}
        showConfetti={true}
        paymentCollected={paymentCompleted && document.requiresPayment}
        paymentAmount={actualPaymentAmount > 0 ? actualPaymentAmount : undefined}
        paymentCurrency={document.paymentCurrency || "USD"}
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
              <Button variant="ghost" size="sm" onClick={handleDownload}>
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
              <Button variant="ghost" size="sm" className="mt-3 w-full justify-start" onClick={handleDownload}>
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
            onBlockView={trackBlockView}
            onLinkClick={trackLinkClick}
            className="min-h-full"
            downPaymentPercent={downPaymentPercent}
          />
        </main>
      )}

      {/* Payment step - shown when payment is required and amount is valid */}
      {currentStep === "pay" && document.requiresPayment && actualPaymentAmount > 0 && (
        <main className="flex-1 pb-32 px-4 py-8">
          <div className="mx-auto max-w-xl">
            <PaymentStep
              amount={actualPaymentAmount}
              currency={document.paymentCurrency || "USD"}
              documentId={document.id}
              recipientId={document.recipient.id}
              documentTitle={document.title}
              lineItems={pricingLineItems}
              downPaymentPercent={downPaymentPercent}
              onPaymentComplete={handlePaymentComplete}
              onPaymentError={handlePaymentError}
              onBack={handleBackToDocument}
              paymentTiming={document.paymentTiming || "due_now"}
              isCompleted={paymentCompleted}
            />
          </div>
        </main>
      )}

      {/* Error state - payment required but no valid amount */}
      {currentStep === "pay" && document.requiresPayment && actualPaymentAmount <= 0 && (
        <main className="flex-1 pb-32 px-4 py-8">
          <div className="mx-auto max-w-xl">
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
              <p className="font-medium text-destructive">Payment Configuration Error</p>
              <p className="mt-2 text-sm text-muted-foreground">
                This document requires payment but no valid amount is configured.
                Please contact the document owner.
              </p>
              <Button variant="outline" className="mt-4" onClick={handleBackToDocument}>
                Back to Document
              </Button>
            </div>
          </div>
        </main>
      )}

      {/* Action bar - hide when on payment step or complete */}
      {currentStep !== "pay" && currentStep !== "complete" && (
        <SignActionBar
          requiredSignatures={signatureStats.required}
          completedSignatures={signatureStats.completed}
          onSign={handleSubmit}
          onDecline={() => setShowDeclineDialog(true)}
          onPay={handleProceedToPayment}
          needsPayment={needsPaymentBeforeSign && actualPaymentAmount > 0}
          paymentAmount={actualPaymentAmount}
          paymentCurrency={document.paymentCurrency}
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
