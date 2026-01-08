import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle2, XCircle, TrendingUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "15 Reasons Your Proposals Get Rejected (And How to Fix Them) - OpenProposal",
  description:
    "Stop losing deals you should be winning. These common proposal mistakes cost freelancers and agencies thousands every year. Learn how to fix them.",
  openGraph: {
    title: "15 Reasons Your Proposals Get Rejected (And How to Fix Them)",
    description:
      "Stop losing deals you should be winning. These common proposal mistakes cost freelancers and agencies thousands every year.",
  },
};

const keyPoints = [
  "Proposals rarely get rejected on merit alone",
  "Win rate improves dramatically when you fix psychological barriers",
  "80% of deals require 5+ follow-ups, but most sellers give up after 2",
  "Proposals sent within 24 hours close 60% more often",
];

const highImpactFixes = [
  { fix: "Add tiered pricing", impact: "+22% win rate" },
  { fix: "Include case studies", impact: "+27% win rate" },
  { fix: "Add e-signatures", impact: "+18% win rate" },
  { fix: "Send faster", impact: "+60% close rate" },
];

const redFlags = [
  {
    flag: "They won't commit to a call",
    stat: "Proposals sent without a conversation close at 18%. Solicited proposals close at 47%.",
  },
  {
    flag: "They're shopping",
    stat: '"We\'re getting multiple quotes" means you\'re a commodity.',
  },
  {
    flag: "No timeline",
    stat: '"Eventually" means never.',
  },
  {
    flag: "No budget",
    stat: '"We\'ll figure that out later" means they\'re not serious.',
  },
  {
    flag: "Wrong contact",
    stat: "You're talking to someone who can't actually say yes.",
  },
];

