import Link from "next/link";
import { FileQuestion, Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <FileQuestion className="w-16 h-16 text-primary" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background px-4 py-1 rounded-full border shadow-sm">
            <span className="text-4xl font-bold text-primary">404</span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/documents">
              <Search className="mr-2 h-4 w-4" />
              View Documents
            </Link>
          </Button>
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link
            href="javascript:history.back()"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Go back to previous page
          </Link>
        </div>

        {/* Fun element */}
        <div className="mt-12 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Looking for something specific? Try our{" "}
            <Link href="/templates" className="text-primary hover:underline">
              templates
            </Link>{" "}
            or{" "}
            <Link href="/documents/new" className="text-primary hover:underline">
              create a new document
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
