import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getDocumentByToken, recordDocumentView } from "@/lib/actions/signing";
import { SigningClient } from "./signing-client";

interface SigningPageProps {
  params: Promise<{ token: string }>;
}

// Loading skeleton component
function SigningPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header skeleton */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ))}
          </div>
        </div>
      </header>

      {/* Progress skeleton */}
      <div className="border-b py-4">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                <div className="hidden h-4 w-16 animate-pulse rounded bg-muted sm:block" />
                {i < 4 && <div className="h-0.5 w-12 bg-muted" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </main>

      {/* Action bar skeleton */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            <div className="space-y-1">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="h-10 w-36 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

// Error display component
function SigningError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <svg
            className="h-8 w-8 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Unable to Load Document
        </h1>
        <p className="mb-6 text-muted-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">
          If you believe this is an error, please contact the sender.
        </p>
      </div>
    </div>
  );
}

async function SigningPageContent({ token }: { token: string }) {
  // Fetch document data
  const result = await getDocumentByToken(token);

  if (!result.success || !result.document) {
    return <SigningError message={result.error || "Document not found"} />;
  }

  // Record the view event (server-side)
  await recordDocumentView(token);

  const { document } = result;

  return (
    <SigningClient
      token={token}
      initialDocument={document}
    />
  );
}

export default async function SigningPage({ params }: SigningPageProps) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

  return (
    <Suspense fallback={<SigningPageSkeleton />}>
      <SigningPageContent token={token} />
    </Suspense>
  );
}

// Metadata generation
export async function generateMetadata({ params }: SigningPageProps) {
  const { token } = await params;
  const result = await getDocumentByToken(token);

  if (!result.success || !result.document) {
    return {
      title: "Document Not Found | OpenProposal",
    };
  }

  return {
    title: `Sign: ${result.document.title} | OpenProposal`,
    description: "Review and sign this document securely.",
    robots: {
      index: false,
      follow: false,
    },
  };
}
