import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "SendProp vs Better Proposals - More Features, Better Value",
  description:
    "Compare SendProp to Better Proposals. Get more generous free tier, better support hours, modern API, and all the features you need at a better price.",
  openGraph: {
    title: "SendProp vs Better Proposals - More Features, Better Value",
    description:
      "Compare SendProp to Better Proposals. More generous free tier, US-based support, modern tech stack.",
  },
};

const comparisonData = [
  {
    category: "Pricing",
    items: [
      { feature: "Free plan available", sendprop: true, betterproposals: "Very limited" },
      { feature: "Starter plan price", sendprop: "$0/mo (3 docs)", betterproposals: "~$19/mo" },
      { feature: "Team plan price", sendprop: "$29/mo flat", betterproposals: "~$29/mo" },
      { feature: "Business plan price", sendprop: "$99/mo flat", betterproposals: "Custom" },
      { feature: "Free tier documents", sendprop: "3 per month", betterproposals: "Limited trial" },
      { feature: "Early bird discount", sendprop: "Up to 50% off", betterproposals: false },
    ],
  },
  {
    category: "Document Creation",
    items: [
      { feature: "Beautiful templates", sendprop: true, betterproposals: true },
      { feature: "Drag-and-drop builder", sendprop: true, betterproposals: true },
      { feature: "Custom branding", sendprop: true, betterproposals: true },
      { feature: "Content blocks", sendprop: true, betterproposals: true },
      { feature: "Variables/merge fields", sendprop: true, betterproposals: true },
    ],
  },
  {
    category: "Signatures & Payments",
    items: [
      { feature: "E-signatures", sendprop: true, betterproposals: true },
      { feature: "Payment integration", sendprop: true, betterproposals: true },
      { feature: "Stripe integration", sendprop: true, betterproposals: true },
      { feature: "Partial payments", sendprop: true, betterproposals: "Limited" },
      { feature: "Blockchain verification", sendprop: true, betterproposals: false },
    ],
  },
  {
    category: "Workflow & Integrations",
    items: [
      { feature: "Document tracking", sendprop: true, betterproposals: true },
      { feature: "Automatic reminders", sendprop: true, betterproposals: true },
      { feature: "Team collaboration", sendprop: true, betterproposals: true },
      { feature: "CRM integrations", sendprop: "HubSpot, Salesforce", betterproposals: "Limited" },
      { feature: "Developer API", sendprop: "Modern REST API", betterproposals: "Basic" },
      { feature: "Support hours", sendprop: "US-based (9-5 EST)", betterproposals: "UK-based" },
    ],
  },
];

const switchReasons = [
  {
    title: "More generous free tier",
    description:
      "Better Proposals has a very limited free tier. SendProp gives you 3 full-featured documents per month, perfect for freelancers and small businesses just getting started.",
  },
  {
    title: "US-based support with better hours",
    description:
      "Better Proposals is UK-based, which can mean delayed support for US customers. SendProp offers US-based support during standard US business hours (9-5 EST).",
  },
  {
    title: "Modern developer API",
    description:
      "SendProp is built with a modern tech stack and offers a comprehensive REST API for integrations and automation. Better for developers and custom workflows.",
  },
  {
    title: "Early bird pricing advantage",
    description:
      "Get SendProp Team for just $15/month (50% off) or Business for $50/month (50% off) with early bird pricing. Better value as you scale.",
  },
];

