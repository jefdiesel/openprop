import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle, Target, TrendingUp, Users, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Marketing Proposal Template: Win Agency Clients [Free Template] - OpenProposal",
  description:
    "A marketing proposal template designed for agencies and consultants pitching digital marketing, SEO, PPC, social media, and content marketing services.",
  openGraph: {
    title: "Marketing Proposal Template: Win Agency Clients [Free Template]",
    description:
      "Professional marketing proposal template for agencies. Win more retainers with data-driven proposals focused on business outcomes.",
  },
};

export default function MarketingProposalTemplatePage() {
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
        {/* Breadcrumb */}
        <div className="container px-6 pt-6">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to blog
          </Link>
        </div>

        {/* Hero */}
        <article className="container px-6 py-12 max-w-4xl">
          <div className="mb-6">
            <Badge className="mb-4">Marketing Templates</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Marketing Proposal Template: Win Agency Clients
            </h1>
            <p className="text-xl text-muted-foreground">
              A marketing proposal template designed for agencies and consultants pitching digital marketing,
              SEO, PPC, social media, and content marketing services.
            </p>
          </div>

          <div className="border-t border-b py-6 my-8">
            <p className="text-muted-foreground italic">
              Last updated: January 2026
            </p>
          </div>

          {/* Introduction */}
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-lg">
              Marketing proposals require a different approach than other service proposals. You&apos;re not just
              selling deliverables—you&apos;re selling growth.
            </p>
            <p className="text-lg">
              This template helps marketing agencies and consultants win retainers and project work by focusing
              on business outcomes, not just tactics.
            </p>
          </div>

          {/* Template Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Marketing Proposal Template</h2>

            <Card className="mb-8">
              <CardHeader className="bg-muted/50">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">[Your Agency Logo]</p>
                  <CardTitle className="text-2xl">Marketing Proposal</CardTitle>
                  <div className="text-sm space-y-1">
                    <p><strong>Prepared for:</strong> [Client Company]</p>
                    <p><strong>Prepared by:</strong> [Your Name], [Your Agency]</p>
                    <p><strong>Date:</strong> [Date]</p>
                    <p><strong>Valid for:</strong> 21 days</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Executive Summary */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Executive Summary</h3>
              <Card>
                <CardContent className="pt-6">
                  <p className="mb-4">
                    <strong>[Client Company]</strong> is looking to [primary marketing goal: generate more leads,
                    increase brand awareness, drive e-commerce sales, etc.].
                  </p>
                  <p className="mb-4">
                    After reviewing your current marketing presence and discussing your goals, we&apos;ve identified
                    significant opportunities to improve your [key metric: lead volume, conversion rate, traffic, etc.].
                  </p>
                  <p className="mb-6 font-semibold">
                    This proposal outlines a [timeframe] marketing engagement designed to [specific outcome].
                  </p>
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Projected Results:</p>
                    <ul className="space-y-1 list-none">
                      <li>• [Key metric 1]: [Current] → [Target]</li>
                      <li>• [Key metric 2]: [Current] → [Target]</li>
                      <li>• <strong>Investment:</strong> $[X,XXX]/month</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Situation */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Current Situation</h3>

              <h4 className="text-xl font-semibold mb-4">Marketing Audit Summary</h4>
              <p className="mb-4">We analyzed your current marketing presence:</p>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Website & SEO</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• Current organic traffic: [X] visitors/month</p>
                    <p>• Domain authority: [X]</p>
                    <p>• Key ranking positions: [summary]</p>
                    <p>• Technical issues identified: [X]</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Paid Advertising</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• Current ad spend: $[X]/month</p>
                    <p>• Cost per lead/acquisition: $[X]</p>
                    <p>• ROAS: [X]</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Social Media</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• Followers: [X] across platforms</p>
                    <p>• Engagement rate: [X]%</p>
                    <p>• Posting frequency: [X]/week</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Content Marketing</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• Blog posts: [X]/month</p>
                    <p>• Email list size: [X]</p>
                    <p>• Email open rate: [X]%</p>
                  </CardContent>
                </Card>
              </div>

              <h4 className="text-xl font-semibold mb-4">Opportunities Identified</h4>
              <div className="space-y-4 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-semibold mb-2">1. [Opportunity 1]: [Specific improvement possible]</p>
                    <p className="text-sm text-muted-foreground">Potential impact: [quantified benefit]</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-semibold mb-2">2. [Opportunity 2]: [Specific improvement possible]</p>
                    <p className="text-sm text-muted-foreground">Potential impact: [quantified benefit]</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-semibold mb-2">3. [Opportunity 3]: [Specific improvement possible]</p>
                    <p className="text-sm text-muted-foreground">Potential impact: [quantified benefit]</p>
                  </CardContent>
                </Card>
              </div>

              <h4 className="text-xl font-semibold mb-4">Competitive Analysis</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Metric</th>
                      <th className="text-center py-3 px-4 font-medium">You</th>
                      <th className="text-center py-3 px-4 font-medium">Competitor A</th>
                      <th className="text-center py-3 px-4 font-medium">Competitor B</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Domain Authority</td>
                      <td className="text-center py-3 px-4">[X]</td>
                      <td className="text-center py-3 px-4">[X]</td>
                      <td className="text-center py-3 px-4">[X]</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Monthly Traffic</td>
                      <td className="text-center py-3 px-4">[X]</td>
                      <td className="text-center py-3 px-4">[X]</td>
                      <td className="text-center py-3 px-4">[X]</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Social Following</td>
                      <td className="text-center py-3 px-4">[X]</td>
                      <td className="text-center py-3 px-4">[X]</td>
                      <td className="text-center py-3 px-4">[X]</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Content Volume</td>
                      <td className="text-center py-3 px-4">[X]/mo</td>
                      <td className="text-center py-3 px-4">[X]/mo</td>
                      <td className="text-center py-3 px-4">[X]/mo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm"><strong>Gap:</strong> [Summary of competitive gap and opportunity]</p>
            </div>

            {/* Proposed Strategy */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Proposed Strategy</h3>

              <h4 className="text-xl font-semibold mb-4">Goals & KPIs</h4>
              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Goal</th>
                      <th className="text-center py-3 px-4 font-medium">Current</th>
                      <th className="text-center py-3 px-4 font-medium">Target</th>
                      <th className="text-center py-3 px-4 font-medium">Timeframe</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">[Goal 1: e.g., Monthly leads]</td>
                      <td className="text-center py-3 px-4">[X]</td>
                      <td className="text-center py-3 px-4">[X]</td>
                      <td className="text-center py-3 px-4">[X months]</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">[Goal 2: e.g., Organic traffic]</td>
                      <td className="text-center py-3 px-4">[X]</td>
                      <td className="text-center py-3 px-4">[X]</td>
                      <td className="text-center py-3 px-4">[X months]</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">[Goal 3: e.g., Conversion rate]</td>
                      <td className="text-center py-3 px-4">[X]%</td>
                      <td className="text-center py-3 px-4">[X]%</td>
                      <td className="text-center py-3 px-4">[X months]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="text-xl font-semibold mb-4">Strategic Approach</h4>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Phase 1: Foundation</CardTitle>
                    <p className="text-sm text-muted-foreground">Month 1</p>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• Complete marketing audit</p>
                    <p>• Set up tracking and analytics</p>
                    <p>• Develop content strategy</p>
                    <p>• Create campaign frameworks</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Phase 2: Execution</CardTitle>
                    <p className="text-sm text-muted-foreground">Months 2-3</p>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• Launch priority campaigns</p>
                    <p>• Begin content production</p>
                    <p>• Implement SEO improvements</p>
                    <p>• Start paid advertising</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Phase 3: Optimization</CardTitle>
                    <p className="text-sm text-muted-foreground">Months 4-6</p>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• Analyze performance data</p>
                    <p>• A/B test and optimize</p>
                    <p>• Scale winning campaigns</p>
                    <p>• Refine targeting and messaging</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Scope of Work */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Scope of Work</h3>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h5 className="font-semibold mb-2">Monthly Deliverables:</h5>
                    <ul className="space-y-1 mb-4 text-sm">
                      <li>• Technical SEO audit and fixes</li>
                      <li>• [X] keyword-optimized pages/posts</li>
                      <li>• [X] backlinks acquired</li>
                      <li>• Monthly ranking report</li>
                    </ul>
                    <h5 className="font-semibold mb-2">Activities:</h5>
                    <ul className="space-y-1 text-sm">
                      <li>• On-page optimization</li>
                      <li>• Content gap analysis</li>
                      <li>• Link building outreach</li>
                      <li>• Local SEO (if applicable)</li>
                      <li>• Monthly strategy calls</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Marketing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h5 className="font-semibold mb-2">Monthly Deliverables:</h5>
                    <ul className="space-y-1 mb-4 text-sm">
                      <li>• [X] blog posts ([X] words each)</li>
                      <li>• [X] social media posts</li>
                      <li>• [X] email newsletters</li>
                      <li>• Content calendar</li>
                    </ul>
                    <h5 className="font-semibold mb-2">Activities:</h5>
                    <ul className="space-y-1 text-sm">
                      <li>• Content strategy</li>
                      <li>• Topic research</li>
                      <li>• Writing and editing</li>
                      <li>• Distribution and promotion</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Paid Advertising</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h5 className="font-semibold mb-2">Monthly Deliverables:</h5>
                    <ul className="space-y-1 mb-4 text-sm">
                      <li>• Campaign management</li>
                      <li>• Ad creative ([X] variations)</li>
                      <li>• Audience testing</li>
                      <li>• Performance reporting</li>
                    </ul>
                    <h5 className="font-semibold mb-2">Platforms:</h5>
                    <ul className="space-y-1 mb-4 text-sm">
                      <li>• Google Ads</li>
                      <li>• Facebook/Instagram Ads</li>
                      <li>• LinkedIn Ads</li>
                      <li>• [Other]</li>
                    </ul>
                    <h5 className="font-semibold mb-2">Budget Management:</h5>
                    <ul className="space-y-1 text-sm">
                      <li>• Your ad spend: $[X]/month (paid directly to platforms)</li>
                      <li>• Our management fee: $[X]/month</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h5 className="font-semibold mb-2">Monthly Deliverables:</h5>
                    <ul className="space-y-1 mb-4 text-sm">
                      <li>• [X] posts per week per platform</li>
                      <li>• Community management</li>
                      <li>• Monthly analytics report</li>
                    </ul>
                    <h5 className="font-semibold mb-2">Platforms Included:</h5>
                    <ul className="space-y-1 text-sm">
                      <li>• Instagram</li>
                      <li>• LinkedIn</li>
                      <li>• Facebook</li>
                      <li>• Twitter/X</li>
                      <li>• [Other]</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Reporting & Communication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      <li>• Monthly performance report</li>
                      <li>• Monthly strategy call (60 min)</li>
                      <li>• Slack/email access for questions</li>
                      <li>• Quarterly strategy review</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Investment */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Investment</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-semibold mb-4">Option A: Full-Service Marketing</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-3 px-4 font-medium">Service</th>
                          <th className="text-right py-3 px-4 font-medium">Monthly Investment</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4">SEO</td>
                          <td className="text-right py-3 px-4">$X,XXX</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Content Marketing</td>
                          <td className="text-right py-3 px-4">$X,XXX</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Paid Media Management</td>
                          <td className="text-right py-3 px-4">$X,XXX</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Social Media</td>
                          <td className="text-right py-3 px-4">$X,XXX</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Strategy & Reporting</td>
                          <td className="text-right py-3 px-4">$X,XXX</td>
                        </tr>
                        <tr className="bg-primary/5">
                          <td className="py-3 px-4 font-bold">Total</td>
                          <td className="text-right py-3 px-4 font-bold">$X,XXX/month</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 italic">Recommended minimum commitment: 6 months</p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold mb-4">Option B: Growth Package</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-3 px-4 font-medium">Service</th>
                          <th className="text-right py-3 px-4 font-medium">Monthly Investment</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4">SEO</td>
                          <td className="text-right py-3 px-4">$X,XXX</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Content Marketing</td>
                          <td className="text-right py-3 px-4">$X,XXX</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Strategy & Reporting</td>
                          <td className="text-right py-3 px-4">$XXX</td>
                        </tr>
                        <tr className="bg-primary/5">
                          <td className="py-3 px-4 font-bold">Total</td>
                          <td className="text-right py-3 px-4 font-bold">$X,XXX/month</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-semibold mb-4">Option C: Starter Package</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-3 px-4 font-medium">Service</th>
                          <th className="text-right py-3 px-4 font-medium">Monthly Investment</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4">SEO</td>
                          <td className="text-right py-3 px-4">$X,XXX</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Strategy & Reporting</td>
                          <td className="text-right py-3 px-4">$XXX</td>
                        </tr>
                        <tr className="bg-primary/5">
                          <td className="py-3 px-4 font-bold">Total</td>
                          <td className="text-right py-3 px-4 font-bold">$X,XXX/month</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-semibold mb-4">Additional Costs</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-3 px-4 font-medium">Item</th>
                          <th className="text-right py-3 px-4 font-medium">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4">Ad spend (paid to platforms)</td>
                          <td className="text-right py-3 px-4">Client&apos;s budget</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Stock photography</td>
                          <td className="text-right py-3 px-4">~$XXX/month</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4">Marketing tools (if needed)</td>
                          <td className="text-right py-3 px-4">Varies</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline & Milestones */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Timeline & Milestones</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Month 1: Setup</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• Complete onboarding</p>
                    <p>• Finalize strategy</p>
                    <p>• Set up tracking</p>
                    <p>• Begin content production</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Month 2: Launch</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• Launch campaigns</p>
                    <p>• Publish first content</p>
                    <p>• Begin link building</p>
                    <p>• First performance report</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Month 3: Optimize</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• Analyze initial data</p>
                    <p>• Optimize campaigns</p>
                    <p>• Refine strategy</p>
                    <p>• Quarterly review</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ongoing</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• Monthly reporting</p>
                    <p>• Continuous optimization</p>
                    <p>• Strategy adjustments</p>
                    <p>• Quarterly business reviews</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Expected Results */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Expected Results</h3>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Month 1-3 (Foundation)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• Technical issues resolved</p>
                    <p>• Tracking implemented</p>
                    <p>• Content engine running</p>
                    <p>• Initial campaign data</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Month 4-6 (Growth)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• [X]% increase in organic traffic</p>
                    <p>• [X]% improvement in lead quality</p>
                    <p>• [X] ranking improvements</p>
                    <p>• Clear performance trends</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Month 7-12 (Scale)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• [X]% increase in leads/revenue</p>
                    <p>• Established market presence</p>
                    <p>• Optimized cost per acquisition</p>
                    <p>• Predictable marketing ROI</p>
                  </CardContent>
                </Card>
              </div>

              <p className="text-sm text-muted-foreground mt-4 italic">
                <strong>Disclaimer:</strong> Results vary based on market conditions, competition, and starting point.
                These projections are based on similar client engagements.
              </p>
            </div>

            {/* Why Your Agency */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Why [Your Agency]</h3>

              <h4 className="text-xl font-semibold mb-4">Our Process</h4>
              <p className="mb-4">We follow a data-driven approach:</p>

              <div className="space-y-3 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-semibold">1. Research</p>
                    <p className="text-sm text-muted-foreground">
                      Deep dive into your market, competitors, and audience
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-semibold">2. Strategy</p>
                    <p className="text-sm text-muted-foreground">
                      Custom plan aligned to your business goals
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-semibold">3. Execute</p>
                    <p className="text-sm text-muted-foreground">
                      Systematic implementation with clear milestones
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-semibold">4. Measure</p>
                    <p className="text-sm text-muted-foreground">
                      Track everything, report transparently
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-semibold">5. Optimize</p>
                    <p className="text-sm text-muted-foreground">
                      Continuous improvement based on data
                    </p>
                  </CardContent>
                </Card>
              </div>

              <h4 className="text-xl font-semibold mb-4">Relevant Experience</h4>
              <div className="space-y-4 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-semibold mb-2">[Case Study 1]</p>
                    <p className="text-sm">• Client: [Industry/Company type]</p>
                    <p className="text-sm">• Challenge: [Similar to this prospect]</p>
                    <p className="text-sm">• Results: [Specific metrics achieved]</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-semibold mb-2">[Case Study 2]</p>
                    <p className="text-sm">• Client: [Industry/Company type]</p>
                    <p className="text-sm">• Challenge: [Similar to this prospect]</p>
                    <p className="text-sm">• Results: [Specific metrics achieved]</p>
                  </CardContent>
                </Card>
              </div>

              <h4 className="text-xl font-semibold mb-4">The Team</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Role</th>
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Experience</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Account Director</td>
                      <td className="py-3 px-4">[Name]</td>
                      <td className="py-3 px-4">[X] years, [specialty]</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">SEO Specialist</td>
                      <td className="py-3 px-4">[Name]</td>
                      <td className="py-3 px-4">[X] years, [specialty]</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Content Manager</td>
                      <td className="py-3 px-4">[Name]</td>
                      <td className="py-3 px-4">[X] years, [specialty]</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Paid Media</td>
                      <td className="py-3 px-4">[Name]</td>
                      <td className="py-3 px-4">[X] years, [specialty]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Terms & Conditions</h3>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contract Terms</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• Minimum commitment: [X] months</p>
                    <p>• Notice period: 30 days written notice</p>
                    <p>• Billing: Monthly, due on [1st/15th]</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What We Need From You</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• Access to analytics and ad accounts</p>
                    <p>• Brand guidelines and assets</p>
                    <p>• Timely feedback on content/creative</p>
                    <p>• Access to key stakeholders</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What&apos;s Not Included</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>• Ad spend (paid directly to platforms)</p>
                    <p>• Website development/changes (can quote separately)</p>
                    <p>• Photography/video production</p>
                    <p>• Event marketing</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Next Steps</h3>

              <Card>
                <CardContent className="pt-6">
                  <ol className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      <span><strong>Review</strong> this proposal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      <span><strong>Call</strong> to discuss questions: [Schedule link]</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">3.</span>
                      <span><strong>Sign</strong> below to accept</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">4.</span>
                      <span><strong>Pay</strong> first month to begin</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">5.</span>
                      <span><strong>Kickoff</strong> call scheduled within 1 week</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>

            {/* Acceptance */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">Acceptance</h3>

              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <p className="mb-6">
                    By signing below, you accept this proposal and agree to begin the engagement.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold mb-1">Agreed:</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Signature:</p>
                      <div className="border-b border-foreground/20 w-full h-8"></div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Name:</p>
                      <div className="border-b border-foreground/20 w-full h-8"></div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Title:</p>
                      <div className="border-b border-foreground/20 w-full h-8"></div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date:</p>
                      <div className="border-b border-foreground/20 w-full h-8"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Marketing Proposal Tips */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Marketing Proposal Tips</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Lead with Business Goals, Not Tactics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Clients don&apos;t want &quot;SEO&quot;—they want more customers. Frame everything in terms of
                    business outcomes.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="text-red-600">
                      <strong>Bad:</strong> &quot;We&apos;ll optimize your meta descriptions.&quot;
                    </p>
                    <p className="text-green-600">
                      <strong>Good:</strong> &quot;We&apos;ll improve your search rankings to generate an
                      additional 50 leads per month.&quot;
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Show You&apos;ve Done Your Homework
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Include specific observations about their current marketing. This shows you&apos;ve invested
                    time and understand their situation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Be Transparent About Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Marketing takes time. Set realistic expectations:</p>
                  <ul className="space-y-1 text-sm">
                    <li>• SEO: 4-6 months for meaningful results</li>
                    <li>• Content: 3-4 months to build momentum</li>
                    <li>• Paid: Can see initial data in weeks, optimization ongoing</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Include Caveats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Results depend on many factors. Protect yourself with appropriate disclaimers while still
                    projecting confidence.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="mb-16">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="py-12 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Create Marketing Proposals That Win
                </h2>
                <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto text-lg">
                  Stop sending generic decks that look like everyone else&apos;s.
                </p>
                <div className="mb-8">
                  <p className="text-primary-foreground/90 mb-4">
                    <strong>OpenProposal</strong> helps marketing agencies:
                  </p>
                  <ul className="inline-block text-left space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Create custom proposals fast</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Track when clients view them</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Get e-signatures</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Collect retainer payments</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Win more clients</span>
                    </li>
                  </ul>
                </div>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="https://sendprop.com">
                    Try OpenProposal Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} OpenProposal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
