import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, ArrowRight, Zap, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Compare SendProp vs DocuSign, PandaDoc & More",
  description:
    "See how SendProp compares to DocuSign, PandaDoc, and other e-signature tools. Get proposals, signatures, and payments in one affordable solution.",
  openGraph: {
    title: "Compare SendProp vs DocuSign, PandaDoc & More",
    description:
      "See how SendProp compares to DocuSign, PandaDoc, and other e-signature tools.",
  },
};

const competitors = [
  {
    name: "DocuSign",
    slug: "docusign",
    tagline: "The enterprise giant",
    description: "Great for large enterprises, but expensive and complex for small teams.",
    logo: "📝",
  },
  {
    name: "PandaDoc",
    slug: "pandadoc",
    tagline: "The proposal specialist",
    description: "Strong proposal features, but payments require expensive add-ons.",
    logo: "🐼",
  },
];

const comparisonFeatures = [
  { feature: "Starting price", sendprop: "Free", docusign: "$15/mo", pandadoc: "$35/mo" },
  { feature: "E-signatures included", sendprop: true, docusign: true, pandadoc: true },
  { feature: "Drag-and-drop builder", sendprop: true, docusign: false, pandadoc: true },
  { feature: "Payment collection", sendprop: true, docusign: false, pandadoc: "Add-on" },
  { feature: "No per-document fees", sendprop: true, docusign: false, pandadoc: true },
  { feature: "Team collaboration", sendprop: true, docusign: true, pandadoc: true },
  { feature: "Blockchain verification", sendprop: true, docusign: false, pandadoc: false },
  { feature: "Templates included", sendprop: true, docusign: true, pandadoc: true },
  { feature: "Unlimited documents (Pro)", sendprop: true, docusign: false, pandadoc: true },
];

const whySendProp = [
  {
    icon: DollarSign,
    title: "Save 70%+ on costs",
    description: "No per-document fees, no expensive add-ons. One simple price for everything.",
  },
  {
    icon: Zap,
    title: "All-in-one workflow",
    description: "Proposals, signatures, and payments in a single tool. No more app-switching.",
  },
  {
    icon: Users,
    title: "Built for small teams",
    description: "Simple, focused features without enterprise bloat. Get started in minutes.",
  },
];

export default function ComparePage() {
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
        {/* Hero */}
        <section className="container py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Why teams switch to SendProp
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Compare SendProp to other e-signature and proposal tools.
            See why growing businesses choose our all-in-one solution.
          </p>
          <Button size="lg" asChild>
            <Link href="/login">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>

        {/* Competitor Cards */}
        <section className="container pb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Detailed Comparisons</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {competitors.map((comp) => (
              <Link key={comp.slug} href={`/compare/${comp.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="text-4xl mb-2">{comp.logo}</div>
                    <CardTitle>SendProp vs {comp.name}</CardTitle>
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

        {/* Quick Comparison Table */}
        <section className="container pb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Quick Feature Comparison</h2>
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 font-medium bg-primary/5">SendProp</th>
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

        {/* Why SendProp */}
        <section className="container pb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose SendProp?</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {whySendProp.map((item, i) => (
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
        <section className="container pb-24">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to simplify your workflow?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                Join thousands of businesses using SendProp to create proposals,
                collect signatures, and get paid faster.
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
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SendProp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
