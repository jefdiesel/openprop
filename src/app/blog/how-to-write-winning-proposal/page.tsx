import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "How to Write a Winning Business Proposal [Step-by-Step Guide] | OpenProposal",
  description:
    "Learn the exact structure, psychology, and tactics that turn proposals into signed contracts. Data-driven guide from thousands of successful proposals.",
  openGraph: {
    title: "How to Write a Winning Business Proposal [Step-by-Step Guide]",
    description:
      "Learn the exact structure, psychology, and tactics that turn proposals into signed contracts.",
  },
};

export default function WinningProposalGuidePage() {
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
        <section className="container mx-auto px-6 py-12 md:py-16 max-w-4xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Guide</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              How to Write a Winning Business Proposal
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Learn the exact structure, psychology, and tactics that turn proposals into signed contracts.
            </p>
          </div>

          {/* Intro Stats */}
          <Card className="mb-12">
            <CardContent className="pt-6">
              <p className="text-lg mb-4">
                The average proposal has a 43% win rate. Top performers win over 75%.
              </p>
              <p className="text-muted-foreground">
                The difference isn&apos;t luck—it&apos;s technique. This guide breaks down exactly how to write proposals that close deals, based on data from thousands of successful proposals.
              </p>
            </CardContent>
          </Card>

          {/* Article Content */}
          <article className="prose prose-gray dark:prose-invert max-w-none">
            {/* What Is a Business Proposal */}
            <h2 className="text-3xl font-bold mb-4 mt-12">What Is a Business Proposal?</h2>
            <p className="text-lg mb-4">
              A business proposal is a document that offers a specific solution to a prospective client&apos;s problem. It explains:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>What you&apos;ll do</li>
              <li>How you&apos;ll do it</li>
              <li>What it costs</li>
              <li>Why you&apos;re the right choice</li>
            </ul>
            <p className="text-lg mb-8">
              Proposals are sales documents, not just price quotes. Their job is to convince someone to say yes.
            </p>

            {/* Types of Proposals */}
            <h3 className="text-2xl font-bold mb-4">Types of Business Proposals</h3>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Solicited Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The client requested it—they sent an RFP, asked for a quote, or had a discovery call with you.
                </p>
              </CardContent>
            </Card>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Unsolicited Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You&apos;re proactively pitching—cold outreach, following up after networking, or identifying an opportunity.
                </p>
              </CardContent>
            </Card>
            <p className="mb-8 font-medium">
              Solicited proposals close at 2-3x the rate of unsolicited ones. Always try to get a conversation before sending a proposal.
            </p>

            {/* Winning Structure */}
            <h2 className="text-3xl font-bold mb-6 mt-12">The Winning Proposal Structure</h2>

            {/* 1. Title Page */}
            <h3 className="text-2xl font-bold mb-4">1. Title Page</h3>
            <p className="mb-4">Keep it simple:</p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li>Proposal title or &quot;Proposal for [Client Name]&quot;</li>
              <li>Your company name/logo</li>
              <li>Date</li>
              <li>Client&apos;s company name</li>
            </ul>

            {/* 2. Executive Summary */}
            <h3 className="text-2xl font-bold mb-4">2. Executive Summary</h3>
            <Card className="mb-4 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="font-medium mb-2">
                  This is the most important section. Many decision-makers read ONLY this part.
                </p>
              </CardContent>
            </Card>
            <p className="font-medium mb-2">Include:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>The client&apos;s core challenge (1 sentence)</li>
              <li>Your solution (1-2 sentences)</li>
              <li>Expected outcome (1 sentence)</li>
              <li>Investment and timeline (1 sentence)</li>
            </ul>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Example:</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">
                  &quot;Acme Corp&apos;s website currently converts 1.2% of visitors—half the industry average. This proposal outlines a 6-week conversion optimization project targeting 3.0% conversion, which would generate an additional $180K in annual revenue. Investment: $15,000.&quot;
                </p>
              </CardContent>
            </Card>

            {/* 3. Problem Statement */}
            <h3 className="text-2xl font-bold mb-4">3. Problem Statement</h3>
            <p className="mb-4">Demonstrate that you understand their situation better than they do.</p>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    Do:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>Reference specific pain points from your discovery call</li>
                    <li>Quantify the cost of the problem</li>
                    <li>Show the consequences of not acting</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-red-500">✗</span>
                    Don&apos;t:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>Be generic (&quot;Many businesses struggle with...&quot;)</li>
                    <li>Assume you know problems they didn&apos;t mention</li>
                    <li>Be negative or critical of their past decisions</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* 4. Proposed Solution */}
            <h3 className="text-2xl font-bold mb-4">4. Proposed Solution</h3>
            <p className="mb-4">Explain what you&apos;ll actually do. Be specific.</p>
            <p className="font-medium mb-2">Structure each deliverable:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>What it is</li>
              <li>Why it matters</li>
              <li>What they&apos;ll receive</li>
            </ul>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">Bad:</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">&quot;We&apos;ll improve your marketing.&quot;</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CardHeader>
                  <CardTitle className="text-lg text-green-600">Good:</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    &quot;We&apos;ll audit your current campaigns, identify your top 3 performing channels, and reallocate budget to maximize ROI. You&apos;ll receive a detailed analysis report plus a 90-day campaign calendar.&quot;
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 5. Methodology */}
            <h3 className="text-2xl font-bold mb-4">5. Methodology/Approach</h3>
            <p className="mb-4">Explain HOW you work. This builds confidence.</p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li>Name your process (this signals proprietary expertise)</li>
              <li>Break it into phases</li>
              <li>Show you&apos;ve thought it through</li>
            </ul>

            {/* 6. Timeline */}
            <h3 className="text-2xl font-bold mb-4">6. Timeline</h3>
            <p className="mb-4">People need to know when they&apos;ll see results.</p>
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Phase</th>
                    <th className="text-left py-3 px-4 font-medium">Duration</th>
                    <th className="text-left py-3 px-4 font-medium">Key Milestone</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Discovery</td>
                    <td className="py-3 px-4">Week 1-2</td>
                    <td className="py-3 px-4">Kickoff complete</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Execution</td>
                    <td className="py-3 px-4">Week 3-6</td>
                    <td className="py-3 px-4">First deliverables</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Review</td>
                    <td className="py-3 px-4">Week 7-8</td>
                    <td className="py-3 px-4">Final delivery</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 7. Investment */}
            <h3 className="text-2xl font-bold mb-4">7. Investment (Pricing)</h3>
            <Card className="mb-4 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="font-medium">
                  Call it &quot;Investment,&quot; not &quot;Cost&quot; or &quot;Pricing.&quot; Words matter.
                </p>
              </CardContent>
            </Card>
            <p className="font-medium mb-2">Pricing presentation options:</p>
            <div className="space-y-3 mb-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Single price:</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Simple, clear. Best for straightforward projects.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tiered pricing:</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Good/Better/Best options. Most clients pick the middle.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Itemized pricing:</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Shows value breakdown. Good for larger projects.
                  </p>
                </CardContent>
              </Card>
            </div>
            <p className="mb-2 font-medium">Always include:</p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li>Total price (prominently displayed)</li>
              <li>Payment terms</li>
              <li>What&apos;s included</li>
              <li>What&apos;s not included (prevents scope creep)</li>
            </ul>

            {/* 8. Social Proof */}
            <h3 className="text-2xl font-bold mb-4">8. Social Proof</h3>
            <p className="mb-4">Why should they trust you?</p>
            <p className="font-medium mb-2">Include:</p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li>Relevant case studies (similar industry or problem)</li>
              <li>Testimonials (real names are more credible)</li>
              <li>Logos of past clients</li>
              <li>Relevant metrics (&quot;helped 50+ companies increase revenue by average of 35%&quot;)</li>
            </ul>

            {/* 9. About Us */}
            <h3 className="text-2xl font-bold mb-4">9. About Us (Brief)</h3>
            <p className="mb-4">Keep this SHORT. One paragraph max.</p>
            <p className="mb-2">Focus on:</p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li>Relevant experience</li>
              <li>Team qualifications</li>
              <li>What makes you different</li>
            </ul>

            {/* 10. Next Steps */}
            <h3 className="text-2xl font-bold mb-4">10. Next Steps</h3>
            <p className="mb-4">Don&apos;t leave them wondering what to do.</p>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Be explicit:</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Sign this proposal</li>
                  <li>Submit deposit payment</li>
                  <li>We&apos;ll schedule kickoff within 48 hours</li>
                </ol>
              </CardContent>
            </Card>

            {/* 11. Terms and Acceptance */}
            <h3 className="text-2xl font-bold mb-4">11. Terms and Acceptance</h3>
            <ul className="list-disc pl-6 mb-12 space-y-2">
              <li>Proposal validity period (14-30 days)</li>
              <li>Signature line</li>
              <li>Date line</li>
            </ul>

            {/* Psychology */}
            <h2 className="text-3xl font-bold mb-6 mt-12">The Psychology of Winning Proposals</h2>

            <div className="space-y-6 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>Principle 1: Anchor High</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    If showing multiple options, put the premium option first. This anchors expectations and makes other options feel like a deal.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Principle 2: Create Urgency (But Don&apos;t Be Sleazy)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>&quot;Proposal valid until [date]&quot;</li>
                    <li>&quot;Project slots available starting [date]&quot;</li>
                    <li>&quot;Pricing reflects current availability&quot;</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Principle 3: Reduce Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-muted-foreground">Address objections before they ask:</p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>&quot;Includes 2 rounds of revisions&quot;</li>
                    <li>&quot;30-day satisfaction guarantee&quot;</li>
                    <li>&quot;Payment plans available&quot;</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Principle 4: Make It Easy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-muted-foreground">The harder it is to say yes, the fewer yeses you&apos;ll get.</p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Clear pricing (no hidden fees)</li>
                    <li>Simple signature process</li>
                    <li>Multiple payment options</li>
                    <li>Obvious next steps</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Principle 5: Show You Listened</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Reference specific things from your discovery call. This shows you&apos;re paying attention and builds trust.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Mistakes */}
            <h2 className="text-3xl font-bold mb-6 mt-12">Proposal Mistakes That Kill Deals</h2>

            <div className="space-y-4 mb-12">
              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="text-lg">Mistake 1: Waiting Too Long to Send</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Every day you wait, close rates drop. Send within 24-48 hours of your discovery call.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="text-lg">Mistake 2: Writing a Novel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Long proposals don&apos;t win more often. They just take longer to read (and often don&apos;t get read at all). 2-5 pages is ideal for most projects.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="text-lg">Mistake 3: Being Vague About Scope</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    &quot;We&apos;ll redesign your website&quot; means different things to different people. Define exactly what&apos;s included and—importantly—what&apos;s not.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="text-lg">Mistake 4: No Social Proof</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    &quot;Trust me, I&apos;m good&quot; doesn&apos;t work. Include at least one testimonial, case study, or relevant credential.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="text-lg">Mistake 5: Burying the Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Clients flip to find the price anyway. Put it where it&apos;s easy to find with clear context about what they&apos;re getting.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="text-lg">Mistake 6: No Expiration Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Proposals without deadlines sit in inboxes forever. 14-30 days is standard.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="text-lg">Mistake 7: Sending and Hoping</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Follow up. Systematically. Proposals that include follow-up close 2x more often.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pricing */}
            <h2 className="text-3xl font-bold mb-6 mt-12">How to Price Your Proposal</h2>

            <div className="space-y-4 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>Cost-Plus Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">Your costs + profit margin = price</p>
                  <p className="text-sm text-red-600">
                    <strong>Problem:</strong> Commoditizes your work and caps your earnings.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market-Based Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">What competitors charge for similar work.</p>
                  <p className="text-sm text-red-600">
                    <strong>Problem:</strong> Assumes competitors priced correctly. Race to bottom.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    Value-Based Pricing (Recommended)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">What is the outcome worth to the client?</p>
                  <p className="text-sm font-medium mb-2">
                    Formula: Expected client value × 10-20% = your price
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Example:</strong> If your work will generate $100K in revenue for the client, charging $15K is a bargain (and more profitable than hourly billing).
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Follow-Up Strategy */}
            <h2 className="text-3xl font-bold mb-6 mt-12">Follow-Up Strategy</h2>
            <p className="mb-6">
              Sending the proposal is half the battle. Here&apos;s the winning follow-up sequence:
            </p>

            <div className="space-y-4 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Day 1: Confirm Receipt</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm italic text-muted-foreground">
                    &quot;Hi [Name], I just sent over the proposal. Let me know if you have any questions!&quot;
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Day 3: Check In</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm italic text-muted-foreground">
                    &quot;Hi [Name], wanted to make sure the proposal came through. Anything I can clarify?&quot;
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Day 7: Add Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm italic text-muted-foreground">
                    &quot;Hi [Name], thought this article might be relevant to what we discussed: [link]. Still happy to chat about the proposal.&quot;
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Day 10: Direct Ask</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm italic text-muted-foreground">
                    &quot;Hi [Name], checking in on the proposal. What questions can I answer to help you decide?&quot;
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Day 14: Urgency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm italic text-muted-foreground">
                    &quot;Hi [Name], heads up that the proposal pricing is valid until [date]. Let me know if you&apos;d like to move forward.&quot;
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Day 21: Permission to Close</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm italic text-muted-foreground">
                    &quot;Hi [Name], I haven&apos;t heard back so I&apos;ll assume the timing isn&apos;t right. I&apos;ll close out this proposal but feel free to reach out if things change!&quot;
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tools */}
            <h2 className="text-3xl font-bold mb-6 mt-12">Tools for Better Proposals</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>Basic (Free)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>Google Docs</li>
                    <li>Canva</li>
                    <li>Word/PDF</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Professional (Worth the Investment)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li><strong>OpenProposal</strong> - proposals + e-signatures + payments</li>
                    <li>Proposify</li>
                    <li>PandaDoc</li>
                    <li>Better Proposals</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-12">
              <CardHeader>
                <CardTitle>Professional tools let you:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Track when proposals are opened</li>
                  <li>See which sections get read</li>
                  <li>Collect signatures digitally</li>
                  <li>Accept payment immediately</li>
                  <li>Automate follow-ups</li>
                </ul>
                <p className="mt-4 font-medium">
                  The ROI on proposal software is usually 10x+ because of improved close rates and faster turnaround.
                </p>
              </CardContent>
            </Card>

            {/* Checklist */}
            <h2 className="text-3xl font-bold mb-6 mt-12">Proposal Checklist</h2>
            <Card className="mb-12">
              <CardHeader>
                <CardTitle>Before sending, verify:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">☐</span>
                    <span>Client name spelled correctly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">☐</span>
                    <span>Problem statement references their specific situation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">☐</span>
                    <span>Scope is specific and unambiguous</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">☐</span>
                    <span>Pricing is clear and easy to find</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">☐</span>
                    <span>Timeline is realistic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">☐</span>
                    <span>Social proof is included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">☐</span>
                    <span>Next steps are explicit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">☐</span>
                    <span>Signature line is included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">☐</span>
                    <span>Expiration date is set</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">☐</span>
                    <span>You&apos;ve proofread everything</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* FAQ */}
            <h2 className="text-3xl font-bold mb-6 mt-12">Compare</h2>
            <div className="space-y-4 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How long should a proposal be?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    2-5 pages for most projects. Enterprise deals may need more, but brevity usually wins.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Should I include multiple pricing options?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes—2-3 tiers increase close rates. Most clients pick the middle option.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What if they ask for a discount?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Hold price, reduce scope. &quot;I can&apos;t do $5K, but here&apos;s what I can do for $5K...&quot;
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How soon should I send the proposal?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Within 24-48 hours of your discovery call. Speed signals professionalism.
                  </p>
                </CardContent>
              </Card>
            </div>
          </article>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 pb-16 max-w-4xl">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Write Proposals That Win
              </h2>
              <p className="text-primary-foreground/80 mb-2 max-w-xl mx-auto">
                Stop losing deals to inferior competitors with better proposals.
              </p>
              <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                <strong>OpenProposal</strong> helps you create professional proposals in minutes, get e-signatures instantly, collect payment upon signing, track opens and engagement, and win more clients.
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
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} OpenProposal. All rights reserved.</p>
          <p className="mt-2">Last updated: January 2026</p>
        </div>
      </footer>
    </div>
  );
}
