"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, ChevronDown, Plus, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  role: string;
}

interface TeamSwitcherProps {
  className?: string;
}

export function TeamSwitcher({ className }: TeamSwitcherProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isPersonal, setIsPersonal] = useState(true);

  // Fetch organizations and current context
  useEffect(() => {
    async function fetchContext() {
      try {
        const res = await fetch("/api/context");
        if (!res.ok) return;
        const data = await res.json();

        setOrganizations(data.organizations || []);
        setCurrentOrg(data.currentOrganization || null);
        setIsPersonal(!data.currentOrganization);
      } catch (error) {
        console.error("Failed to fetch context:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchContext();
  }, []);

  const handleSwitch = async (orgId: string | null) => {
    try {
      const res = await fetch("/api/context", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentOrg(data.currentOrganization || null);
        setIsPersonal(!data.currentOrganization);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to switch context:", error);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("h-10 w-full animate-pulse rounded-md bg-muted", className)} />
    );
  }

  // If no organizations, show simple personal indicator
  if (organizations.length === 0) {
    return (
      <Button
        variant="outline"
        className={cn("w-full justify-start gap-2", className)}
        onClick={() => router.push("/create-team")}
      >
        <User className="h-4 w-4" />
        <span className="truncate">Personal Account</span>
        <Plus className="ml-auto h-4 w-4 opacity-50" />
      </Button>
    );
  }

  const currentDisplay = isPersonal
    ? { name: "Personal Account", icon: User }
    : { name: currentOrg?.name || "Unknown", icon: Building2 };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {isPersonal ? (
              <User className="h-4 w-4 shrink-0" />
            ) : currentOrg?.logoUrl ? (
              <Avatar className="h-5 w-5">
                <AvatarImage src={currentOrg.logoUrl} />
                <AvatarFallback className="text-xs">
                  {currentOrg.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Building2 className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">{currentDisplay.name}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel>Switch Context</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Personal Account */}
        <DropdownMenuItem
          onClick={() => handleSwitch(null)}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Personal Account</span>
          {isPersonal && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>

        {/* Organizations */}
        {organizations.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSwitch(org.id)}
                className="cursor-pointer"
              >
                {org.logoUrl ? (
                  <Avatar className="mr-2 h-4 w-4">
                    <AvatarImage src={org.logoUrl} />
                    <AvatarFallback className="text-[10px]">
                      {org.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Building2 className="mr-2 h-4 w-4" />
                )}
                <span className="truncate">{org.name}</span>
                {currentOrg?.id === org.id && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/create-team")}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Create Team</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
