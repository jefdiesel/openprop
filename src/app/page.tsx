import Link from "next/link"
import {
  FileText,
  PenTool,
  CreditCard,
  BarChart3,
  Shield,
  Users,
  Check,
  X,
  ArrowRight,
  Zap,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EarlyBirdBadge } from "@/components/landing/early-bird-badge"

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Send className="h-6 w-6" />
            <span className="text-xl font-bold">OpenProposal</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
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
      <section className="relative overflow-hidden px-4 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <Badge variant="secondary" className="mb-4">
              Simple Proposal Software
            </Badge>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
              Stop paying $49/user/month
              <br />
              <span className="text-zinc-500">to send proposals</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              OpenProposal makes it easy to create, send, and sign proposals with integrated payments. Get signatures and collect payments in minutes, not days. Try it free at sendprop.com.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/login">
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">
                  <Zap className="mr-2 h-4 w-4" /> See How It Works
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              No credit card required. Send your first proposal in 5 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="border-y bg-zinc-50 px-4 py-16 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold">
            The real cost of PandaDoc
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-4 text-left font-medium">Team Size</th>
                  <th className="py-4 text-center font-medium">PandaDoc</th>
                  <th className="py-4 text-center font-medium text-green-600">OpenProposal</th>
                  <th className="py-4 text-right font-medium">You Save</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: "1-10 users", pandadoc: 490, op: 29, savings: 461, plan: "Team" },
                  { size: "11-20 users", pandadoc: 980, op: 99, savings: 881, plan: "Business" },
                  { size: "50 users", pandadoc: 2450, op: 99, savings: 2351, plan: "Business" },
                  { size: "100 users", pandadoc: 4900, op: 99, savings: 4801, plan: "Business" },
                ].map((row) => (
                  <tr key={row.size} className="border-b last:border-0">
                    <td className="py-4 font-medium">{row.size}</td>
                    <td className="py-4 text-center text-zinc-600">${row.pandadoc}/mo</td>
                    <td className="py-4 text-center font-semibold text-green-600">${row.op}/mo <span className="text-xs text-zinc-400">({row.plan})</span></td>
                    <td className="py-4 text-right font-semibold text-green-600">${row.savings}/mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-sm text-zinc-500">
            All plans include unlimited users and documents. No per-seat pricing. Ever.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Send proposals, get signatures, collect payments</h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Everything you need to close deals faster
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "Drag & Drop Builder",
                description: "Build beautiful proposals with our intuitive editor. Add text, images, pricing tables, and more.",
              },
              {
                icon: PenTool,
                title: "E-Signatures",
                description: "Legally binding signatures. Draw, type, or upload. No limits, no extra fees.",
              },
              {
                icon: CreditCard,
                title: "Payment Collection",
                description: "Get paid faster with integrated Stripe payments. Collect deposits or full payment on signature.",
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description: "Know when proposals are opened, how long they're viewed, and when they're signed.",
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description: "Add your whole team. Shared templates, workspaces, and document history.",
              },
              {
                icon: Shield,
                title: "Secure & Compliant",
                description: "Bank-level encryption and secure document storage. Your data stays protected.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-0 shadow-none">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="border-y bg-zinc-50 px-4 py-16 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Feature comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-4 text-left font-medium">Feature</th>
                  <th className="py-4 text-center font-medium">PandaDoc</th>
                  <th className="py-4 text-center font-medium text-green-600">OpenProposal</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Unlimited users", pandadoc: false, op: true },
                  { feature: "Unlimited documents", pandadoc: false, op: true },
                  { feature: "Unlimited signatures", pandadoc: false, op: true },
                  { feature: "Custom branding", pandadoc: "Enterprise", op: "Business" },
                  { feature: "API access", pandadoc: "Enterprise", op: "All plans" },
                  { feature: "Export templates", pandadoc: false, op: true },
                  { feature: "Payment collection", pandadoc: true, op: true },
                  { feature: "Analytics", pandadoc: true, op: true },
                ].map((row) => (
                  <tr key={row.feature} className="border-b last:border-0">
                    <td className="py-4">{row.feature}</td>
                    <td className="py-4 text-center">
                      {row.pandadoc === true ? (
                        <Check className="mx-auto h-5 w-5 text-green-600" />
                      ) : row.pandadoc === false ? (
                        <X className="mx-auto h-5 w-5 text-zinc-300" />
                      ) : (
                        <span className="text-sm text-zinc-500">{row.pandadoc}</span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {row.op === true ? (
                        <Check className="mx-auto h-5 w-5 text-green-600" />
                      ) : row.op === false ? (
                        <X className="mx-auto h-5 w-5 text-zinc-300" />
                      ) : (
                        <span className="text-sm font-medium text-green-600">{row.op}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <EarlyBirdBadge />
            <h2 className="text-3xl font-bold">Simple, flat pricing</h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              No per-user fees. No surprises. Add your whole team.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
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
                    "Up to 5 documents/month",
                    "Unlimited signatures",
                    "Basic templates",
                    "Email support",
                    "Secure document storage",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      {feature}
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

            {/* Pro Plan */}
            <Card className="relative border-green-600 shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-green-600">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For growing businesses</CardDescription>
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
                    "Unlimited documents",
                    "Unlimited users",
                    "Custom branding",
                    "Payment collection",
                    "Priority support",
                    "API access",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      {feature}
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
                    "Everything in Pro",
                    "Remove OpenProposal branding",
                    "Multiple workspaces",
                    "Advanced analytics",
                    "Zapier integrations",
                    "Dedicated support",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      {feature}
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
      <section id="faq" className="border-t bg-zinc-50 px-4 py-24 dark:bg-zinc-900">
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
