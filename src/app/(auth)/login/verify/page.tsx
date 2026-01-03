import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function VerifyPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription className="text-base">
          We sent you a magic link to sign in. Click the link in your email to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            The link will expire in 24 hours. If you don&apos;t see the email, check your spam folder.
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
