import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Freelance Proposal Template: Win More Clients [Free Template]",
  description:
    "The exact proposal template freelancers use to close $5K-$50K projects. Copy, customize, and send in 15 minutes. Includes pricing strategies and follow-up tactics.",
  openGraph: {
    title: "Freelance Proposal Template: Win More Clients [Free Template]",
    description:
      "The exact proposal template freelancers use to close $5K-$50K projects. Copy, customize, and send in 15 minutes.",
  },
};

const customizationTips = [
  {
    type: "For Writers",
    includes: [
      "Word count or article count",
      "Research expectations",
      "SEO requirements",
      "Revision rounds",
      "Content calendar",
    ],
    sample:
      '"4 blog posts (1,500 words each), SEO-optimized, delivered weekly for 1 month"',
  },
  {
    type: "For Designers",
    includes: [
      "Number of concepts",
      "File formats delivered",
      "Revision rounds",
      "Source files (yes/no)",
      "Usage rights",
    ],
    sample:
      '"3 initial logo concepts, 2 revision rounds, final files in AI, EPS, PNG, and SVG formats with full usage rights"',
  },
  {
    type: "For Developers",
    includes: [
      "Technical specifications",
      "Hosting/deployment",
      "Browser/device support",
      "Testing included",
      "Post-launch support period",
    ],
    sample:
      '"5-page responsive website, WordPress CMS, tested on Chrome/Safari/Firefox, includes 30 days post-launch bug fixes"',
  },
  {
    type: "For Consultants",
    includes: [
      "Number of sessions/hours",
      "Deliverable documents",
      "Communication expectations",
      "Implementation support",
    ],
    sample:
      '"4 x 90-minute strategy sessions, recorded with transcripts, plus implementation roadmap document"',
  },
];

const pricingStrategies = [
  {
    strategy: "Single Price",
    bestFor: ["Simple, well-defined projects", "Clients who know what they want", "Projects under $5K"],
    example: '"Website Redesign: $3,500"',
  },
  {
    strategy: "Tiered Pricing",
    bestFor: ["Clients who might want more", "Projects where scope varies", "Upselling opportunities"],
    example: "See pricing table below",
  },
  {
    strategy: "Retainer",
    bestFor: ["Ongoing work", "Predictable revenue", "Long-term clients"],
    example: '"Monthly Retainer: $2,000/month for up to 20 hours of design work"',
  },
];

const mistakes = [
  {
    title: "Waiting Too Long to Send",
    description:
      "Send your proposal within 24 hours of the discovery call. Every day you wait, close rates drop.",
  },
  {
    title: "No Social Proof",
    description:
      'Include at least one testimonial or case study. "Trust me, I\'m good" doesn\'t work.',
  },
  {
    title: "Unclear Revisions Policy",
    description:
      '"Unlimited revisions" sounds client-friendly but leads to scope creep. Define exactly how many rounds are included.',
  },
  {
    title: "Missing Payment Terms",
    description:
      "When is payment due? How can they pay? What happens if they're late? Spell it out.",
  },
  {
    title: "No Signature Mechanism",
    description:
      'Asking someone to "reply to accept" is weaker than a formal signature. Use e-signatures for professional proposals.',
  },
];

const whyItWorks = [
  {
    title: "It Leads with Their Problem",
    description:
      'Notice the proposal doesn\'t start with "About Me." It starts with what the client said in the discovery call. This shows you listened and understand their situation.',
  },
  {
    title: "It's Specific",
    description:
      "Vague proposals get vague responses (or no response). This template uses exact deliverables, specific dates, clear pricing, and defined scope.",
  },
  {
    title: "It's Easy to Say Yes",
    description:
      "The \"Next Steps\" section tells them exactly what to do. No ambiguity = faster decisions.",
  },
  {
    title: "It Creates Urgency",
    description:
      "The 14-day validity and specific start date prevent proposals from sitting in inboxes forever.",
  },
];

