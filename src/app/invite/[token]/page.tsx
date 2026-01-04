"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Loader2, CheckCircle, XCircle, AlertCircle, LogOut } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface InviteData {
  email: string;
  role: string;
  expiresAt: string;
  organization: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
}

export default function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invites/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Invalid invitation");
          return;
        }

        setInvite(data.invite);
      } catch (err) {
        setError("Failed to load invitation");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!session) {
      // Redirect to sign in with return URL
      router.push(`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`)
      return;
    }

    try {
      setIsAccepting(true);
      const res = await fetch(`/api/invites/${token}`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to accept invitation");
      }

      setAccepted(true);
      toast.success("You've joined the team!");

      // Redirect to team settings after a short delay
      setTimeout(() => {
        router.push("/settings/team");
      }, 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to accept invitation");
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Welcome to the team!</CardTitle>
            <CardDescription>
              You've successfully joined {invite?.organization.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Redirecting you to the team...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {invite?.organization.logoUrl ? (
            <Avatar className="mx-auto mb-4 h-16 w-16">
              <AvatarImage src={invite.organization.logoUrl} />
              <AvatarFallback className="text-xl">
                {invite.organization.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          )}
          <CardTitle className="text-2xl">
            Join {invite?.organization.name}
          </CardTitle>
          <CardDescription>
            You've been invited to join as a{" "}
            <span className="font-medium">{invite?.role}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "unauthenticated" && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Sign in required</p>
                  <p className="mt-1 text-yellow-700 dark:text-yellow-300">
                    You'll need to sign in or create an account to accept this
                    invitation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === "authenticated" && session?.user?.email?.toLowerCase() !== invite?.email?.toLowerCase() && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium">Wrong account</p>
                  <p className="mt-1 text-red-700 dark:text-red-300">
                    You're signed in as <strong>{session?.user?.email}</strong>, but this invite was sent to <strong>{invite?.email}</strong>.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => signOut({ callbackUrl: `/invite/${token}` })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out and switch accounts
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleAccept}
            className="w-full"
            disabled={isAccepting || (status === "authenticated" && session?.user?.email?.toLowerCase() !== invite?.email?.toLowerCase())}
          >
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : status === "unauthenticated" ? (
              "Sign in to Accept"
            ) : (
              "Accept Invitation"
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/dashboard")}
            disabled={isAccepting}
          >
            Decline
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            This invitation was sent to {invite?.email}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
