import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Web Design Proposal Template: Win More Design Projects [Free Template]",
  description:
    "A proven web design proposal template that helps designers and agencies close $5K-$50K+ projects. Free template with tips to win more clients.",
  openGraph: {
    title: "Web Design Proposal Template: Win More Design Projects [Free Template]",
    description:
      "A proven web design proposal template that helps designers and agencies close $5K-$50K+ projects.",
  },
};

export default function WebDesignProposalTemplatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Send className="h-6 w-6" />
            <span className="text-xl font-bold">OpenProposal</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/#features" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Features
            </Link>
            <Link href="/#pricing" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Pricing
            </Link>
            <Link href="/compare" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">Compare</Link>
            <Link href="/blog" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Blog
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

      <main>
        {/* Hero */}
        <section className="container mx-auto px-6 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              Free Template
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Web Design Proposal Template: Win More Design Projects
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A proven web design proposal template that helps designers and agencies close $5,000-$50,000+ projects.
            </p>
            <div className="flex gap-4 mb-12">
              <Button size="lg" asChild>
                <Link href="/login">
                  Use This Template
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="container mx-auto px-6 pb-12">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <p className="text-lg leading-relaxed text-muted-foreground">
              A great web design portfolio gets you in the door. A great proposal closes the deal.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              This template is used by designers and agencies to win projects from $5,000 website refreshes to $50,000+ custom builds.
            </p>
          </div>
        </section>

        {/* Web Design Proposal Template */}
        <section className="container mx-auto px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Web Design Proposal Template</h2>

            <Card className="mb-8">
              <CardContent className="py-8 space-y-6">
                <div className="text-center border-b pb-6">
                  <div className="text-sm text-muted-foreground mb-4">[Your Agency/Name Logo]</div>
                  <h3 className="text-2xl font-bold">Website Design Proposal</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Prepared for:</p>
                    <p className="font-medium">[Client Company]</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prepared by:</p>
                    <p className="font-medium">[Your Name/Agency]</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date:</p>
                    <p className="font-medium">[Date]</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valid until:</p>
                    <p className="font-medium">[Date + 21 days]</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Overview */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Project Overview</h3>
              <Card>
                <CardContent className="py-6 space-y-4">
                  <p>
                    <strong>[Client Company]</strong> needs a new website that [primary goal: converts visitors, builds credibility, generates leads, showcases work, etc.].
                  </p>
                  <p>Based on our discovery call, you&apos;re looking for:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>[Goal 1]</li>
                    <li>[Goal 2]</li>
                    <li>[Goal 3]</li>
                  </ul>
                  <p className="font-medium">
                    This proposal outlines a website design project that will deliver [primary outcome].
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Current Situation */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Current Situation</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      What&apos;s Working
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>[Something positive about their current presence]</li>
                      <li>[Another positive element]</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <X className="h-5 w-5 text-red-500" />
                      Opportunities for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>[Issue 1: e.g., &quot;Outdated design creates a poor first impression&quot;]</li>
                      <li>[Issue 2: e.g., &quot;Not mobile-optimized (65% of traffic is mobile)&quot;]</li>
                      <li>[Issue 3: e.g., &quot;No clear calls-to-action&quot;]</li>
                      <li>[Issue 4: e.g., &quot;Slow page load times hurting SEO&quot;]</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Your current website is [specific problem: losing potential customers, hurting credibility, ranking poorly, etc.]. Based on industry benchmarks, an improved website could [specific benefit: increase conversions by X%, generate X more leads, etc.].
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Proposed Solution */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Proposed Solution</h3>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>The Website</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>A modern, responsive website designed to [achieve primary goal].</p>

                  <div>
                    <p className="font-semibold mb-2">Key Features:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                      <li>Mobile-first responsive design</li>
                      <li>[X] custom-designed pages</li>
                      <li>Clear user journey and calls-to-action</li>
                      <li>SEO-friendly structure</li>
                      <li>Fast loading speeds</li>
                      <li>[CMS platform] for easy updates</li>
                      <li>[Any specific features discussed]</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Pages Included</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 font-medium">Page</th>
                        <th className="text-left py-3 px-4 font-medium">Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Home</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">First impression, key value proposition</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">About</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">Build trust and credibility</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Services/Products</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">Showcase offerings</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">[Page 4]</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">[Purpose]</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">[Page 5]</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">[Purpose]</td>
                      </tr>
                      <tr className="border-b last:border-0">
                        <td className="py-3 px-4">Contact</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">Convert visitors to inquiries</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Functionality</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm">Contact form with email notifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm">Mobile-responsive design</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm">Basic SEO setup</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm">Google Analytics integration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm">Social media links</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm">[Any additional features]</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Design Approach */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Design Approach</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Phase 1: Discovery (Week 1)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 mb-4 text-sm">
                      <li>Kickoff meeting</li>
                      <li>Competitor analysis</li>
                      <li>Brand review</li>
                      <li>Content inventory</li>
                      <li>Sitemap creation</li>
                    </ul>
                    <p className="text-sm font-medium">Deliverable: Project brief and sitemap</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Phase 2: Design (Weeks 2-3)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 mb-4 text-sm">
                      <li>Wireframes for key pages</li>
                      <li>Visual design concepts</li>
                      <li>[X] rounds of revisions</li>
                      <li>Final design approval</li>
                    </ul>
                    <p className="text-sm font-medium">Deliverable: Approved visual designs</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Phase 3: Development (Weeks 4-5)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 mb-4 text-sm">
                      <li>Build on [platform: WordPress/Webflow/Squarespace/custom]</li>
                      <li>Responsive implementation</li>
                      <li>CMS setup and configuration</li>
                      <li>Form and integration setup</li>
                    </ul>
                    <p className="text-sm font-medium">Deliverable: Staging site for review</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Phase 4: Launch (Week 6)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 mb-4 text-sm">
                      <li>Content migration/population</li>
                      <li>Cross-browser testing</li>
                      <li>Performance optimization</li>
                      <li>Final review and approval</li>
                      <li>Go live!</li>
                    </ul>
                    <p className="text-sm font-medium">Deliverable: Live website</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Post-Launch Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>[X] days bug fixes</li>
                    <li>[X] hours of minor updates</li>
                    <li>Training on CMS usage</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Timeline</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Phase</th>
                      <th className="text-left py-3 px-4 font-medium">Duration</th>
                      <th className="text-left py-3 px-4 font-medium">Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Discovery</td>
                      <td className="py-3 px-4 text-sm">1 week</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">[Date]</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Design</td>
                      <td className="py-3 px-4 text-sm">2 weeks</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">[Date]</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Development</td>
                      <td className="py-3 px-4 text-sm">2 weeks</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">[Date]</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Launch</td>
                      <td className="py-3 px-4 text-sm">1 week</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">[Date]</td>
                    </tr>
                    <tr className="border-b last:border-0">
                      <td className="py-3 px-4 font-bold">Total</td>
                      <td className="py-3 px-4 text-sm font-bold">6 weeks</td>
                      <td className="py-3 px-4 text-sm font-bold">[Date]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Timeline begins upon deposit payment and assumes client feedback within 2 business days at each review point.
              </p>
            </div>

            {/* Investment */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Investment</h3>

              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Option A: Complete Website Package</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 font-medium">Item</th>
                        <th className="text-left py-3 px-4 font-medium">Details</th>
                        <th className="text-right py-3 px-4 font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Discovery & Strategy</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">Kickoff, research, sitemap</td>
                        <td className="py-3 px-4 text-right">$X,XXX</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Design</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">Wireframes, visual design, revisions</td>
                        <td className="py-3 px-4 text-right">$X,XXX</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Development</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">Build, CMS, testing</td>
                        <td className="py-3 px-4 text-right">$X,XXX</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Launch Support</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">Migration, launch, training</td>
                        <td className="py-3 px-4 text-right">$XXX</td>
                      </tr>
                      <tr className="border-b last:border-0 bg-primary/5">
                        <td className="py-3 px-4 font-bold">Total</td>
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4 text-right font-bold">$X,XXX</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Option B: Design + Development Only</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 font-medium">Item</th>
                        <th className="text-left py-3 px-4 font-medium">Details</th>
                        <th className="text-right py-3 px-4 font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Design</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">Based on your provided brief</td>
                        <td className="py-3 px-4 text-right">$X,XXX</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Development</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">Build, CMS, testing</td>
                        <td className="py-3 px-4 text-right">$X,XXX</td>
                      </tr>
                      <tr className="border-b last:border-0 bg-primary/5">
                        <td className="py-3 px-4 font-bold">Total</td>
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4 text-right font-bold">$X,XXX</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Add-On Services</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 font-medium">Service</th>
                        <th className="text-right py-3 px-4 font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Additional pages</td>
                        <td className="py-3 px-4 text-right">$XXX each</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">E-commerce setup</td>
                        <td className="py-3 px-4 text-right">$X,XXX</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Custom animations</td>
                        <td className="py-3 px-4 text-right">$XXX</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Blog setup</td>
                        <td className="py-3 px-4 text-right">$XXX</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Ongoing maintenance</td>
                        <td className="py-3 px-4 text-right">$XXX/month</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">SEO optimization</td>
                        <td className="py-3 px-4 text-right">$X,XXX</td>
                      </tr>
                      <tr className="border-b last:border-0">
                        <td className="py-3 px-4">Copywriting</td>
                        <td className="py-3 px-4 text-right">$XXX/page</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* What's Included vs. Not Included */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">What&apos;s Included vs. Not Included</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      Included
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Custom design (not a template)</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Responsive/mobile design</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>[X] pages</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Basic SEO setup</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Contact form</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>CMS for self-editing</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>[X] rounds of design revisions</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>[X] days post-launch support</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Training video/session</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <X className="h-5 w-5 text-red-500" />
                      Not Included (Available Separately)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm">
                        <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>Copywriting (assumes client provides)</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>Photography/stock images</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>Logo design</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>Hosting fees</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>Domain registration</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>Ongoing maintenance</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>Additional pages beyond scope</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Payment Terms</h3>
              <Card>
                <CardContent className="py-6 space-y-4">
                  <div>
                    <p className="font-semibold">50% deposit to begin: <span className="text-primary">$X,XXX</span> (due upon acceptance)</p>
                  </div>
                  <div>
                    <p className="font-semibold">50% upon completion: <span className="text-primary">$X,XXX</span> (due before launch)</p>
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    Payment accepted via credit card or bank transfer.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Portfolio: Similar Projects</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">[Project 1 Name]</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Industry:</strong> [Industry]</p>
                    <p><strong>Challenge:</strong> [Similar challenge to this client]</p>
                    <p><strong>Result:</strong> [Measurable outcome if possible]</p>
                    <p className="text-primary">[Link to live site or case study]</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">[Project 2 Name]</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Industry:</strong> [Industry]</p>
                    <p><strong>Challenge:</strong> [Similar challenge]</p>
                    <p><strong>Result:</strong> [Outcome]</p>
                    <p className="text-primary">[Link]</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Why Work With */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Why Work With [Your Agency/Name]</h3>
              <Card>
                <CardContent className="py-6 space-y-4">
                  <ul className="list-disc list-inside space-y-2">
                    <li>[X] websites designed and launched</li>
                    <li>[X] years of experience</li>
                    <li>Expertise in [relevant specialty]</li>
                    <li>[Notable credential or client]</li>
                  </ul>

                  <div className="border-l-4 border-primary pl-4 py-2 bg-muted/30 rounded">
                    <p className="italic text-muted-foreground mb-2">
                      &quot;[Testimonial about results and working relationship]&quot;
                    </p>
                    <p className="text-sm font-medium">— [Name, Company]</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">What if I need more pages later?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Additional pages can be added at $XXX each, either during or after the project.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Who provides the content?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll need all text and images from you, though we offer copywriting and stock photo sourcing as add-ons.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">What about hosting?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      We recommend [hosting provider]. Costs approximately $XX/month. We can set this up for you.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Can I edit the site myself?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Yes! We build on [CMS], which makes it easy to update text, images, and add blog posts. We include training.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">What if I need changes after launch?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      The project includes [X] days of bug fixes. Additional changes can be done hourly or via a maintenance retainer.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Next Steps</h3>
              <Card>
                <CardContent className="py-6">
                  <ol className="list-decimal list-inside space-y-3">
                    <li className="text-sm"><strong>Review</strong> this proposal and let me know any questions</li>
                    <li className="text-sm"><strong>Sign</strong> the proposal below to accept</li>
                    <li className="text-sm"><strong>Submit</strong> the 50% deposit</li>
                    <li className="text-sm"><strong>Complete</strong> the project kickoff questionnaire (we&apos;ll send)</li>
                    <li className="text-sm"><strong>Schedule</strong> kickoff call within one week</li>
                  </ol>
                </CardContent>
              </Card>
            </div>

            {/* Acceptance */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Acceptance</h3>
              <Card>
                <CardContent className="py-6 space-y-4">
                  <p className="text-sm">
                    By signing below, you accept this proposal and authorize [Your Agency/Name] to begin the project.
                  </p>

                  <div className="space-y-4 pt-4">
                    <p className="font-semibold">Agreed:</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-muted-foreground">Signature:</label>
                        <div className="border-b border-muted-foreground/30 mt-2 pb-1">_________________________</div>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Name:</label>
                        <div className="border-b border-muted-foreground/30 mt-2 pb-1">_________________________</div>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Company:</label>
                        <div className="border-b border-muted-foreground/30 mt-2 pb-1">_________________________</div>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Date:</label>
                        <div className="border-b border-muted-foreground/30 mt-2 pb-1">_________________________</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="container mx-auto px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Web Design Proposal Tips</h2>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Show You Understand Their Business</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    Don&apos;t just describe what you&apos;ll build—explain why. Connect design decisions to their business goals.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Bad:</p>
                        <p className="text-sm text-muted-foreground">&quot;We&apos;ll design a modern homepage.&quot;</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Good:</p>
                        <p className="text-sm text-muted-foreground">
                          &quot;Your homepage will immediately communicate your value proposition and guide visitors toward requesting a quote—your primary conversion goal.&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Be Specific About Deliverables</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    &quot;Web design&quot; means different things to different people. Define:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Number of pages</li>
                    <li>Number of concepts</li>
                    <li>Number of revision rounds</li>
                    <li>What platforms/browsers</li>
                    <li>What&apos;s included vs. extra</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Address Common Concerns</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">Clients worry about:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[140px]">Going over budget →</span>
                      <span className="text-muted-foreground">Fixed pricing with clear scope</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[140px]">Endless timelines →</span>
                      <span className="text-muted-foreground">Specific milestones with dates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[140px]">Not being able to update →</span>
                      <span className="text-muted-foreground">CMS training included</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium min-w-[140px]">Post-launch problems →</span>
                      <span className="text-muted-foreground">Support period included</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Include Social Proof</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Show similar projects you&apos;ve completed. Case studies with measurable results are best. At minimum, include screenshots and testimonials.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 pb-24">
          <Card className="bg-primary text-primary-foreground max-w-4xl mx-auto">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Create Better Web Design Proposals
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                Stop losing projects to agencies with slicker proposals.
              </p>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                <strong>OpenProposal</strong> helps designers:
              </p>
              <ul className="text-left max-w-md mx-auto mb-8 space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 flex-shrink-0" />
                  <span>Create impressive proposals fast</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 flex-shrink-0" />
                  <span>Get e-signatures instantly</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 flex-shrink-0" />
                  <span>Collect deposits on acceptance</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 flex-shrink-0" />
                  <span>Track client engagement</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 flex-shrink-0" />
                  <span>Win more projects</span>
                </li>
              </ul>
              <Button size="lg" variant="secondary" asChild>
                <Link href="https://sendprop.com">
                  Try OpenProposal Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Last Updated */}
        <section className="container mx-auto px-6 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground italic">Last updated: January 2026</p>
          </div>
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
