import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Consulting Proposal Template: Land High-Ticket Clients [2026]",
  description:
    "A proven consulting proposal template for engagements from $10K to $500K+. Includes strategy for positioning, pricing, and closing.",
  openGraph: {
    title: "Consulting Proposal Template: Land High-Ticket Clients [2026]",
    description:
      "A proven consulting proposal template for engagements from $10K to $500K+. Includes strategy for positioning, pricing, and closing.",
  },
};

export default function ConsultingProposalTemplatePage() {
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
        <div className="container mx-auto px-6 pt-6">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to Blog
          </Link>
        </div>

        {/* Hero */}
        <article className="container mx-auto px-6 py-12 md:py-16 max-w-4xl">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">Consulting</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Consulting Proposal Template: Land High-Ticket Clients [2026]
            </h1>
            <p className="text-xl text-muted-foreground italic">
              A proven consulting proposal template for engagements from $10K to $500K+. Includes strategy for positioning, pricing, and closing.
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            {/* Introduction */}
            <div className="my-8 space-y-4">
              <p className="text-lg">
                Consulting proposals are different from service proposals. You&apos;re not selling deliverables—you&apos;re selling expertise, transformation, and outcomes.
              </p>
              <p className="text-lg">
                This template is designed for management consultants, strategy consultants, business coaches, and advisors landing $10K+ engagements.
              </p>
            </div>

            {/* Template Section */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">Consulting Proposal Template</h2>

              <Card className="my-8 bg-muted/30">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center">
                    <p className="font-bold text-lg">[Your Firm Name/Logo]</p>
                    <h3 className="text-2xl font-bold mt-4">Strategic Consulting Proposal</h3>
                  </div>

                  <div className="space-y-2 pt-4">
                    <p><strong>Prepared for:</strong> [Client Company Name]</p>
                    <p><strong>Prepared by:</strong> [Your Name], [Your Title]</p>
                    <p><strong>Date:</strong> [Date]</p>
                    <p><strong>Proposal Reference:</strong> [#2026-XXX]</p>
                  </div>
                </CardContent>
              </Card>

              {/* Executive Summary */}
              <div className="my-10">
                <h3 className="text-2xl font-bold mb-4">Executive Summary</h3>
                <div className="space-y-4 pl-4 border-l-4 border-primary/30">
                  <p>
                    [Client Company] is facing [specific challenge] that is impacting [revenue/operations/growth]. Based on our assessment, addressing this challenge represents a [$X] opportunity.
                  </p>
                  <p>
                    This proposal outlines a [duration] engagement to [primary objective], resulting in [expected outcome].
                  </p>
                  <div className="mt-4 bg-muted/50 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Engagement Overview:</p>
                    <ul className="list-none space-y-1">
                      <li><strong>Duration:</strong> [X weeks/months]</li>
                      <li><strong>Investment:</strong> $[XXX,XXX]</li>
                      <li><strong>Expected ROI:</strong> [X]x return within [timeframe]</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Situation Analysis */}
              <div className="my-10">
                <h3 className="text-2xl font-bold mb-4">Situation Analysis</h3>

                <h4 className="text-xl font-semibold mb-3">Current State</h4>
                <p className="mb-4">
                  Based on our initial discovery session on [date], [Client Company] is experiencing:
                </p>

                <div className="my-4">
                  <p className="font-semibold mb-2">Key Challenges:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-2">
                    <li>[Challenge 1 with specific impact]</li>
                    <li>[Challenge 2 with specific impact]</li>
                    <li>[Challenge 3 with specific impact]</li>
                  </ol>
                </div>

                <div className="my-4">
                  <p className="font-semibold mb-2">Contributing Factors:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>[Factor 1]</li>
                    <li>[Factor 2]</li>
                    <li>[Factor 3]</li>
                  </ul>
                </div>

                <h4 className="text-xl font-semibold mb-3 mt-6">Impact Assessment</h4>
                <p className="mb-4">These challenges are currently costing [Client Company]:</p>

                <div className="overflow-x-auto my-6">
                  <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 font-medium">Area</th>
                        <th className="text-left py-3 px-4 font-medium">Current Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Revenue</td>
                        <td className="py-3 px-4">-$[X] annually in lost opportunities</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Efficiency</td>
                        <td className="py-3 px-4">[X] hours/week in wasted productivity</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Market Position</td>
                        <td className="py-3 px-4">[Specific competitive disadvantage]</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 className="text-xl font-semibold mb-3 mt-6">Desired Future State</h4>
                <p className="mb-2">By the end of this engagement, [Client Company] will have:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>[Outcome 1]</li>
                  <li>[Outcome 2]</li>
                  <li>[Outcome 3]</li>
                </ul>
              </div>

              {/* Proposed Approach */}
              <div className="my-10">
                <h3 className="text-2xl font-bold mb-4">Proposed Approach</h3>

                <h4 className="text-xl font-semibold mb-3">Methodology</h4>
                <p className="mb-6">We will employ our proven [Framework Name] methodology:</p>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Phase 1: Discovery & Diagnosis (Weeks 1-2)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1 mb-3">
                        <li>Stakeholder interviews ([X] sessions)</li>
                        <li>Data analysis and benchmarking</li>
                        <li>Current state documentation</li>
                        <li>Root cause identification</li>
                      </ul>
                      <p className="text-sm font-semibold text-primary">Deliverable: Diagnostic Report & Findings Presentation</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Phase 2: Strategy Development (Weeks 3-4)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1 mb-3">
                        <li>Solution ideation workshops</li>
                        <li>Option evaluation and prioritization</li>
                        <li>Business case development</li>
                        <li>Implementation roadmap creation</li>
                      </ul>
                      <p className="text-sm font-semibold text-primary">Deliverable: Strategic Recommendations Report</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Phase 3: Implementation Planning (Weeks 5-6)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1 mb-3">
                        <li>Detailed implementation plan</li>
                        <li>Change management strategy</li>
                        <li>Success metrics and KPIs</li>
                        <li>Team alignment sessions</li>
                      </ul>
                      <p className="text-sm font-semibold text-primary">Deliverable: Implementation Playbook</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Phase 4: Execution Support (Weeks 7-12)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1 mb-3">
                        <li>Bi-weekly progress reviews</li>
                        <li>Issue resolution support</li>
                        <li>Team coaching</li>
                        <li>Course correction as needed</li>
                      </ul>
                      <p className="text-sm font-semibold text-primary">Deliverable: Monthly Progress Reports</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Engagement Team */}
              <div className="my-10">
                <h3 className="text-2xl font-bold mb-4">Engagement Team</h3>

                <div className="overflow-x-auto my-6">
                  <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 font-medium">Role</th>
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Responsibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Lead Consultant</td>
                        <td className="py-3 px-4">[Name]</td>
                        <td className="py-3 px-4">Overall engagement leadership, strategy development</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Senior Consultant</td>
                        <td className="py-3 px-4">[Name]</td>
                        <td className="py-3 px-4">Analysis, workshop facilitation, deliverables</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Project Manager</td>
                        <td className="py-3 px-4">[Name]</td>
                        <td className="py-3 px-4">Timeline, coordination, client communication</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground">[Include brief bios or link to team page]</p>
              </div>

              {/* Timeline */}
              <div className="my-10">
                <h3 className="text-2xl font-bold mb-4">Timeline</h3>

                <div className="overflow-x-auto my-6">
                  <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 font-medium">Phase</th>
                        <th className="text-left py-3 px-4 font-medium">Duration</th>
                        <th className="text-left py-3 px-4 font-medium">Key Activities</th>
                        <th className="text-left py-3 px-4 font-medium">Deliverables</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Discovery</td>
                        <td className="py-3 px-4">Weeks 1-2</td>
                        <td className="py-3 px-4">Interviews, analysis</td>
                        <td className="py-3 px-4">Diagnostic Report</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Strategy</td>
                        <td className="py-3 px-4">Weeks 3-4</td>
                        <td className="py-3 px-4">Workshops, planning</td>
                        <td className="py-3 px-4">Strategy Document</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Planning</td>
                        <td className="py-3 px-4">Weeks 5-6</td>
                        <td className="py-3 px-4">Roadmapping</td>
                        <td className="py-3 px-4">Implementation Plan</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Execution</td>
                        <td className="py-3 px-4">Weeks 7-12</td>
                        <td className="py-3 px-4">Implementation support</td>
                        <td className="py-3 px-4">Progress Reports</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Investment */}
              <div className="my-10">
                <h3 className="text-2xl font-bold mb-4">Investment</h3>

                <h4 className="text-xl font-semibold mb-3">Option A: Full Engagement</h4>
                <div className="overflow-x-auto my-6">
                  <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 font-medium">Component</th>
                        <th className="text-left py-3 px-4 font-medium">Description</th>
                        <th className="text-right py-3 px-4 font-medium">Investment</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Discovery & Diagnosis</td>
                        <td className="py-3 px-4">Stakeholder interviews, data analysis</td>
                        <td className="py-3 px-4 text-right">$XX,XXX</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Strategy Development</td>
                        <td className="py-3 px-4">Workshops, recommendations</td>
                        <td className="py-3 px-4 text-right">$XX,XXX</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Implementation Planning</td>
                        <td className="py-3 px-4">Roadmap, change management</td>
                        <td className="py-3 px-4 text-right">$XX,XXX</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Execution Support</td>
                        <td className="py-3 px-4">6 weeks coaching and oversight</td>
                        <td className="py-3 px-4 text-right">$XX,XXX</td>
                      </tr>
                      <tr className="bg-muted/50">
                        <td className="py-3 px-4 font-bold">Total Investment</td>
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4 text-right font-bold">$XXX,XXX</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 className="text-xl font-semibold mb-3 mt-8">Option B: Strategy Only</h4>
                <div className="overflow-x-auto my-6">
                  <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 font-medium">Component</th>
                        <th className="text-left py-3 px-4 font-medium">Description</th>
                        <th className="text-right py-3 px-4 font-medium">Investment</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Discovery & Diagnosis</td>
                        <td className="py-3 px-4">Stakeholder interviews, data analysis</td>
                        <td className="py-3 px-4 text-right">$XX,XXX</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Strategy Development</td>
                        <td className="py-3 px-4">Workshops, recommendations</td>
                        <td className="py-3 px-4 text-right">$XX,XXX</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Implementation Planning</td>
                        <td className="py-3 px-4">High-level roadmap</td>
                        <td className="py-3 px-4 text-right">$XX,XXX</td>
                      </tr>
                      <tr className="bg-muted/50">
                        <td className="py-3 px-4 font-bold">Total Investment</td>
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4 text-right font-bold">$XX,XXX</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  Note: Travel expenses billed at cost. Virtual delivery available at 15% discount.
                </p>

                <h4 className="text-xl font-semibold mb-3 mt-6">Payment Terms</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>40% upon contract signing</li>
                  <li>30% at Phase 2 completion</li>
                  <li>30% upon project completion</li>
                </ul>
              </div>

              {/* Expected Outcomes & ROI */}
              <div className="my-10">
                <h3 className="text-2xl font-bold mb-4">Expected Outcomes & ROI</h3>

                <p className="mb-4">Based on similar engagements, [Client Company] can expect:</p>

                <div className="overflow-x-auto my-6">
                  <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 font-medium">Metric</th>
                        <th className="text-left py-3 px-4 font-medium">Current</th>
                        <th className="text-left py-3 px-4 font-medium">Target</th>
                        <th className="text-right py-3 px-4 font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">[Metric 1]</td>
                        <td className="py-3 px-4">[Current]</td>
                        <td className="py-3 px-4">[Target]</td>
                        <td className="py-3 px-4 text-right">$[Value]</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">[Metric 2]</td>
                        <td className="py-3 px-4">[Current]</td>
                        <td className="py-3 px-4">[Target]</td>
                        <td className="py-3 px-4 text-right">$[Value]</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">[Metric 3]</td>
                        <td className="py-3 px-4">[Current]</td>
                        <td className="py-3 px-4">[Target]</td>
                        <td className="py-3 px-4 text-right">$[Value]</td>
                      </tr>
                      <tr className="bg-muted/50">
                        <td className="py-3 px-4 font-bold">Total Annual Value</td>
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4 text-right font-bold">$[Value]</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg mt-6">
                  <p className="font-semibold mb-2">ROI Calculation:</p>
                  <ul className="list-none space-y-1">
                    <li>Engagement Investment: $[XXX,XXX]</li>
                    <li>Expected Annual Value: $[X,XXX,XXX]</li>
                    <li className="font-bold text-primary">ROI: [X]x return</li>
                    <li className="font-bold text-primary">Payback Period: [X] months</li>
                  </ul>
                </div>
              </div>

              {/* Why Your Firm */}
              <div className="my-10">
                <h3 className="text-2xl font-bold mb-4">Why [Your Firm]</h3>

                <h4 className="text-xl font-semibold mb-3">Relevant Experience</h4>
                <p className="mb-4">We&apos;ve delivered similar results for:</p>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">[Client A] - [Industry]</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-1"><strong>Challenge:</strong> [Similar challenge]</p>
                      <p className="text-sm"><strong>Result:</strong> [Specific, measurable outcome]</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">[Client B] - [Industry]</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-1"><strong>Challenge:</strong> [Similar challenge]</p>
                      <p className="text-sm"><strong>Result:</strong> [Specific, measurable outcome]</p>
                    </CardContent>
                  </Card>
                </div>

                <h4 className="text-xl font-semibold mb-3 mt-6">Our Differentiators</h4>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li><strong>[Differentiator 1]:</strong> [Brief explanation]</li>
                  <li><strong>[Differentiator 2]:</strong> [Brief explanation]</li>
                  <li><strong>[Differentiator 3]:</strong> [Brief explanation]</li>
                </ol>
              </div>

              {/* Assumptions & Dependencies */}
              <div className="my-10">
                <h3 className="text-2xl font-bold mb-4">Assumptions & Dependencies</h3>

                <p className="mb-2">This proposal assumes:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Access to key stakeholders for interviews within first two weeks</li>
                  <li>Availability of relevant data and documentation</li>
                  <li>Executive sponsor participation in key workshops</li>
                  <li>Decision-making within two weeks of recommendations</li>
                </ol>
              </div>

              {/* Terms & Conditions */}
              <div className="my-10">
                <h3 className="text-2xl font-bold mb-4">Terms & Conditions</h3>

                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>This proposal is valid for 30 days</li>
                  <li>Scope changes require written change order</li>
                  <li>Confidentiality maintained per standard NDA</li>
                  <li>IP developed during engagement belongs to [Client/Joint/Consultant]</li>
                </ul>
              </div>

              {/* Next Steps */}
              <div className="my-10">
                <h3 className="text-2xl font-bold mb-4">Next Steps</h3>

                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li><strong>Review & Discussion:</strong> Schedule call to address questions</li>
                  <li><strong>Acceptance:</strong> Sign proposal and return</li>
                  <li><strong>Contract:</strong> Execute formal consulting agreement</li>
                  <li><strong>Kickoff:</strong> Schedule project kickoff within 2 weeks</li>
                </ol>
              </div>

              {/* Acceptance */}
              <div className="my-10">
                <h3 className="text-2xl font-bold mb-4">Acceptance</h3>

                <Card className="bg-muted/30">
                  <CardContent className="p-6">
                    <p className="mb-4">
                      By signing below, [Client Company] accepts this proposal and authorizes [Your Firm] to proceed with the engagement.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold">Client Signature:</p>
                        <div className="border-b border-muted-foreground/30 w-64 mt-1"></div>
                      </div>
                      <div>
                        <p className="font-semibold">Name:</p>
                        <div className="border-b border-muted-foreground/30 w-64 mt-1"></div>
                      </div>
                      <div>
                        <p className="font-semibold">Title:</p>
                        <div className="border-b border-muted-foreground/30 w-64 mt-1"></div>
                      </div>
                      <div>
                        <p className="font-semibold">Date:</p>
                        <div className="border-b border-muted-foreground/30 w-64 mt-1"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Best Practices */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">Consulting Proposal Best Practices</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Start with Business Impact</h3>
                  <p>
                    Notice the proposal leads with financial impact: &quot;$X opportunity&quot; and ROI calculations. C-suite executives think in dollars, not deliverables.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Offer Options (But Not Too Many)</h3>
                  <p className="mb-2">Two pricing options work best:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Full engagement (what you want them to buy)</li>
                    <li>Scaled-down version (gives them control)</li>
                  </ul>
                  <p className="mt-2">Three is okay. More than three creates decision paralysis.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Show Your Methodology</h3>
                  <p>
                    Clients hiring consultants want to know you have a structured approach. Name your methodology—it creates perceived IP and justifies premium pricing.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Build in Checkpoints</h3>
                  <p className="mb-2">Long engagements should have phase gates. This:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Reduces client risk perception</li>
                    <li>Creates natural upsell moments</li>
                    <li>Provides clean exit points if needed</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Include Assumptions</h3>
                  <p>
                    &quot;Assumes access to stakeholders within two weeks&quot; protects you when the client causes delays. It&apos;s professional risk management.
                  </p>
                </div>
              </div>
            </section>

            {/* Pricing Strategies */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">Consulting Pricing Strategies</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Value-Based Pricing</h3>
                  <p className="mb-2">
                    Price based on outcomes, not hours. If you&apos;ll save them $1M, charging $100K is a bargain.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg mt-2">
                    <p className="font-mono text-sm">
                      <strong>Formula:</strong> Expected value to client × 10-20% = your fee
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Tiered Pricing</h3>
                  <p>
                    Offer good/better/best options. Most clients choose the middle, and some trade up.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Retainer Model</h3>
                  <p>
                    For ongoing advisory work: monthly fee for availability + hourly/daily rate for project work.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Success Fees</h3>
                  <p>
                    Base fee + percentage of results achieved. Aligns incentives but requires measurable outcomes.
                  </p>
                </div>
              </div>
            </section>

            {/* Common Mistakes */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">Common Consulting Proposal Mistakes</h2>

              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl font-bold text-red-500">1</span>
                      <div>
                        <h3 className="font-semibold mb-1">No ROI case</h3>
                        <p className="text-sm text-muted-foreground">
                          If you can&apos;t show the math, you&apos;ll compete on price
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl font-bold text-red-500">2</span>
                      <div>
                        <h3 className="font-semibold mb-1">Too much about you</h3>
                        <p className="text-sm text-muted-foreground">
                          The first half should be about their situation
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl font-bold text-red-500">3</span>
                      <div>
                        <h3 className="font-semibold mb-1">Vague deliverables</h3>
                        <p className="text-sm text-muted-foreground">
                          &quot;Strategic guidance&quot; means nothing; &quot;Strategy document with implementation roadmap&quot; means something
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl font-bold text-red-500">4</span>
                      <div>
                        <h3 className="font-semibold mb-1">No urgency</h3>
                        <p className="text-sm text-muted-foreground">
                          Include expiration date and context about why acting now matters
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl font-bold text-red-500">5</span>
                      <div>
                        <h3 className="font-semibold mb-1">Buried pricing</h3>
                        <p className="text-sm text-muted-foreground">
                          Decision-makers flip to price first; make it easy to find
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* CTA Section */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">Create Professional Consulting Proposals</h2>

              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-8">
                  <p className="text-lg mb-4">Stop sending Word docs that look like everyone else&apos;s.</p>

                  <div className="mb-6">
                    <p className="font-semibold mb-2">OpenProposal helps consultants:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>Create impressive proposals fast</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>Track client engagement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>Get e-signatures</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>Collect deposits immediately</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>No per-seat pricing (great for small firms)</span>
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

            {/* Last Updated */}
            <div className="text-sm text-muted-foreground italic text-center my-8">
              Last updated: January 2026
            </div>
          </div>
        </article>
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
