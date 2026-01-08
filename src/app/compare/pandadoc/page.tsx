import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "OpenProposal vs PandaDoc - The Affordable Alternative",
  description:
    "Compare OpenProposal to PandaDoc. Get the same great proposal features with built-in payments at half the price. No expensive add-ons required.",
  openGraph: {
    title: "OpenProposal vs PandaDoc - The Affordable Alternative",
    description:
      "Compare OpenProposal to PandaDoc. Same features, lower price, payments included.",
  },
};

const comparisonData = [
  {
    category: "Pricing",
    items: [
      { feature: "Free plan available", openproposal: true, pandadoc: true },
      { feature: "Starter plan price", openproposal: "$0/mo (3 docs)", pandadoc: "$0/mo (limited)" },
      { feature: "Team plan price", openproposal: "$29/mo flat", pandadoc: "$35/mo per user" },
      { feature: "Business plan price", openproposal: "$99/mo flat", pandadoc: "$65/mo per user" },
      { feature: "Per-user pricing", openproposal: false, pandadoc: true },
      { feature: "Payment collection", openproposal: "Included", pandadoc: "Add-on cost" },
      { feature: "Early bird discount", openproposal: "Up to 50% off", pandadoc: "~10% annual" },
    ],
  },
  {
    category: "Document Creation",
    items: [
      { feature: "Drag-and-drop builder", openproposal: true, pandadoc: true },
      { feature: "Template library", openproposal: true, pandadoc: true },
      { feature: "Custom branding", openproposal: true, pandadoc: true },
      { feature: "Content blocks", openproposal: true, pandadoc: true },
      { feature: "Variables/merge fields", openproposal: true, pandadoc: true },
    ],
  },
  {
    category: "Signatures & Payments",
    items: [
      { feature: "E-signatures", openproposal: true, pandadoc: true },
      { feature: "Payment collection", openproposal: true, pandadoc: "Add-on" },
      { feature: "Stripe integration", openproposal: true, pandadoc: true },
      { feature: "Partial payments", openproposal: true, pandadoc: "Add-on" },
      { feature: "Blockchain verification", openproposal: true, pandadoc: false },
    ],
  },
  {
    category: "Workflow",
    items: [
      { feature: "Document tracking", openproposal: true, pandadoc: true },
      { feature: "Automatic reminders", openproposal: true, pandadoc: true },
      { feature: "Team collaboration", openproposal: true, pandadoc: true },
      { feature: "CRM integrations", openproposal: "HubSpot, Salesforce", pandadoc: "Many" },
      { feature: "API access", openproposal: true, pandadoc: true },
    ],
  },
];

const switchReasons = [
  {
    title: "Flat-rate pricing, not per-user",
    description:
      "PandaDoc charges $35-65/month per user. OpenProposal is $29-99/month flat for unlimited team members (Team: up to 10, Business: unlimited).",
  },
  {
    title: "Payments included",
    description:
      "PandaDoc charges extra for payment collection. OpenProposal includes it in every paid plan at no additional cost.",
  },
  {
    title: "Early bird pricing",
    description:
      "Get OpenProposal Team for just $15/month (50% off) or Business for $50/month (50% off) with early bird pricing.",
  },
  {
    title: "Simpler, faster",
    description:
      "PandaDoc has powerful features but can feel overwhelming. OpenProposal keeps things simple and focused on what matters most.",
  },
];

export default function PandaDocComparisonPage() {
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
            <div className="text-4xl font-bold text-muted-foreground">PandaDoc</div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-6">
            All the proposal power, flat-rate pricing
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Love PandaDoc&apos;s features but not the per-user pricing? OpenProposal gives you drag-and-drop
            proposals, e-signatures, and payments with flat-rate team pricing. No per-user charges.
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
                    <div className="text-sm text-muted-foreground mb-2">PandaDoc Business</div>
                    <div className="text-2xl font-bold">$65/mo × 5 users</div>
                    <div className="text-lg text-muted-foreground mt-1">= $325/month</div>
                    <div className="text-sm text-muted-foreground mt-2">+ payment add-on costs</div>
                    <div className="text-xl font-semibold mt-3 text-red-600">$3,900/year</div>
                  </div>
                  <div className="border-l pl-8">
                    <div className="text-sm text-muted-foreground mb-2">OpenProposal Business</div>
                    <div className="text-2xl font-bold text-green-600">$99/mo flat</div>
                    <div className="text-lg text-muted-foreground mt-1">unlimited team</div>
                    <div className="text-sm text-muted-foreground mt-2">payments included</div>
                    <div className="text-xl font-semibold mt-3 text-green-600">$1,188/year</div>
                    <div className="text-sm font-semibold text-green-600 mt-2">
                      ($600/yr with early bird)
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t text-center">
                  <div className="text-lg font-bold text-green-600">
                    Save $2,712/year (or $3,300/year with early bird pricing!)
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
            Why businesses switch from PandaDoc
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
                        <th className="text-center py-3 px-4 font-medium w-32">PandaDoc</th>
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
                            {typeof row.pandadoc === "boolean" ? (
                              row.pandadoc ? (
                                <Check className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )
                            ) : (
                              <span className="text-muted-foreground">{row.pandadoc}</span>
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
                <strong>PandaDoc</strong> is a mature, feature-rich platform with extensive
                integrations and advanced features. It&apos;s great for larger teams who need
                complex workflows and have the budget for add-ons.
              </p>
              <p>
                <strong>OpenProposal</strong> offers the same core features - drag-and-drop proposals,
                e-signatures, and payment collection - at a significantly lower price point. If
                you&apos;re a freelancer, agency, or small business looking to save without
                sacrificing functionality, OpenProposal is your answer.
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
              <h3 className="text-lg font-semibold mb-2">Already using PandaDoc?</h3>
              <p className="text-muted-foreground mb-4">
                Import your existing templates and documents. We make switching easy.
              </p>
              <Button variant="outline" asChild>
                <Link href="/settings/integrations/pandadoc">
                  Learn About PandaDoc Import
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
                Ready to save $2,700+ per year?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                Get all the proposal features you love with flat-rate pricing that scales
                with your business, not against it.
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
            PandaDoc is a registered trademark of PandaDoc, Inc. OpenProposal is not affiliated with
            PandaDoc.
          </p>
        </div>
      </footer>
    </div>
  );
}
