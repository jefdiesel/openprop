"use client";

import { cn } from "@/lib/utils";
import { Check, Eye, PenLine, CreditCard, PartyPopper } from "lucide-react";

export type SigningStep = "review" | "sign" | "pay" | "complete";

interface SigningProgressProps {
  currentStep: SigningStep;
  showPaymentStep: boolean;
  className?: string;
}

interface StepConfig {
  id: SigningStep;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function SigningProgress({
  currentStep,
  showPaymentStep,
  className,
}: SigningProgressProps) {
  const allSteps: StepConfig[] = [
    { id: "review", label: "Review", icon: Eye },
    { id: "sign", label: "Sign", icon: PenLine },
    { id: "pay", label: "Pay", icon: CreditCard },
    { id: "complete", label: "Complete", icon: PartyPopper },
  ];

  // Filter out payment step if not needed
  const steps = showPaymentStep
    ? allSteps
    : allSteps.filter((step) => step.id !== "pay");

  const getStepIndex = (step: SigningStep) => {
    return steps.findIndex((s) => s.id === step);
  };

  const currentIndex = getStepIndex(currentStep);

  const getStepStatus = (step: StepConfig, index: number) => {
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <nav aria-label="Signing progress" className={cn("w-full", className)}>
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const Icon = step.icon;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-10 sm:w-10",
                    status === "completed" &&
                      "border-green-500 bg-green-500 text-white",
                    status === "current" &&
                      "border-primary bg-primary text-primary-foreground",
                    status === "upcoming" &&
                      "border-muted-foreground/30 bg-muted text-muted-foreground"
                  )}
                >
                  {status === "completed" ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "hidden text-sm font-medium sm:block",
                    status === "completed" && "text-green-600",
                    status === "current" && "text-foreground",
                    status === "upcoming" && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "mx-2 h-0.5 w-6 transition-colors duration-300 sm:mx-4 sm:w-12",
                    index < currentIndex ? "bg-green-500" : "bg-muted-foreground/30"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile step label */}
      <p className="mt-2 text-center text-sm font-medium text-muted-foreground sm:hidden">
        Step {currentIndex + 1} of {steps.length}: {steps[currentIndex]?.label}
      </p>
    </nav>
  );
}
