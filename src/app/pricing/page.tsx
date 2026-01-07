import type { Metadata } from "next"
import Link from "next/link"
import { Check, ArrowRight, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EarlyBirdBadge } from "@/components/landing/early-bird-badge"

export const metadata: Metadata = {
  title: "Pricing | OpenProposal",
  description:
    "Transparent, flat-rate pricing for proposal software. No per-user fees. Add your whole team. Plans starting at $0 for individuals, $29 for teams, and $99 for businesses.",
  openGraph: {
    title: "Pricing | OpenProposal",
    description:
      "Simple, flat pricing. No per-user fees. No surprises. Add your whole team.",
  },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Send className="h-6 w-6" />
            <Link href="/" className="text-xl font-bold">
              OpenProposal
            </Link>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/#features" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Pricing
            </Link>
            <Link href="/#faq" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              FAQ
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Start Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <EarlyBirdBadge />
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Simple, flat pricing
            </h1>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              No per-user fees. No surprises. Add your whole team.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Starter Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>For individuals getting started</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-zinc-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    { text: "3 documents/month", coming: false },
                    { text: "E-signatures", coming: false },
                    { text: "Drag & drop editor", coming: false },
                    { text: "Basic templates", coming: false },
                    { text: "Email notifications", coming: false },
                    { text: "Community support", coming: false },
                  ].map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      {feature.text}
                      {feature.coming && <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">Soon</Badge>}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">
                    Get Started
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Team Plan */}
            <Card className="relative border-green-600 shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-green-600">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <CardDescription>For small teams, hosted for you</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-zinc-500">/month</span>
                  <div className="mt-1 text-sm text-green-600">
                    <span className="line-through text-zinc-400">$29</span> $15/mo for early birds
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    { text: "Up to 10 team members", coming: false },
                    { text: "5GB cloud storage", coming: false },
                    { text: "Payment collection (Stripe)", coming: false },
                    { text: "Document reminders", coming: false },
                    { text: "Priority support", coming: false },
                    { text: "Blockchain add-on ($19/mo)", coming: false },
                  ].map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      {feature.text}
                      {feature.coming && <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">Soon</Badge>}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/login?plan=pro">
                    Get Started
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Business Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Business</CardTitle>
                <CardDescription>For agencies and teams</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-zinc-500">/month</span>
                  <div className="mt-1 text-sm text-green-600">
                    <span className="line-through text-zinc-400">$99</span> $50/mo for early birds
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    { text: "Everything in Team", coming: false },
                    { text: "Unlimited team members", coming: false },
                    { text: "25GB cloud storage", coming: false },
                    { text: "Remove OpenProposal branding", coming: true },
                    { text: "Analytics dashboard", coming: true },
                    { text: "CRM integrations", coming: true },
                    { text: "API access", coming: false },
                  ].map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      {feature.text}
                      {feature.coming && <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">Soon</Badge>}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login?plan=business">
                    Get Started
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t bg-zinc-50 px-4 py-24 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Frequently asked questions
          </h2>
          <div className="space-y-8">
            {[
              {
                q: "How quickly can I send my first proposal?",
                a: "Most users send their first proposal within 5 minutes of signing up. Our intuitive editor and ready-to-use templates make it easy to get started right away.",
              },
              {
                q: "Is there a limit on documents or signatures?",
                a: "On our paid plans, there are no limits. Send as many proposals as you need and collect unlimited signatures. The Starter plan includes 5 documents per month.",
              },
              {
                q: "Can I collect payments through OpenProposal?",
                a: "Yes! OpenProposal integrates with Stripe so you can collect deposits or full payment when your client signs. Get paid faster without chasing invoices.",
              },
              {
                q: "Can I migrate from PandaDoc or other tools?",
                a: "Yes. We support importing your existing templates. Your data belongs to you, and we make switching simple.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We use Stripe for billing. You can pay with any major credit card. For annual billing, we offer 2 months free.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. No contracts, no annual lock-in. Cancel from your dashboard and you won't be charged again.",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes. If you're not satisfied within 30 days, we'll refund your payment. No questions asked.",
              },
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">
            Ready to send your first proposal?
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Join thousands of businesses who close deals faster with OpenProposal.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/login">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              <span className="font-semibold">OpenProposal</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                Terms
              </Link>
              <Link href="mailto:hello@sendprop.com" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                Contact
              </Link>
            </div>
            <div className="text-sm text-zinc-500">
              sendprop.com
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
