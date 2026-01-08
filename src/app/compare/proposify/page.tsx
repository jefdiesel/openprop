import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "OpenProposal vs Proposify - Better Value for Small Businesses",
  description:
    "Compare OpenProposal to Proposify. Get modern proposal features with built-in payments at a fraction of the cost. Simpler interface, better value.",
  openGraph: {
    title: "OpenProposal vs Proposify - Better Value for Small Businesses",
    description:
      "Compare OpenProposal to Proposify. More affordable, simpler interface, payments included.",
  },
};

const comparisonData = [
  {
    category: "Pricing",
    items: [
      { feature: "Free plan available", openproposal: true, proposify: false },
      { feature: "Starter plan price", openproposal: "$0/mo (3 docs)", proposify: "$19/mo" },
      { feature: "Team plan price", openproposal: "$29/mo flat", proposify: "$49/mo per user" },
      { feature: "Business plan price", openproposal: "$99/mo flat", proposify: "$99/mo per user" },
      { feature: "Per-user pricing", openproposal: false, proposify: true },
      { feature: "Payment collection", openproposal: "Included", proposify: "Included" },
      { feature: "Early bird discount", openproposal: "Up to 50% off", proposify: "Limited" },
    ],
  },
  {
    category: "Document Creation",
    items: [
      { feature: "Drag-and-drop builder", openproposal: true, proposify: true },
      { feature: "Template library", openproposal: true, proposify: true },
      { feature: "Custom branding", openproposal: true, proposify: true },
      { feature: "Content blocks", openproposal: true, proposify: true },
      { feature: "Variables/merge fields", openproposal: true, proposify: true },
      { feature: "Modern, simple UI", openproposal: true, proposify: false },
    ],
  },
  {
    category: "Signatures & Payments",
    items: [
      { feature: "E-signatures", openproposal: true, proposify: true },
      { feature: "Payment collection", openproposal: true, proposify: true },
      { feature: "Stripe integration", openproposal: true, proposify: true },
      { feature: "Partial payments", openproposal: true, proposify: true },
      { feature: "Blockchain verification", openproposal: true, proposify: false },
    ],
  },
  {
    category: "Workflow",
    items: [
      { feature: "Document tracking", openproposal: true, proposify: true },
      { feature: "Analytics", openproposal: true, proposify: true },
      { feature: "Automatic reminders", openproposal: true, proposify: true },
      { feature: "Team collaboration", openproposal: true, proposify: true },
      { feature: "CRM integrations", openproposal: "HubSpot, Salesforce", proposify: "Limited" },
      { feature: "API access", openproposal: true, proposify: true },
    ],
  },
];

const switchReasons = [
  {
    title: "Much lower pricing",
    description:
      "Proposify charges $49-99/month per user. OpenProposal is $29-99/month flat for unlimited team members (Team: up to 10, Business: unlimited).",
  },
  {
    title: "Simpler, more modern interface",
    description:
      "Proposify's interface can feel complex and overwhelming. OpenProposal offers a clean, modern design that's intuitive and easy to navigate.",
  },
  {
    title: "Early bird pricing advantage",
    description:
      "Get OpenProposal Team for just $15/month (50% off) or Business for $50/month (50% off) with early bird pricing. Much better value than Proposify.",
  },
  {
    title: "Built for small businesses",
    description:
      "OpenProposal is designed specifically for freelancers, agencies, and small businesses who need powerful features without the enterprise complexity and cost.",
  },
];