export default function FreelanceProposalTemplatePage() {
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
        {/* Hero */}
        <section className="container py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Freelance Proposal Template: Win More Clients [Free Template]
            </h1>
            <p className="text-xl text-muted-foreground mb-8 italic">
              The exact proposal template freelancers use to close $5K-$50K projects. Copy,
              customize, and send in 15 minutes.
            </p>
            <div className="border-l-4 border-primary pl-6 mb-8">
              <p className="text-lg">
                You found a great client. The discovery call went well. Now you need to send a
                proposal that seals the deal.
              </p>
              <p className="text-lg mt-4">
                Most freelancers lose projects at this stage—not because of price, but because their
                proposals look unprofessional or take too long to arrive.
              </p>
              <p className="text-lg mt-4 font-semibold">This template fixes that.</p>
            </div>
          </div>
        </section>

        {/* Template Section */}
        <section className="container pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Free Freelance Proposal Template</h2>
            <p className="text-muted-foreground mb-6">
              Copy this template and customize it for your next client:
            </p>

            <Card className="bg-muted/50">
              <CardContent className="p-8 space-y-6">
                <div className="border-b pb-4">
                  <p className="font-bold">[Your Name/Logo]</p>
                  <p className="text-sm text-muted-foreground">
                    [Your Email] | [Your Phone] | [Your Website]
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">Proposal for [Client Name]</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Project:</strong> [Project Name]
                    </p>
                    <p>
                      <strong>Date:</strong> [Today&apos;s Date]
                    </p>
                    <p>
                      <strong>Valid for:</strong> 14 days
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Hi [Client First Name],</h4>
                  <p className="text-sm mb-4">
                    Thanks for taking the time to chat on [day]. I&apos;m excited about the
                    possibility of working together on [brief project description].
                  </p>
                  <p className="text-sm">
                    Based on our conversation, here&apos;s my proposal for [achieving their main
                    goal].
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">The Challenge</h4>
                  <p className="text-sm mb-2">You mentioned that:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>[Pain point 1 they shared]</li>
                    <li>[Pain point 2 they shared]</li>
                    <li>[Goal they want to achieve]</li>
                  </ul>
                  <p className="text-sm mt-3">
                    This is costing you [time/money/opportunity] every [day/week/month].
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">My Approach</h4>
                  <p className="text-sm mb-3">Here&apos;s how I&apos;ll solve this:</p>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-sm">
                        <strong>Phase 1: [Name]</strong> (Week 1-2)
                      </p>
                      <ul className="list-disc list-inside text-sm ml-4">
                        <li>[Deliverable]</li>
                        <li>[Deliverable]</li>
                        <li>[Deliverable]</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        <strong>Phase 2: [Name]</strong> (Week 3-4)
                      </p>
                      <ul className="list-disc list-inside text-sm ml-4">
                        <li>[Deliverable]</li>
                        <li>[Deliverable]</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm mt-3">
                    <strong>Final Delivery:</strong> [What they get at the end]
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">What&apos;s Included</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">[Specific deliverable]</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">[Specific deliverable]</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">[Specific deliverable]</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">[Number] rounds of revisions</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">[Timeline] delivery</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">[Any bonuses]</span>
                    </div>
                  </div>
                  <p className="text-sm mt-4">
                    <strong>Not included</strong> (available as add-ons):
                  </p>
                  <ul className="list-disc list-inside text-sm ml-4">
                    <li>[Service they might want later]</li>
                    <li>[Service they might want later]</li>
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Investment</h4>
                  <p className="text-lg font-bold mb-3">[Project Name]: $[X,XXX]</p>
                  <p className="text-sm font-medium mb-2">Payment schedule:</p>
                  <ul className="list-disc list-inside text-sm ml-4">
                    <li>50% ($[X,XXX]) to start</li>
                    <li>50% ($[X,XXX]) on completion</li>
                  </ul>
                  <p className="text-sm italic mt-3">Payment via credit card or bank transfer.</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Timeline</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Milestone</th>
                          <th className="text-left py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Project start</td>
                          <td className="py-2">[Date]</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">[Phase 1] complete</td>
                          <td className="py-2">[Date]</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">[Phase 2] complete</td>
                          <td className="py-2">[Date]</td>
                        </tr>
                        <tr>
                          <td className="py-2">Final delivery</td>
                          <td className="py-2">[Date]</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm italic mt-3">Timeline starts upon deposit payment.</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Why Me?</h4>
                  <p className="text-sm mb-3">
                    I&apos;ve helped [number] clients with similar projects:
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>[Client A]:</strong> &quot;[One-sentence testimonial about
                      results]&quot;
                    </p>
                    <p className="text-sm">
                      <strong>[Client B]:</strong> &quot;[One-sentence testimonial about
                      results]&quot;
                    </p>
                  </div>
                  <p className="text-sm mt-3">[Link to portfolio/case studies]</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Next Steps</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>
                      <strong>Reply to this email</strong> to accept (or ask any questions)
                    </li>
                    <li>
                      <strong>Sign the agreement</strong> (link below)
                    </li>
                    <li>
                      <strong>Submit deposit</strong> (link included in agreement)
                    </li>
                    <li>
                      <strong>I&apos;ll send a kickoff questionnaire</strong> within 24 hours
                    </li>
                  </ol>
                  <div className="mt-4">
                    <Button asChild>
                      <Link href="/login">[Accept Proposal &amp; Sign →]</Link>
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm">Looking forward to working together!</p>
                  <p className="text-sm mt-2">[Your Name]</p>
                  <p className="text-sm">[Your Title]</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why This Template Works */}
        <section className="container pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Why This Template Works</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {whyItWorks.map((item, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Customization Tips */}
        <section className="container pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              Customization Tips by Freelance Type
            </h2>
            <div className="space-y-6">
              {customizationTips.map((tip, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-xl">{tip.type}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-semibold text-sm mb-2">Include:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {tip.includes.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">Sample deliverable:</p>
                      <p className="text-sm text-muted-foreground italic">{tip.sample}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Strategies */}
        <section className="container pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              Pricing Strategies for Freelance Proposals
            </h2>
            <div className="space-y-6">
              {pricingStrategies.map((strategy, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-xl">Strategy {i + 1}: {strategy.strategy}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-semibold text-sm mb-2">Best for:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {strategy.bestFor.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">Example:</p>
                      <p className="text-sm text-muted-foreground italic">{strategy.example}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tiered Pricing Example Table */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Example: Tiered Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 font-medium">Package</th>
                        <th className="text-left py-3 px-4 font-medium">Includes</th>
                        <th className="text-left py-3 px-4 font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Starter</td>
                        <td className="py-3 px-4 text-sm">5 pages, basic design</td>
                        <td className="py-3 px-4 font-medium">$2,500</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Professional</td>
                        <td className="py-3 px-4 text-sm">10 pages, custom design, SEO</td>
                        <td className="py-3 px-4 font-medium">$5,000</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Premium</td>
                        <td className="py-3 px-4 text-sm">
                          15 pages, custom design, SEO, copywriting
                        </td>
                        <td className="py-3 px-4 font-medium">$8,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="container pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              Common Freelance Proposal Mistakes
            </h2>
            <div className="space-y-6">
              {mistakes.map((mistake, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg">Mistake {i + 1}: {mistake.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{mistake.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Follow Up Section */}
        <section className="container pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              How to Follow Up on Freelance Proposals
            </h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>If They Don&apos;t Respond</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-sm">Day 2:</p>
                  <p className="text-sm text-muted-foreground">
                    &quot;Hi [Name], just checking if you received the proposal. Any
                    questions?&quot;
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm">Day 5:</p>
                  <p className="text-sm text-muted-foreground">
                    &quot;Hi [Name], wanted to follow up on the proposal. Happy to hop on a call if
                    anything needs clarification.&quot;
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm">Day 10:</p>
                  <p className="text-sm text-muted-foreground">
                    &quot;Hi [Name], the proposal expires in 4 days. Let me know if you&apos;d like
                    to move forward or if the timing isn&apos;t right.&quot;
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm">Day 14:</p>
                  <p className="text-sm text-muted-foreground">
                    &quot;Hi [Name], the proposal has expired but I&apos;d still love to work with
                    you. If you&apos;re interested, let me know and I can send an updated
                    version.&quot;
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>If They Say &quot;Too Expensive&quot;</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  &quot;I understand. What budget did you have in mind? I might be able to adjust
                  the scope to fit.&quot;
                </p>
                <p className="text-sm">Then either:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Reduce deliverables to match budget</li>
                  <li>Offer payment plans</li>
                  <li>Walk away professionally</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>If They Say &quot;Need to Think About It&quot;</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  &quot;Of course! What specifically do you want to think through? Maybe I can
                  provide more info.&quot;
                </p>
                <p className="text-sm">This uncovers the real objection.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tools Section */}
        <section className="container pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              Tools for Freelance Proposals
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manual Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>Google Docs</strong> - Free, looks unprofessional
                    </li>
                    <li>
                      <strong>Canva</strong> - Free tier, design-focused
                    </li>
                    <li>
                      <strong>Word/PDF</strong> - Free if you have Office
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Professional Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>OpenProposal</strong> - Proposals + e-signatures + payments in one
                    </li>
                    <li>
                      <strong>Proposify</strong> - Template-heavy
                    </li>
                    <li>
                      <strong>Better Proposals</strong> - Good designs
                    </li>
                    <li>
                      <strong>HoneyBook</strong> - Full client management
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 border-primary">
              <CardContent className="pt-6">
                <p className="font-semibold mb-3">The difference? Professional tools let you:</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Track when proposals are viewed</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Collect signatures digitally</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Accept payment immediately</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Send automatic reminders</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container pb-16">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="py-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Create Freelance Proposals That Close
                </h2>
                <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                  Stop losing clients to sloppy proposals. OpenProposal gives you professional
                  templates, e-signatures, Stripe payment collection, open/view tracking, and no
                  per-user pricing.
                </p>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="https://sendprop.com">
                    Create Your Free Proposal
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Compare</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How much should I charge?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Price based on value, not time. Ask: &quot;What is this worth to the
                    client?&quot; A logo for a Fortune 500 company is worth more than the same logo
                    for a local bakery.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Should I negotiate?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Hold your price. If they push, reduce scope instead of discounting. &quot;I
                    can&apos;t do it for $2,000, but here&apos;s what I can do for that
                    budget...&quot;
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">When should I require a deposit?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Always. 50% upfront is standard. Never start work without payment.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How do I handle scope creep?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Reference your proposal: &quot;That wasn&apos;t in our original scope. I&apos;m
                    happy to add it for $X. Want me to send a change order?&quot;
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Updated Date */}
        <section className="container pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground italic">Last updated: January 2026</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} OpenProposal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