export default function BetterProposalsComparisonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            SendProp
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Button asChild>
              <Link href="/login">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Breadcrumb */}
        <div className="container pt-6">
          <Link
            href="/compare"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            All comparisons
          </Link>
        </div>

        {/* Hero */}
        <section className="container py-12 md:py-16">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="text-4xl font-bold">SendProp</div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              vs
            </Badge>
            <div className="text-4xl font-bold text-muted-foreground">Better Proposals</div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-6">
            Beautiful proposals with better value
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Love Better Proposals&apos; beautiful templates? SendProp gives you the same gorgeous
            designs with a more generous free tier, US-based support, and modern developer tools.
            Perfect for growing teams.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/login">
                Try SendProp Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Price Comparison */}
        <section className="container pb-16">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-primary">
              <CardHeader className="text-center">
                <CardTitle>Annual Cost Comparison</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  See how SendProp delivers better value for growing teams
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Better Proposals Premium</div>
                    <div className="text-2xl font-bold">~$29/mo</div>
                    <div className="text-lg text-muted-foreground mt-1">per user</div>
                    <div className="text-sm text-muted-foreground mt-2">limited integrations</div>
                    <div className="text-xl font-semibold mt-3 text-red-600">$348/year</div>
                  </div>
                  <div className="border-l pl-8">
                    <div className="text-sm text-muted-foreground mb-2">SendProp Team</div>
                    <div className="text-2xl font-bold text-green-600">$29/mo flat</div>
                    <div className="text-lg text-muted-foreground mt-1">up to 10 users</div>
                    <div className="text-sm text-muted-foreground mt-2">full integrations + API</div>
                    <div className="text-xl font-semibold mt-3 text-green-600">$348/year</div>
                    <div className="text-sm font-semibold text-green-600 mt-2">
                      ($180/yr with early bird)
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t text-center">
                  <div className="text-lg font-bold text-green-600">
                    Same price, but up to 10 team members vs 1 user!
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Or save 50% with early bird pricing ($15/mo for Team plan)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why Switch */}
        <section className="container pb-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Why businesses switch from Better Proposals
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {switchReasons.map((reason, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    {reason.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{reason.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Detailed Comparison */}
        <section className="container pb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Feature-by-Feature Comparison</h2>
          <div className="max-w-4xl mx-auto space-y-8">
            {comparisonData.map((section) => (
              <div key={section.category}>
                <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                  {section.category}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 font-medium">Feature</th>
                        <th className="text-center py-3 px-4 font-medium w-32 bg-primary/5">
                          SendProp
                        </th>
                        <th className="text-center py-3 px-4 font-medium w-32">Better Proposals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-3 px-4">{row.feature}</td>
                          <td className="text-center py-3 px-4 bg-primary/5">
                            {typeof row.sendprop === "boolean" ? (
                              row.sendprop ? (
                                <Check className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )
                            ) : (
                              <span className="font-medium text-green-600">{row.sendprop}</span>
                            )}
                          </td>
                          <td className="text-center py-3 px-4">
                            {typeof row.betterproposals === "boolean" ? (
                              row.betterproposals ? (
                                <Check className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )
                            ) : (
                              <span className="text-muted-foreground">{row.betterproposals}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Line */}
        <section className="container pb-16">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>The Bottom Line</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>Better Proposals</strong> is a solid UK-based proposal platform known for
                beautiful templates and good design. It&apos;s a good choice if you&apos;re based in
                Europe and need simple proposal features without complex integrations.
              </p>
              <p>
                <strong>SendProp</strong> offers the same beautiful templates and core features, but
                with a more generous free tier (3 docs/month vs limited trial), US-based support with
                better hours for American customers, and a modern developer API. If you&apos;re looking
                for better value, team collaboration, and room to grow, SendProp is the smarter choice.
              </p>
              <div className="pt-4">
                <Button asChild>
                  <Link href="/login">Try SendProp Free - No Credit Card Required</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Import CTA */}
        <section className="container pb-16">
          <Card className="max-w-3xl mx-auto border-dashed">
            <CardContent className="py-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Already using Better Proposals?</h3>
              <p className="text-muted-foreground mb-4">
                Import your existing templates and documents. We make switching easy.
              </p>
              <Button variant="outline" asChild>
                <Link href="/settings/integrations">
                  Learn About Template Import
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="container pb-24">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready for a better proposal experience?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                Get beautiful templates, generous free tier, US-based support, and modern
                integrations. Start for free today.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/login">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SendProp. All rights reserved.</p>
          <p className="mt-2">
            Better Proposals is a registered trademark of Better Proposals Ltd. SendProp is not affiliated with
            Better Proposals.
          </p>
        </div>
      </footer>
    </div>
  );
}
