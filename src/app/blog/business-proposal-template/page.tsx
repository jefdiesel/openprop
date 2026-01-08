import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Download, Clock, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Business Proposal Template: Free Download + Complete Guide",
  description:
    "A professional business proposal template you can customize in minutes, plus everything you need to know to win more deals.",
  openGraph: {
    title: "Business Proposal Template: Free Download + Complete Guide",
    description:
      "A professional business proposal template you can customize in minutes, plus everything you need to know to win more deals.",
  },
};

export default function BusinessProposalTemplatePage() {
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
            Back to blog
          </Link>
        </div>

        {/* Hero */}
        <article className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              Templates & Guides
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Business Proposal Template: Free Download + Complete Guide
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              A professional business proposal template you can customize in minutes, plus everything you need to know to win more deals.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>12 min read</span>
              </div>
              <div>
                <span>Last updated: January 2026</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 space-y-8">
            {/* Introduction */}
            <div className="prose prose-lg max-w-none">
              <p>
                Writing a business proposal shouldn&apos;t take hours. Yet most professionals spend 3-5 hours crafting each proposal from scratch—time that could be spent actually doing the work.
              </p>
              <p>
                This guide gives you a ready-to-use business proposal template, plus the strategy behind proposals that actually close deals.
              </p>
            </div>

            {/* Free Template Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Free Business Proposal Template</h2>
              <p className="text-muted-foreground mb-6">
                Here&apos;s a complete business proposal structure you can copy and customize:
              </p>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="border-b pb-4">
                      <p className="font-semibold text-sm text-muted-foreground mb-2">[Your Company Logo]</p>
                      <h3 className="text-2xl font-bold mb-4">Business Proposal</h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>Prepared for:</strong> [Client Name]</p>
                        <p><strong>Prepared by:</strong> [Your Name], [Your Company]</p>
                        <p><strong>Date:</strong> [Date]</p>
                        <p><strong>Valid until:</strong> [Date + 30 days]</p>
                      </div>
                    </div>

                    <div className="border-b pb-4">
                      <h4 className="text-xl font-semibold mb-3">Executive Summary</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        [2-3 sentences describing the client&apos;s challenge and your proposed solution. This is the most important section—many decision-makers read only this.]
                      </p>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="font-semibold mb-2">Project Overview:</p>
                        <ul className="space-y-1 text-sm">
                          <li><strong>Objective:</strong> [What you&apos;ll accomplish]</li>
                          <li><strong>Timeline:</strong> [Start to finish]</li>
                          <li><strong>Investment:</strong> [Total cost]</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-b pb-4">
                      <h4 className="text-xl font-semibold mb-3">Understanding Your Needs</h4>
                      <p className="text-sm mb-3">Based on our conversation on [date], you&apos;re looking to:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm mb-4">
                        <li>[Primary goal]</li>
                        <li>[Secondary goal]</li>
                        <li>[Tertiary goal]</li>
                      </ol>
                      <p className="font-semibold text-sm mb-2">Current Challenges:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>[Challenge 1]</li>
                        <li>[Challenge 2]</li>
                        <li>[Challenge 3]</li>
                      </ul>
                    </div>

                    <div className="border-b pb-4">
                      <h4 className="text-xl font-semibold mb-3">Proposed Solution</h4>

                      <div className="space-y-4">
                        <div>
                          <h5 className="font-semibold mb-2">Phase 1: [Name] — [Timeline]</h5>
                          <p className="text-sm text-muted-foreground mb-2">[Description of what you&apos;ll deliver]</p>
                          <p className="text-sm font-semibold mb-1">Deliverables:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>[Deliverable 1]</li>
                            <li>[Deliverable 2]</li>
                            <li>[Deliverable 3]</li>
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-semibold mb-2">Phase 2: [Name] — [Timeline]</h5>
                          <p className="text-sm text-muted-foreground mb-2">[Description of what you&apos;ll deliver]</p>
                          <p className="text-sm font-semibold mb-1">Deliverables:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>[Deliverable 1]</li>
                            <li>[Deliverable 2]</li>
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-semibold mb-2">Phase 3: [Name] — [Timeline]</h5>
                          <p className="text-sm text-muted-foreground mb-2">[Description of what you&apos;ll deliver]</p>
                          <p className="text-sm font-semibold mb-1">Deliverables:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>[Deliverable 1]</li>
                            <li>[Deliverable 2]</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-b pb-4">
                      <h4 className="text-xl font-semibold mb-3">Investment</h4>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2 text-sm font-medium">Item</th>
                              <th className="text-left py-2 px-2 text-sm font-medium">Description</th>
                              <th className="text-right py-2 px-2 text-sm font-medium">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2 px-2 text-sm">[Service 1]</td>
                              <td className="py-2 px-2 text-sm text-muted-foreground">[Brief description]</td>
                              <td className="text-right py-2 px-2 text-sm">$X,XXX</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 px-2 text-sm">[Service 2]</td>
                              <td className="py-2 px-2 text-sm text-muted-foreground">[Brief description]</td>
                              <td className="text-right py-2 px-2 text-sm">$X,XXX</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 px-2 text-sm">[Service 3]</td>
                              <td className="py-2 px-2 text-sm text-muted-foreground">[Brief description]</td>
                              <td className="text-right py-2 px-2 text-sm">$X,XXX</td>
                            </tr>
                            <tr className="font-semibold">
                              <td className="py-2 px-2 text-sm">Total</td>
                              <td className="py-2 px-2 text-sm"></td>
                              <td className="text-right py-2 px-2 text-sm">$X,XXX</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-sm font-semibold mb-2">Payment Terms:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>50% deposit upon acceptance</li>
                        <li>50% upon completion</li>
                        <li>Payment due within 14 days of invoice</li>
                      </ul>
                    </div>

                    <div className="border-b pb-4">
                      <h4 className="text-xl font-semibold mb-3">Timeline</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2 text-sm font-medium">Milestone</th>
                              <th className="text-right py-2 px-2 text-sm font-medium">Target Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2 px-2 text-sm">Project kickoff</td>
                              <td className="text-right py-2 px-2 text-sm">[Date]</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 px-2 text-sm">[Phase 1 complete]</td>
                              <td className="text-right py-2 px-2 text-sm">[Date]</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 px-2 text-sm">[Phase 2 complete]</td>
                              <td className="text-right py-2 px-2 text-sm">[Date]</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-2 text-sm">Final delivery</td>
                              <td className="text-right py-2 px-2 text-sm">[Date]</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="border-b pb-4">
                      <h4 className="text-xl font-semibold mb-3">Why Work With Us</h4>
                      <p className="text-sm mb-3">
                        <strong>[Your Company]</strong> has helped [X] clients achieve [specific result].
                      </p>
                      <p className="font-semibold text-sm mb-2">Recent Results:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>[Client A]: [Specific measurable outcome]</li>
                        <li>[Client B]: [Specific measurable outcome]</li>
                        <li>[Client C]: [Specific measurable outcome]</li>
                      </ul>
                    </div>

                    <div className="border-b pb-4">
                      <h4 className="text-xl font-semibold mb-3">Next Steps</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Review this proposal</li>
                        <li>Sign below to accept</li>
                        <li>Submit deposit payment</li>
                        <li>We&apos;ll schedule our kickoff call within 48 hours</li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-3">Acceptance</h4>
                      <p className="text-sm mb-4">
                        By signing below, you agree to the scope, timeline, and investment outlined in this proposal.
                      </p>
                      <div className="space-y-2 text-sm">
                        <p><strong>Client Signature:</strong> ________________________</p>
                        <p><strong>Name:</strong> ________________________</p>
                        <p><strong>Date:</strong> ________________________</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* What Makes a Business Proposal Effective */}
            <section>
              <h2 className="text-3xl font-bold mb-6">What Makes a Business Proposal Effective</h2>
              <p className="text-muted-foreground mb-6">
                A business proposal isn&apos;t just a price quote—it&apos;s a sales document. The best proposals:
              </p>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      1. Lead with the Client&apos;s Problem
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">
                      Don&apos;t start with your company history. Start with what the client told you they need. This shows you listened and understand their situation.
                    </p>
                    <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-4">
                      <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">Bad opening:</p>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        &quot;ABC Company was founded in 2015 and has served over 500 clients...&quot;
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 p-4">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">Good opening:</p>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        &quot;You mentioned that your current website converts at 1.2%, well below the industry average of 3.5%. This proposal outlines how we&apos;ll close that gap.&quot;
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      2. Make the ROI Obvious
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">
                      Clients don&apos;t buy services—they buy outcomes. Connect your price to the value they&apos;ll receive.
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-2">Example:</p>
                      <p className="text-sm">
                        &quot;At $5,000, this project costs less than the revenue you lose each month from your current 1.2% conversion rate. Based on your traffic, a 1% improvement equals approximately $8,000/month in additional revenue.&quot;
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      3. Remove Decision Friction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">
                      The easier you make it to say yes, the more yeses you&apos;ll get:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Include clear payment terms</li>
                      <li>Add a signature line (or better, use e-signatures)</li>
                      <li>Set an expiration date to create urgency</li>
                      <li>Offer a payment option (deposit + milestone payments)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      4. Keep It Scannable
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">
                      Decision-makers are busy. Use:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm mb-3">
                      <li>Headers and subheaders</li>
                      <li>Bullet points</li>
                      <li>Tables for pricing</li>
                      <li>Bold text for key points</li>
                      <li>White space</li>
                    </ul>
                    <p className="text-sm font-semibold">
                      If someone can&apos;t understand your proposal in 60 seconds of skimming, it&apos;s too complex.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Business Proposal Mistakes to Avoid */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Business Proposal Mistakes to Avoid</h2>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mistake 1: Making It About You</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Your &quot;About Us&quot; section should be 10% of the proposal, max. The client cares about their problem, not your origin story.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mistake 2: Vague Scope</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">
                      &quot;We&apos;ll redesign your website&quot; means different things to different people. Be specific:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm mb-3">
                      <li>How many pages?</li>
                      <li>How many revision rounds?</li>
                      <li>What&apos;s included vs. extra?</li>
                    </ul>
                    <p className="text-sm">
                      Vague scope leads to scope creep, disputes, and unhappy clients.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mistake 3: Burying the Price</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Don&apos;t make clients hunt for the number. If they can&apos;t find it quickly, they&apos;ll assume you&apos;re hiding something.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mistake 4: No Expiration Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Proposals without deadlines sit in inboxes forever. A 14-30 day validity period creates healthy urgency.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mistake 5: Sending a PDF and Hoping</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">
                      The best proposals are interactive:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Track when they&apos;re opened</li>
                      <li>Allow digital signatures</li>
                      <li>Include payment links</li>
                      <li>Send automatic reminders</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* How to Send Your Business Proposal */}
            <section>
              <h2 className="text-3xl font-bold mb-6">How to Send Your Business Proposal</h2>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Option 1: Email + PDF Attachment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2"><strong>Pros:</strong> Simple, universally compatible</p>
                    <p className="text-sm"><strong>Cons:</strong> No tracking, easy to ignore, requires printing to sign</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Option 2: Proposal Software</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3"><strong>Pros:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-sm mb-3">
                      <li>Know when proposals are opened</li>
                      <li>Digital signatures</li>
                      <li>Built-in payment collection</li>
                      <li>Professional templates</li>
                      <li>Automatic reminders</li>
                    </ul>
                    <p className="text-sm"><strong>Cons:</strong> Monthly cost (though many have free tiers)</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Option 3: Google Docs/Word Link</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2"><strong>Pros:</strong> Free, easy to edit</p>
                    <p className="text-sm"><strong>Cons:</strong> Looks unprofessional, no signatures, no tracking</p>
                  </CardContent>
                </Card>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">
                    For serious businesses, proposal software pays for itself. Knowing when a client opens your proposal (so you can follow up at the right time) alone is worth the investment.
                  </p>
                </div>
              </div>
            </section>

            {/* Business Proposal Template Variations */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Business Proposal Template Variations</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">For Service Businesses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">Focus on:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Clear deliverables</li>
                      <li>Timeline with milestones</li>
                      <li>Your process (builds confidence)</li>
                      <li>Case studies from similar clients</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">For Product Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">Focus on:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Product specifications</li>
                      <li>Quantity pricing/discounts</li>
                      <li>Delivery timeline</li>
                      <li>Warranty/support terms</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">For Consulting Engagements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">Focus on:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Problem diagnosis</li>
                      <li>Methodology</li>
                      <li>Expected outcomes</li>
                      <li>Ongoing support options</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">For Agency Pitches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">Focus on:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Creative concepts</li>
                      <li>Strategy rationale</li>
                      <li>Team bios</li>
                      <li>Relevant portfolio pieces</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Proposal Follow-Up Strategy */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Proposal Follow-Up Strategy</h2>
              <p className="text-muted-foreground mb-6">
                Sending the proposal is half the battle. Here&apos;s how to close:
              </p>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Day 1: Send + Confirm Receipt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm italic">
                      &quot;Hi [Name], I just sent over the proposal we discussed. Let me know if you have any questions—happy to jump on a quick call to walk through it.&quot;
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Day 3: Check In</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm italic">
                      &quot;Hi [Name], wanted to make sure the proposal came through okay. Any questions I can answer?&quot;
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Day 7: Add Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm italic">
                      &quot;Hi [Name], I came across [relevant article/resource] and thought of your project. Still happy to discuss the proposal whenever you&apos;re ready.&quot;
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Day 14: Create Urgency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm italic">
                      &quot;Hi [Name], just a heads up that the proposal pricing is valid until [date]. Let me know if you&apos;d like to move forward or if anything&apos;s holding you back.&quot;
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* CTA Section */}
            <section>
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="py-12 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Create Professional Proposals in Minutes
                  </h2>
                  <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                    Stop spending hours formatting proposals in Word.
                  </p>
                  <div className="mb-6">
                    <p className="text-primary-foreground/90 mb-2"><strong>OpenProposal</strong> lets you:</p>
                    <ul className="text-left inline-block text-primary-foreground/90 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Create beautiful proposals with drag-and-drop
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Get legally binding e-signatures
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Collect payments via Stripe
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Track when proposals are opened
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Send automatic follow-ups
                      </li>
                    </ul>
                  </div>
                  <p className="text-primary-foreground/90 mb-6">
                    No per-seat pricing. Unlimited users on all plans.
                  </p>
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="https://sendprop.com">
                      Try OpenProposal Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* FAQ Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How long should a business proposal be?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      2-5 pages for most projects. Complex enterprise deals may need more, but shorter is usually better. If you can&apos;t explain your value in 5 pages, you don&apos;t understand it well enough.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Should I include multiple pricing options?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Yes—offering 2-3 tiers (Good/Better/Best) increases close rates. Most clients choose the middle option.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">When should I send a proposal?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Within 24-48 hours of your discovery call. Speed signals professionalism and keeps momentum high.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How do I handle proposal revisions?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      One round of minor revisions is reasonable. For major scope changes, create a new proposal. Never keep editing the same document indefinitely.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What if the client ghosts after receiving the proposal?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Follow up 3-4 times over two weeks. If no response, send a &quot;closing the loop&quot; email: &quot;Hi [Name], I haven&apos;t heard back, so I&apos;ll assume the timing isn&apos;t right. Feel free to reach out if things change.&quot;
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
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