export default function WhyProposalsGetRejectedPage() {
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
            <Link href="/compare" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              FAQ
            </Link>
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
        <div className="container pt-6">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to blog
          </Link>
        </div>

        {/* Hero */}
        <article className="container py-12 md:py-16 max-w-4xl">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4">
              Business Tips
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              15 Reasons Your Proposals Get Rejected (And How to Fix Them)
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Stop losing deals you should be winning. These common proposal mistakes cost
              freelancers and agencies thousands every year.
            </p>
          </div>

          <div className="border-l-4 border-primary pl-6 mb-12 bg-muted/50 py-4 rounded-r-lg">
            <p className="text-lg leading-relaxed">
              You had a great discovery call. The client seemed interested. You sent a solid
              proposal.
            </p>
            <p className="text-lg leading-relaxed mt-4">
              Then... silence. Or worse: &quot;We decided to go another direction.&quot;
            </p>
            <p className="text-lg leading-relaxed mt-4">
              Most rejected proposals fail for predictable, fixable reasons. Here&apos;s what&apos;s
              going wrong and how to turn more proposals into signed contracts.
            </p>
          </div>

          {/* The Real Reason */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              The Real Reason Proposals Get Rejected
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              Before diving into specific mistakes, understand this:{" "}
              <strong>proposals rarely get rejected on merit alone.</strong>
            </p>
            <p className="text-lg leading-relaxed mb-4">Clients reject proposals because of:</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <XCircle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span>
                  <strong>Confusion</strong> (they don&apos;t understand what they&apos;re getting)
                </span>
              </li>
              <li className="flex items-start">
                <XCircle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span>
                  <strong>Fear</strong> (they&apos;re not confident it will work)
                </span>
              </li>
              <li className="flex items-start">
                <XCircle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span>
                  <strong>Friction</strong> (it&apos;s hard to say yes)
                </span>
              </li>
              <li className="flex items-start">
                <XCircle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span>
                  <strong>Timing</strong> (they&apos;re not ready to decide)
                </span>
              </li>
            </ul>
            <p className="text-lg leading-relaxed">
              Fix these psychological barriers, and your win rate will improve dramatically.
            </p>
          </section>

          <div className="h-px bg-border my-12" />

          {/* Reason 1 */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Reason 1: You&apos;re Solving the Wrong Problem
            </h2>
            <Card className="mb-4 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900 mb-2">The mistake:</p>
                <p className="text-red-800">
                  You propose what you think they need instead of what they asked for.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-green-900 mb-2">The fix:</p>
                <p className="text-green-800 mb-4">
                  Mirror their exact language back to them. If they said &quot;we need more
                  leads,&quot; don&apos;t propose &quot;brand awareness.&quot; If they said their
                  &quot;website looks dated,&quot; don&apos;t propose &quot;conversion
                  optimization.&quot;
                </p>
                <p className="text-green-800">
                  Solve their stated problem first. Suggest additional improvements later.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Reason 2 */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Reason 2: No Clear ROI</h2>
            <Card className="mb-4 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900 mb-2">The mistake:</p>
                <p className="text-red-800">
                  You list features and deliverables without connecting them to outcomes.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-green-900 mb-2">The fix:</p>
                <p className="text-green-800 mb-4">
                  Quantify the value. &quot;A new website&quot; means nothing. &quot;A website that
                  converts 3x more visitors into customers, generating an estimated $50K additional
                  revenue&quot; is worth paying for.
                </p>
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="font-semibold text-green-900">Formula:</p>
                  <p className="text-green-800">
                    What you charge should be 10-20% of the value you create.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Reason 3 */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Reason 3: You Waited Too Long to Send
            </h2>
            <Card className="mb-4 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900 mb-2">The mistake:</p>
                <p className="text-red-800">
                  You spent a week perfecting the proposal while their enthusiasm cooled.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-green-900 mb-2">The fix:</p>
                <p className="text-green-800 mb-4">
                  Send within 24-48 hours of the discovery call. A good proposal today beats a
                  perfect proposal next week.
                </p>
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-green-800 font-semibold">
                    Data shows proposals sent within 24 hours close 60% more often.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Reason 4 */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Reason 4: It&apos;s Too Long</h2>
            <Card className="mb-4 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900 mb-2">The mistake:</p>
                <p className="text-red-800">20-page proposals that no one reads.</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-green-900 mb-2">The fix:</p>
                <p className="text-green-800 mb-4">
                  Keep it to 3-5 pages for most projects. If you need more detail, put it in
                  appendices. Decision-makers skim—make sure they catch the key points.
                </p>
                <p className="font-semibold text-green-900 mb-2">What matters:</p>
                <ul className="space-y-2">
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Problem (1 paragraph)
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Solution (1 page)
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Investment (clear and visible)
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Why you (1 paragraph)
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Next steps (obvious)
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Reason 5 */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Reason 5: Burying the Price</h2>
            <Card className="mb-4 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900 mb-2">The mistake:</p>
                <p className="text-red-800">
                  Making clients hunt through pages to find the cost.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-green-900 mb-2">The fix:</p>
                <p className="text-green-800 mb-4">
                  Put pricing where it&apos;s easy to find. Clients flip to price first anyway—42%
                  read pricing before anything else.
                </p>
                <p className="text-green-800">
                  Present it confidently with context about the value they&apos;re getting.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Reason 6 */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Reason 6: Vague Scope</h2>
            <Card className="mb-4 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900 mb-2">The mistake:</p>
                <p className="text-red-800">
                  &quot;We&apos;ll redesign your website&quot; or &quot;We&apos;ll improve your
                  marketing.&quot;
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-green-900 mb-2">The fix: Be specific:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Number of pages/deliverables
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Number of revisions included
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    What&apos;s included
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    What&apos;s NOT included
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Timeline with milestones
                  </li>
                </ul>
                <p className="font-semibold text-green-900 mb-2">Vague scope creates two problems:</p>
                <ol className="list-decimal list-inside space-y-1 text-green-800">
                  <li>Client doesn&apos;t know what they&apos;re buying</li>
                  <li>You&apos;ll face scope creep later</li>
                </ol>
              </CardContent>
            </Card>
          </section>

          {/* Reason 7 */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Reason 7: No Social Proof</h2>
            <Card className="mb-4 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900 mb-2">The mistake:</p>
                <p className="text-red-800">&quot;Trust me, I&apos;m good at this.&quot;</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-green-900 mb-2">The fix: Prove it with:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Case studies from similar projects
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Testimonials (with real names)
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Relevant metrics and results
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Client logos
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Awards or certifications
                  </li>
                </ul>
                <p className="text-green-800 text-sm">
                  If you&apos;re new: use results from past employment, personal projects, or even
                  detailed process descriptions.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Reason 8 */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Reason 8: Making It Hard to Say Yes
            </h2>
            <Card className="mb-4 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900 mb-2">The mistake:</p>
                <p className="text-red-800">
                  Requiring physical signatures, check payments, or complex approval processes.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-green-900 mb-2">The fix:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Digital signatures (click, done)
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Online payment (credit card, ACH)
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Clear &quot;Accept&quot; button
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Simple next steps
                  </li>
                </ul>
                <p className="text-green-800 font-semibold">
                  Every friction point loses deals. If they can say yes in one click, they will.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Reason 9 */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Reason 9: No Expiration Date
            </h2>
            <Card className="mb-4 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900 mb-2">The mistake:</p>
                <p className="text-red-800">Open-ended proposals that sit in inboxes forever.</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-green-900 mb-2">The fix: Add a validity period:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    &quot;Proposal valid until [Date]&quot;
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    &quot;Pricing reflects current availability&quot;
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    14-30 days is standard
                  </li>
                </ul>
                <p className="text-green-800">This creates urgency without being pushy.</p>
              </CardContent>
            </Card>
          </section>

          {/* Reason 10 */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Reason 10: Generic Templates
            </h2>
            <Card className="mb-4 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900 mb-2">The mistake:</p>
                <p className="text-red-800">
                  Client can tell it&apos;s a template with their name swapped in.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-green-900 mb-2">
                  The fix: Customize every proposal:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Reference specific points from your call
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Use their company name multiple times
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Include relevant case studies (not generic ones)
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Show you researched their business
                  </li>
                </ul>
                <p className="text-green-800 font-semibold">
                  5 minutes of personalization can double your close rate.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Reason 11 */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Reason 11: Poor Presentation
            </h2>
            <Card className="mb-4 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900 mb-2">The mistake:</p>
                <p className="text-red-800">Plain documents that look unprofessional.</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-green-900 mb-2">The fix:</p>
                <p className="text-green-800 mb-4">
                  Design matters. Your proposal represents the quality of your work. Use:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Clean formatting
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Your branding
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Professional layout
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Quality images (if relevant)
                  </li>
                </ul>
                <p className="text-green-800">
                  PDF or dedicated proposal software—never raw Word docs.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Reason 12 */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Reason 12: Only One Option</h2>
            <Card className="mb-4 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900 mb-2">The mistake:</p>
                <p className="text-red-800">Take it or leave it pricing.</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-green-900 mb-2">The fix: Offer 2-3 tiers. This:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Gives them control
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Anchors higher prices
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Increases average deal size
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Creates &quot;middle option&quot; psychology (most pick the middle)
                  </li>
                </ul>
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="font-semibold text-green-900 mb-2">Example:</p>
                  <ul className="space-y-1 text-green-800">
                    <li>Starter: $3,000</li>
                    <li>Standard: $5,000 (most popular)</li>
                    <li>Premium: $8,000</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Reason 13 */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Reason 13: No Follow-Up</h2>
            <Card className="mb-4 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900 mb-2">The mistake:</p>
                <p className="text-red-800">Sending the proposal and hoping.</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-green-900 mb-2">The fix: Systematic follow-up:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Day 1: Confirm receipt
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Day 3: Check for questions
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Day 7: Add value
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Day 10: Direct ask
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Day 14: Urgency
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Day 21: Permission to close
                  </li>
                </ul>
                <p className="text-green-800 font-semibold">
                  80% of deals require 5+ follow-ups. Most sellers give up after 2.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Reason 14 */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Reason 14: Wrong Timing</h2>
            <Card className="mb-4 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900 mb-2">The mistake:</p>
                <p className="text-red-800">Client isn&apos;t actually ready to buy.</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-green-900 mb-2">
                  The fix: Qualify harder before sending proposals:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    &quot;What&apos;s your timeline for this project?&quot;
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    &quot;Is budget already approved?&quot;
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    &quot;Who else needs to sign off?&quot;
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    &quot;What would prevent you from moving forward?&quot;
                  </li>
                </ul>
                <p className="text-green-800">Don&apos;t waste proposals on unqualified leads.</p>
              </CardContent>
            </Card>
          </section>

          {/* Reason 15 */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Reason 15: You&apos;re Competing on Price
            </h2>
            <Card className="mb-4 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-red-900 mb-2">The mistake:</p>
                <p className="text-red-800">Being the cheapest option in a commodity comparison.</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <p className="font-semibold text-green-900 mb-2">The fix: Differentiate:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Unique process or methodology
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Specialized expertise
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Better results/track record
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Superior service
                  </li>
                  <li className="flex items-start text-green-800">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    Unique value proposition
                  </li>
                </ul>
                <p className="text-green-800 font-semibold">
                  If clients see you as interchangeable with competitors, they&apos;ll choose the
                  cheapest. If they see you as uniquely qualified, price matters less.
                </p>
              </CardContent>
            </Card>
          </section>

          <div className="h-px bg-border my-12" />

          {/* How to Improve Your Win Rate */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">How to Improve Your Win Rate</h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Track Your Data</h3>
                <p className="mb-4">You can&apos;t improve what you don&apos;t measure. Track:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    Proposals sent
                  </li>
                  <li className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    Proposals won
                  </li>
                  <li className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    Win rate by client type
                  </li>
                  <li className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    Win rate by project type
                  </li>
                  <li className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    Average deal size
                  </li>
                  <li className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    Time to close
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Get Feedback on Losses</h3>
                <p className="mb-4">Ask clients who said no:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    &quot;Would you mind sharing what influenced your decision?&quot;
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    &quot;What would have made our proposal stronger?&quot;
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    &quot;Was there something missing?&quot;
                  </li>
                </ul>
                <p className="mt-4 text-muted-foreground">This feedback is gold. Use it.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Test One Thing at a Time</h3>
                <p className="mb-4">
                  Pick one issue from this list. Fix it. Track results. Then move to the next.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {highImpactFixes.map((item, i) => (
                    <Card key={i} className="border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.fix}</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {item.impact}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="h-px bg-border my-12" />

          {/* Red Flags */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Red Flags You&apos;ll Lose the Deal
            </h2>
            <p className="text-lg mb-6">Watch for these warning signs during discovery:</p>
            <div className="space-y-4">
              {redFlags.map((item, i) => (
                <Card key={i} className="border-red-200 bg-red-50/30">
                  <CardContent className="pt-6">
                    <p className="font-semibold text-red-900 mb-2">{item.flag}</p>
                    <p className="text-red-800">{item.stat}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mt-6 text-lg font-semibold">
              Sometimes the best move is NOT sending a proposal and focusing on better
              opportunities.
            </p>
          </section>

          <div className="h-px bg-border my-12" />

          {/* The Proposal That Wins */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">The Proposal That Wins</h2>
            <p className="text-lg mb-6">Winning proposals:</p>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <span className="text-2xl font-bold text-primary mr-4">1</span>
                    <div>
                      <p className="font-semibold mb-1">Show understanding</p>
                      <p className="text-muted-foreground">Client feels heard and understood</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <span className="text-2xl font-bold text-primary mr-4">2</span>
                    <div>
                      <p className="font-semibold mb-1">Solve the right problem</p>
                      <p className="text-muted-foreground">Addresses their stated pain</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <span className="text-2xl font-bold text-primary mr-4">3</span>
                    <div>
                      <p className="font-semibold mb-1">Quantify value</p>
                      <p className="text-muted-foreground">Clear ROI or outcomes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <span className="text-2xl font-bold text-primary mr-4">4</span>
                    <div>
                      <p className="font-semibold mb-1">Reduce risk</p>
                      <p className="text-muted-foreground">
                        Testimonials, guarantees, clear scope
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <span className="text-2xl font-bold text-primary mr-4">5</span>
                    <div>
                      <p className="font-semibold mb-1">Make it easy</p>
                      <p className="text-muted-foreground">Simple to understand, easy to sign</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <p className="mt-6 text-lg">
              Master these five elements and you&apos;ll outperform competitors who are better at
              the actual work but worse at proposals.
            </p>
          </section>

          <div className="h-px bg-border my-12" />

          {/* CTA Section */}
          <section className="mb-12">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="py-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Stop Losing Deals to Bad Proposals
                </h2>
                <p className="text-lg mb-6 text-primary-foreground/90">
                  You&apos;re probably losing projects to competitors with better proposals, not
                  better skills.
                </p>
                <p className="text-lg mb-6 text-primary-foreground/90">
                  <strong>OpenProposal</strong> helps you:
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-start text-primary-foreground/90">
                    <CheckCircle2 className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                    Create professional proposals fast
                  </li>
                  <li className="flex items-start text-primary-foreground/90">
                    <CheckCircle2 className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                    Track when clients view them
                  </li>
                  <li className="flex items-start text-primary-foreground/90">
                    <CheckCircle2 className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                    Get e-signatures instantly
                  </li>
                  <li className="flex items-start text-primary-foreground/90">
                    <CheckCircle2 className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                    Collect payment on acceptance
                  </li>
                  <li className="flex items-start text-primary-foreground/90">
                    <CheckCircle2 className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                    Win more clients
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

          {/* Article Footer */}
          <div className="text-sm text-muted-foreground border-t pt-6">
            <p>Last updated: January 2026</p>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} OpenProposal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
