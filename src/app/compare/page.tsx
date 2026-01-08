import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, ArrowRight, Zap, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Compare OpenProposal vs DocuSign, PandaDoc & More",
  description:
    "See how OpenProposal compares to DocuSign, PandaDoc, and other e-signature tools. Get proposals, signatures, and payments in one affordable flat-rate solution.",
  openGraph: {
    title: "Compare OpenProposal vs DocuSign, PandaDoc & More",
    description:
      "See how OpenProposal compares to DocuSign, PandaDoc, and other e-signature tools. Flat-rate pricing with no per-user fees.",
  },
};

const competitors = [
  {
    name: "DocuSign",
    slug: "docusign",
    tagline: "The enterprise giant",
    description: "Great for large enterprises, but expensive per-user pricing makes it costly for small teams.",
    logo: "📝",
  },
  {
    name: "PandaDoc",
    slug: "pandadoc",
    tagline: "The proposal specialist",
    description: "Strong proposal features, but per-user pricing and payments add-ons increase costs significantly.",
    logo: "🐼",
  },
];

const pricingComparison = [
  {
    tier: "Free/Starter",
    openproposal: "$0/mo",
    openproposalDetails: "3 docs/month",
    docusign: "~$15/mo",
    docusignDetails: "Personal plan, limited features",
    pandadoc: "$0",
    pandadocDetails: "Very limited, watermarked",
  },
  {
    tier: "Team",
    openproposal: "$29/mo",
    openproposalDetails: "Flat rate for up to 10 members",
    docusign: "~$45/user/mo",
    docusignDetails: "$450/mo for 10 users",
    pandadoc: "~$35/user/mo",
    pandadocDetails: "$350/mo for 10 users",
  },
  {
    tier: "Business",
    openproposal: "$99/mo",
    openproposalDetails: "Flat rate, unlimited members",
    docusign: "~$65/user/mo",
    docusignDetails: "$650+ for 10 users",
    pandadoc: "~$65/user/mo",
    pandadocDetails: "$650+ for 10 users",
  },
];

const comparisonFeatures = [
  { feature: "Starting price", sendprop: "$0/mo", docusign: "~$15/mo", pandadoc: "$0 (limited)" },
  { feature: "Per-user fees", sendprop: "None - flat rate", docusign: "Yes ($45-65/user)", pandadoc: "Yes ($35-65/user)" },
  { feature: "Team plan (10 users)", sendprop: "$29/mo total", docusign: "~$450/mo", pandadoc: "~$350/mo" },
  { feature: "E-signatures included", sendprop: true, docusign: true, pandadoc: true },
  { feature: "Drag-and-drop builder", sendprop: true, docusign: false, pandadoc: true },
  { feature: "Variables/merge fields", sendprop: true, docusign: true, pandadoc: true },
  { feature: "Payment collection", sendprop: true, docusign: false, pandadoc: "Add-on" },
  { feature: "Blockchain verification", sendprop: true, docusign: false, pandadoc: false },
  { feature: "Templates included", sendprop: true, docusign: true, pandadoc: true },
  { feature: "Unlimited documents", sendprop: "Team & Business", docusign: false, pandadoc: "Business+" },
];

const whyOpenProposal = [
  {
    icon: DollarSign,
    title: "Save 90%+ on costs",
    description: "Flat-rate pricing with no per-user fees. Pay $29/mo for your whole team instead of $350+ with competitors.",
  },
  {
    icon: Zap,
    title: "All-in-one workflow",
    description: "Proposals, signatures, and payments in a single tool. No expensive add-ons or integrations required.",
  },
  {
    icon: Users,
    title: "Built for growing teams",
    description: "Simple, powerful features without enterprise complexity. Add unlimited team members on Business plan.",
  },
];

export default function ComparePage() {
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
        {/* Hero */}
        <section className="container mx-auto px-6 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Why teams switch to OpenProposal
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Compare OpenProposal to other e-signature and proposal tools.
            See why growing businesses choose our flat-rate, all-in-one solution.
          </p>
          <Button size="lg" asChild>
            <Link href="/login">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>

        {/* Competitor Cards */}
        <section className="container mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Detailed Comparisons</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {competitors.map((comp) => (
              <Link key={comp.slug} href={`/compare/${comp.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="text-4xl mb-2">{comp.logo}</div>
                    <CardTitle>OpenProposal vs {comp.name}</CardTitle>
                    <CardDescription>{comp.tagline}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{comp.description}</p>
                    <span className="text-primary text-sm font-medium inline-flex items-center">
                      See full comparison <ArrowRight className="ml-1 h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Pricing Comparison */}
        <section className="container mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-center mb-4">Pricing Comparison</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            OpenProposal uses flat-rate pricing with no per-user fees.
            Save hundreds per month compared to competitors that charge per user.
          </p>
          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium">Plan Tier</th>
                  <th className="text-center py-4 px-4 font-medium bg-primary/5">
                    <div className="font-bold text-primary">OpenProposal</div>
                    <div className="text-xs text-muted-foreground font-normal mt-1">Flat rate pricing</div>
                  </th>
                  <th className="text-center py-4 px-4 font-medium">
                    <div>DocuSign</div>
                    <div className="text-xs text-muted-foreground font-normal mt-1">Per-user pricing</div>
                  </th>
                  <th className="text-center py-4 px-4 font-medium">
                    <div>PandaDoc</div>
                    <div className="text-xs text-muted-foreground font-normal mt-1">Per-user pricing</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pricingComparison.map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-4 px-4 font-medium">{row.tier}</td>
                    <td className="text-center py-4 px-4 bg-primary/5">
                      <div className="font-bold text-green-600">{row.openproposal}</div>
                      <div className="text-xs text-muted-foreground mt-1">{row.openproposalDetails}</div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="font-medium">{row.docusign}</div>
                      <div className="text-xs text-muted-foreground mt-1">{row.docusignDetails}</div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="font-medium">{row.pandadoc}</div>
                      <div className="text-xs text-muted-foreground mt-1">{row.pandadocDetails}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="max-w-5xl mx-auto mt-6">
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      Save up to 93% with flat-rate pricing
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      With 10 team members: OpenProposal costs $29/mo vs $350-450/mo for competitors.
                      That's over $4,000/year in savings!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Comparison Table */}
        <section className="container mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 font-medium bg-primary/5">OpenProposal</th>
                  <th className="text-center py-4 px-4 font-medium">DocuSign</th>
                  <th className="text-center py-4 px-4 font-medium">PandaDoc</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-4 px-4">{row.feature}</td>
                    <td className="text-center py-4 px-4 bg-primary/5">
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
                    <td className="text-center py-4 px-4">
                      {typeof row.docusign === "boolean" ? (
                        row.docusign ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-muted-foreground">{row.docusign}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
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
        </section>

        {/* Why OpenProposal */}
        <section className="container mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose OpenProposal?</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {whyOpenProposal.map((item, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 pb-24">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to save thousands with flat-rate pricing?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                Join businesses using OpenProposal to create proposals,
                collect signatures, and get paid faster - without per-user fees.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/login">
                  Start Free - No Credit Card Required
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} OpenProposal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
