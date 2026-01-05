import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "SendProp vs PandaDoc - The Affordable Alternative",
  description:
    "Compare SendProp to PandaDoc. Get the same great proposal features with built-in payments at half the price. No expensive add-ons required.",
  openGraph: {
    title: "SendProp vs PandaDoc - The Affordable Alternative",
    description:
      "Compare SendProp to PandaDoc. Same features, lower price, payments included.",
  },
};

const comparisonData = [
  {
    category: "Pricing",
    items: [
      { feature: "Free plan available", sendprop: true, pandadoc: false },
      { feature: "Essentials/Pro price", sendprop: "$12/mo", pandadoc: "$35/mo" },
      { feature: "Business plan price", sendprop: "$29/mo", pandadoc: "$65/mo" },
      { feature: "Payment collection", sendprop: "Included", pandadoc: "$15/mo add-on" },
      { feature: "Annual discount", sendprop: "2 months free", pandadoc: "~10%" },
    ],
  },
  {
    category: "Document Creation",
    items: [
      { feature: "Drag-and-drop builder", sendprop: true, pandadoc: true },
      { feature: "Template library", sendprop: true, pandadoc: true },
      { feature: "Custom branding", sendprop: true, pandadoc: true },
      { feature: "Content blocks", sendprop: true, pandadoc: true },
      { feature: "Variables/merge fields", sendprop: true, pandadoc: true },
    ],
  },
  {
    category: "Signatures & Payments",
    items: [
      { feature: "E-signatures", sendprop: true, pandadoc: true },
      { feature: "Payment collection", sendprop: true, pandadoc: "Add-on" },
      { feature: "Stripe integration", sendprop: true, pandadoc: true },
      { feature: "Partial payments", sendprop: true, pandadoc: "Add-on" },
      { feature: "Blockchain verification", sendprop: true, pandadoc: false },
    ],
  },
  {
    category: "Workflow",
    items: [
      { feature: "Document tracking", sendprop: true, pandadoc: true },
      { feature: "Automatic reminders", sendprop: true, pandadoc: true },
      { feature: "Team collaboration", sendprop: true, pandadoc: true },
      { feature: "CRM integrations", sendprop: "HubSpot, Salesforce", pandadoc: "Many" },
      { feature: "API access", sendprop: true, pandadoc: true },
    ],
  },
];

const switchReasons = [
  {
    title: "50% lower price",
    description:
      "PandaDoc starts at $35/month. SendProp Pro is just $12/month with all the same proposal features.",
  },
  {
    title: "Payments included",
    description:
      "PandaDoc charges $15/month extra for payment collection. SendProp includes it in every paid plan.",
  },
  {
    title: "Free tier for starters",
    description:
      "PandaDoc has no free plan. SendProp lets you start free and upgrade when you're ready.",
  },
  {
    title: "Simpler, faster",
    description:
      "PandaDoc has powerful features but can feel overwhelming. SendProp keeps things simple and focused.",
  },
];

export default function PandaDocComparisonPage() {
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
            <div className="text-4xl font-bold text-muted-foreground">PandaDoc</div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-6">
            All the proposal power, half the price
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Love PandaDoc&apos;s features but not the price? SendProp gives you drag-and-drop
            proposals, e-signatures, and payments - all for less than PandaDoc&apos;s base plan.
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
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-primary">
              <CardHeader className="text-center">
                <CardTitle>Annual Cost Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">PandaDoc Business</div>
                    <div className="text-3xl font-bold">$780/yr</div>
                    <div className="text-sm text-muted-foreground">+ $180/yr for payments</div>
                    <div className="text-lg font-semibold mt-2">= $960/year</div>
                  </div>
                  <div className="border-l pl-8">
                    <div className="text-sm text-muted-foreground mb-2">SendProp Business</div>
                    <div className="text-3xl font-bold text-green-600">$290/yr</div>
                    <div className="text-sm text-muted-foreground">payments included</div>
                    <div className="text-lg font-semibold mt-2 text-green-600">
                      Save $670/year
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why Switch */}
        <section className="container pb-16">
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
                        <th className="text-center py-3 px-4 font-medium w-32">PandaDoc</th>
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
        <section className="container pb-16">
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
                <strong>SendProp</strong> offers the same core features - drag-and-drop proposals,
                e-signatures, and payment collection - at a significantly lower price point. If
                you&apos;re a freelancer, agency, or small business looking to save without
                sacrificing functionality, SendProp is your answer.
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
        <section className="container pb-24">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to save $670+ per year?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                Get all the proposal features you love at a price that makes sense
                for your business.
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
            PandaDoc is a registered trademark of PandaDoc, Inc. SendProp is not affiliated with
            PandaDoc.
          </p>
        </div>
      </footer>
    </div>
  );
}