export default function ProposifyComparisonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 flex h-16 items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            OpenProposal
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
        <div className="container mx-auto px-6 pt-6">
          <Link
            href="/compare"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            All comparisons
          </Link>
        </div>

        {/* Hero */}
        <section className="container mx-auto px-6 py-12 md:py-16">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="text-4xl font-bold">OpenProposal</div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              vs
            </Badge>
            <div className="text-4xl font-bold text-muted-foreground">Proposify</div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-6">
            Better value, simpler experience
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Love proposal software but not Proposify&apos;s complexity and pricing? OpenProposal gives you
            beautiful proposals, e-signatures, and payments with a modern, intuitive interface at
            a fraction of the cost.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/login">
                Try OpenProposal Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Price Comparison */}
        <section className="container mx-auto px-6 pb-16">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-primary">
              <CardHeader className="text-center">
                <CardTitle>Annual Cost Comparison (5-person team)</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  See how flat-rate pricing saves you money as your team grows
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Proposify Team</div>
                    <div className="text-2xl font-bold">$49/mo × 5 users</div>
                    <div className="text-lg text-muted-foreground mt-1">= $245/month</div>
                    <div className="text-sm text-muted-foreground mt-2">&nbsp;</div>
                    <div className="text-xl font-semibold mt-3 text-red-600">$2,940/year</div>
                  </div>
                  <div className="border-l pl-8">
                    <div className="text-sm text-muted-foreground mb-2">OpenProposal Team</div>
                    <div className="text-2xl font-bold text-green-600">$29/mo flat</div>
                    <div className="text-lg text-muted-foreground mt-1">up to 10 team members</div>
                    <div className="text-sm text-muted-foreground mt-2">payments included</div>
                    <div className="text-xl font-semibold mt-3 text-green-600">$348/year</div>
                    <div className="text-sm font-semibold text-green-600 mt-2">
                      ($180/yr with early bird)
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t text-center">
                  <div className="text-lg font-bold text-green-600">
                    Save $2,592/year (or $2,760/year with early bird pricing!)
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Savings increase with every team member you add
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why Switch */}
        <section className="container mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Why businesses switch from Proposify
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
        <section className="container mx-auto px-6 pb-16">
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
                          OpenProposal
                        </th>
                        <th className="text-center py-3 px-4 font-medium w-32">Proposify</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-3 px-4">{row.feature}</td>
                          <td className="text-center py-3 px-4 bg-primary/5">
                            {typeof row.openproposal === "boolean" ? (
                              row.openproposal ? (
                                <Check className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )
                            ) : (
                              <span className="font-medium text-green-600">{row.openproposal}</span>
                            )}
                          </td>
                          <td className="text-center py-3 px-4">
                            {typeof row.proposify === "boolean" ? (
                              row.proposify ? (
                                <Check className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )
                            ) : (
                              <span className="text-muted-foreground">{row.proposify}</span>
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
        <section className="container mx-auto px-6 pb-16">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>The Bottom Line</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>Proposify</strong> is a proposal-focused platform with strong template
                capabilities and analytics. However, it suffers from expensive per-user pricing,
                a complex interface, and limited integration options.
              </p>
              <p>
                <strong>OpenProposal</strong> offers the same core proposal features - templates,
                e-signatures, analytics, and payment collection - with a modern, intuitive
                interface at a much lower price point. If you&apos;re a freelancer, agency, or
                small business looking for better value without sacrificing quality, OpenProposal is
                the clear choice.
              </p>
              <div className="pt-4">
                <Button asChild>
                  <Link href="/login">Try OpenProposal Free - No Credit Card Required</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Import CTA */}
        <section className="container mx-auto px-6 pb-16">
          <Card className="max-w-3xl mx-auto border-dashed">
            <CardContent className="py-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Already using Proposify?</h3>
              <p className="text-muted-foreground mb-4">
                Import your existing templates and documents. We make switching easy.
              </p>
              <Button variant="outline" asChild>
                <Link href="/settings/integrations/proposify">
                  Learn About Proposify Import
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 pb-24">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to save $2,500+ per year?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                Get all the proposal features you need with a simpler interface and flat-rate
                pricing that won&apos;t break the bank.
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
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} OpenProposal. All rights reserved.</p>
          <p className="mt-2">
            Proposify is a registered trademark of Proposify, Inc. OpenProposal is not affiliated with
            Proposify.
          </p>
        </div>
      </footer>
    </div>
  );
}
