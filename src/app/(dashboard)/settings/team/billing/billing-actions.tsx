"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface TeamBillingActionsProps {
  organizationId: string;
  hasSubscription: boolean;
  currentPlanId: string;
}

export function TeamBillingActions({
  organizationId,
  hasSubscription,
  currentPlanId,
}: TeamBillingActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: "pro_team" | "business_team") => {
    try {
      setIsLoading(planId);
      const res = await fetch(`/api/organizations/${organizationId}/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billingInterval: "monthly" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const data = await res.json();
      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to subscribe");
    } finally {
      setIsLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      setIsLoading("portal");
      const res = await fetch(`/api/organizations/${organizationId}/billing`, {
        method: "PUT",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to access billing portal");
      }

      const data = await res.json();
      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to access billing portal");
    } finally {
      setIsLoading(null);
    }
  };

  if (hasSubscription) {
    return (
      <Button onClick={handleManageBilling} disabled={isLoading !== null}>
        {isLoading === "portal" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ExternalLink className="mr-2 h-4 w-4" />
        )}
        Manage Billing
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={currentPlanId === "pro_team" ? "outline" : "default"}
        onClick={() => handleSubscribe("pro_team")}
        disabled={isLoading !== null || currentPlanId === "pro_team"}
      >
        {isLoading === "pro_team" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {currentPlanId === "pro_team" ? "Current Plan" : "Upgrade to Pro"}
      </Button>
      <Button
        variant={currentPlanId === "business_team" ? "outline" : "default"}
        onClick={() => handleSubscribe("business_team")}
        disabled={isLoading !== null || currentPlanId === "business_team"}
      >
        {isLoading === "business_team" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {currentPlanId === "business_team" ? "Current Plan" : "Upgrade to Business"}
      </Button>
    </div>
  );
}
