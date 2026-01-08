import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "SendProp vs DocuSign - Better Alternative for Small Teams",
  description:
    "Compare SendProp to DocuSign. See why growing businesses choose SendProp for proposals, e-signatures, and payments at a fraction of the cost.",
  openGraph: {
    title: "SendProp vs DocuSign - Better Alternative for Small Teams",
    description:
      "Compare SendProp to DocuSign. Get proposals, signatures, and payments without enterprise pricing.",
  },
};

const comparisonData = [
  {
    category: "Pricing",
    items: [
      { feature: "Free plan available", sendprop: true, docusign: false },
      { feature: "Starter plan", sendprop: "$0/mo", docusign: "N/A" },
      { feature: "Team plan", sendprop: "$29/mo flat", docusign: "$45/mo per user" },
      { feature: "Business plan", sendprop: "$99/mo flat", docusign: "$65/mo per user" },
      { feature: "Per-user pricing", sendprop: false, docusign: true },
      { feature: "No per-envelope fees", sendprop: true, docusign: false },
      { feature: "Unlimited templates", sendprop: true, docusign: "5 on basic" },
    ],
  },
  {
    category: "Core Features",
    items: [
      { feature: "E-signatures", sendprop: true, docusign: true },
      { feature: "Drag-and-drop document builder", sendprop: true, docusign: false },
      { feature: "Built-in payment collection", sendprop: true, docusign: false },
      { feature: "Proposal templates", sendprop: true, docusign: "Limited" },
      { feature: "Variables/merge fields", sendprop: true, docusign: true },
      { feature: "Document reminders", sendprop: true, docusign: true },
      { feature: "Blockchain verification", sendprop: true, docusign: false },
    ],
  },
  {
    category: "Collaboration",
    items: [
      { feature: "Team workspaces", sendprop: true, docusign: true },
      { feature: "Shared templates", sendprop: true, docusign: true },
      { feature: "Activity tracking", sendprop: true, docusign: true },
      { feature: "Role-based permissions", sendprop: true, docusign: true },
    ],
  },
  {
    category: "Ease of Use",
    items: [
      { feature: "Setup time", sendprop: "5 min", docusign: "30+ min" },
      { feature: "Learning curve", sendprop: "Minimal", docusign: "Steep" },
      { feature: "Mobile-friendly signing", sendprop: true, docusign: true },
      { feature: "No software install needed", sendprop: true, docusign: true },
    ],
  },
];

const switchReasons = [
  {
    title: "Save 85%+ with flat-rate pricing",
    description:
      "DocuSign charges $45-65 per user monthly. SendProp is just $29-99/mo flat for your entire team. A 5-person team saves $2,000+ per year.",
  },
  {
    title: "Proposals + Signatures + Payments",
    description:
      "DocuSign is signatures-only. You'll need separate tools for proposals and payments. SendProp does it all.",
  },
  {
    title: "Built for small teams",
    description:
      "DocuSign was built for enterprises. SendProp focuses on what freelancers and small businesses actually need.",
  },
  {
    title: "No learning curve",
    description:
      "Get started in minutes, not hours. Our drag-and-drop builder is intuitive from day one.",
  },
];

export default function DocuSignComparisonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 flex h-16 items-center justify-between">
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
            <div className="text-4xl font-bold">SendProp</div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              vs
            </Badge>
            <div className="text-4xl font-bold text-muted-foreground">DocuSign</div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-6">
            The DocuSign alternative built for small teams
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Get proposals, e-signatures, and payment collection in one tool -
            without enterprise pricing or per-envelope fees.
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

        {/* Why Switch */}
        <section className="container mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Why businesses switch from DocuSign
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
                          SendProp
                        </th>
                        <th className="text-center py-3 px-4 font-medium w-32">DocuSign</th>
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
                <strong>DocuSign</strong> is an excellent choice for large enterprises that need
                complex workflows, advanced compliance features, and have the budget for
                per-envelope pricing. It&apos;s the industry standard for a reason.
              </p>
              <p>
                <strong>SendProp</strong> is built for freelancers, agencies, and small businesses
                who need a simpler, more affordable solution. If you want to create proposals,
                collect signatures, AND get paid - all in one place - SendProp delivers at a
                fraction of the cost.
              </p>
              <div className="pt-4">
                <Button asChild>
                  <Link href="/login">Try SendProp Free - No Credit Card Required</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 pb-24">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to make the switch?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                Start your free trial today. Import your templates and be up and
                running in minutes.
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
          <p>&copy; {new Date().getFullYear()} SendProp. All rights reserved.</p>
          <p className="mt-2">
            DocuSign is a registered trademark of DocuSign, Inc. SendProp is not affiliated with
            DocuSign.
          </p>
        </div>
      </footer>
    </div>
  );
}
