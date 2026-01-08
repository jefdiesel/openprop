import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Proposal vs Quote vs Estimate: What's the Difference? | OpenProposal",
  description:
    "Learn when to use proposals, quotes, and estimates. Understand what to include in each, how they impact your close rate, and which format wins more deals.",
  openGraph: {
    title: "Proposal vs Quote vs Estimate: What's the Difference?",
    description:
      "When to use each, what to include, and how they impact your close rate.",
  },
};

export default function ProposalVsQuoteVsEstimatePage() {
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
        <article className="container mx-auto px-6 max-w-4xl py-12 md:py-16">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Proposal vs Quote vs Estimate: What&apos;s the Difference?
            </h1>
            <p className="text-xl text-muted-foreground">
              When to use each, what to include, and how they impact your close rate.
            </p>
          </header>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="border-l-4 border-primary pl-4 my-8 text-lg">
              <p className="mb-2">&quot;Send me a proposal.&quot;</p>
              <p className="mb-2">&quot;Can I get a quote?&quot;</p>
              <p className="mb-0">&quot;What&apos;s your estimate?&quot;</p>
            </div>

            <p className="text-lg">
              Clients use these terms interchangeably. But they mean different things—and using the wrong one can cost you money.
            </p>

            <p className="text-lg">
              Here&apos;s when to use each and how to structure them for maximum impact.
            </p>

            {/* Quick Comparison Table */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">Quick Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium"></th>
                      <th className="text-center py-3 px-4 font-medium">Estimate</th>
                      <th className="text-center py-3 px-4 font-medium">Quote</th>
                      <th className="text-center py-3 px-4 font-medium bg-primary/5">Proposal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Purpose</td>
                      <td className="text-center py-3 px-4">Rough pricing</td>
                      <td className="text-center py-3 px-4">Fixed pricing</td>
                      <td className="text-center py-3 px-4 bg-primary/5">Sell and close</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Detail level</td>
                      <td className="text-center py-3 px-4">Low</td>
                      <td className="text-center py-3 px-4">Medium</td>
                      <td className="text-center py-3 px-4 bg-primary/5">High</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Binding</td>
                      <td className="text-center py-3 px-4">No</td>
                      <td className="text-center py-3 px-4">Often yes</td>
                      <td className="text-center py-3 px-4 bg-primary/5">Yes (when signed)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Includes scope</td>
                      <td className="text-center py-3 px-4">Minimal</td>
                      <td className="text-center py-3 px-4">Some</td>
                      <td className="text-center py-3 px-4 bg-primary/5">Detailed</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Includes value pitch</td>
                      <td className="text-center py-3 px-4">No</td>
                      <td className="text-center py-3 px-4">No</td>
                      <td className="text-center py-3 px-4 bg-primary/5">Yes</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Typical length</td>
                      <td className="text-center py-3 px-4">1 paragraph</td>
                      <td className="text-center py-3 px-4">1 page</td>
                      <td className="text-center py-3 px-4 bg-primary/5">2-10 pages</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Close rate</td>
                      <td className="text-center py-3 px-4">Low</td>
                      <td className="text-center py-3 px-4">Medium</td>
                      <td className="text-center py-3 px-4 bg-primary/5 font-semibold text-green-600">High</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* What Is an Estimate */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">What Is an Estimate?</h2>
              <p>
                An estimate is a rough approximation of what something might cost. It&apos;s non-binding and subject to change.
              </p>

              <h3 className="text-2xl font-semibold mt-8 mb-4">When to Use Estimates</h3>
              <ul className="space-y-2">
                <li>Early in the sales process (before full discovery)</li>
                <li>When scope is unclear</li>
                <li>When client just wants a ballpark</li>
                <li>For complex projects that need investigation</li>
              </ul>

              <h3 className="text-2xl font-semibold mt-8 mb-4">What to Include</h3>
              <ul className="space-y-2">
                <li>Approximate price range</li>
                <li>Key assumptions</li>
                <li>Major caveats</li>
                <li>Note that it&apos;s not binding</li>
              </ul>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Example Estimate</h3>
              <Card className="my-6 bg-muted/50">
                <CardContent className="pt-6">
                  <p className="mb-4">
                    Based on our brief conversation, a project like this typically runs between $8,000-$15,000 depending on complexity. This is a rough estimate—I&apos;d need to understand more about your specific requirements before providing a firm quote.
                  </p>
                  <p className="mb-2 font-medium">The final price will depend on:</p>
                  <ul className="space-y-1 mb-4">
                    <li>Number of pages/screens</li>
                    <li>Custom functionality required</li>
                    <li>Timeline and revisions</li>
                  </ul>
                  <p className="mb-0">Would you like to schedule a discovery call to discuss details?</p>
                </CardContent>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Estimate Pros and Cons</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-green-600">Pros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>Quick to provide</li>
                      <li>No commitment</li>
                      <li>Filters unqualified leads (sticker shock early)</li>
                      <li>Starts the conversation</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">Cons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>Doesn&apos;t close deals</li>
                      <li>Can anchor price low</li>
                      <li>No mechanism for acceptance</li>
                      <li>Lacks persuasive elements</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* What Is a Quote */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">What Is a Quote?</h2>
              <p>
                A quote (or quotation) is a fixed price offer for a defined scope of work. It&apos;s typically binding for a stated period.
              </p>

              <h3 className="text-2xl font-semibold mt-8 mb-4">When to Use Quotes</h3>
              <ul className="space-y-2">
                <li>Straightforward, well-defined projects</li>
                <li>Repeat/standard work</li>
                <li>When client just needs price (relationship already established)</li>
                <li>Competitive bidding situations</li>
                <li>Physical products or standardized services</li>
              </ul>

              <h3 className="text-2xl font-semibold mt-8 mb-4">What to Include</h3>
              <ul className="space-y-2">
                <li>Fixed price (not a range)</li>
                <li>Scope of work (itemized)</li>
                <li>What&apos;s included/excluded</li>
                <li>Validity period</li>
                <li>Payment terms</li>
                <li>Any conditions</li>
              </ul>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Example Quote</h3>
              <Card className="my-6 bg-muted/50">
                <CardContent className="pt-6 font-mono text-sm">
                  <pre className="whitespace-pre-wrap">
{`QUOTE #2026-001
Date: January 7, 2026
Valid Until: January 28, 2026

Prepared for: Acme Corp

Project: Website Homepage Redesign

Scope:
- Homepage design (desktop + mobile)
- 2 rounds of revisions
- Final files (Figma + PNG exports)

Not Included:
- Interior pages
- Development/coding
- Stock photography

Investment: $3,500

Payment: 50% deposit, 50% on delivery
Timeline: 2 weeks from deposit

To accept: Sign below or reply "Approved"

________________________
Signature/Date`}
                  </pre>
                </CardContent>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Quote Pros and Cons</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-green-600">Pros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>Clear and direct</li>
                      <li>Easy to compare</li>
                      <li>Binding (protection for both sides)</li>
                      <li>Quick to produce</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">Cons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>No persuasion or selling</li>
                      <li>Easy to commoditize</li>
                      <li>Focuses on price over value</li>
                      <li>Limited differentiation</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* What Is a Proposal */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">What Is a Proposal?</h2>
              <p>
                A proposal is a sales document that explains the client&apos;s problem, offers a solution, and asks for the business. It combines pricing with persuasion.
              </p>

              <h3 className="text-2xl font-semibold mt-8 mb-4">When to Use Proposals</h3>
              <ul className="space-y-2">
                <li>New client relationships</li>
                <li>Complex or high-value projects</li>
                <li>Competitive situations where you need to differentiate</li>
                <li>When you need to justify pricing</li>
                <li>When multiple stakeholders will review</li>
              </ul>

              <h3 className="text-2xl font-semibold mt-8 mb-4">What to Include</h3>
              <ol className="space-y-2">
                <li><strong>Executive summary</strong> - Problem, solution, outcome</li>
                <li><strong>Problem statement</strong> - Show you understand their situation</li>
                <li><strong>Proposed solution</strong> - What you&apos;ll do and why</li>
                <li><strong>Methodology</strong> - How you&apos;ll do it</li>
                <li><strong>Timeline</strong> - When they&apos;ll see results</li>
                <li><strong>Investment</strong> - Pricing with context</li>
                <li><strong>Social proof</strong> - Why they should trust you</li>
                <li><strong>Terms</strong> - Payment, scope, conditions</li>
                <li><strong>Next steps</strong> - How to accept</li>
                <li><strong>Signature block</strong> - Capture acceptance</li>
              </ol>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Example Proposal Structure</h3>
              <Card className="my-6 bg-muted/50">
                <CardContent className="pt-6 font-mono text-sm">
                  <pre className="whitespace-pre-wrap">
{`PROPOSAL: Website Redesign for Acme Corp

EXECUTIVE SUMMARY
Acme Corp's website converts 1.2% of visitors—half the industry
average. This proposal outlines a redesign project targeting 3%
conversion, generating an estimated $180K in additional annual
revenue. Investment: $25,000.

THE CHALLENGE
[Their specific situation and pain points...]

OUR SOLUTION
[What you'll do and why it will work...]

APPROACH
[Your methodology and process...]

TIMELINE
[Phases and milestones...]

INVESTMENT
[Pricing with options...]

WHY US
[Credentials, case studies, testimonials...]

NEXT STEPS
1. Sign this proposal
2. Submit 50% deposit
3. Kickoff call within 5 business days

ACCEPTANCE
[Signature block...]`}
                  </pre>
                </CardContent>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Proposal Pros and Cons</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-green-600">Pros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>Sells and closes</li>
                      <li>Differentiates from competitors</li>
                      <li>Justifies premium pricing</li>
                      <li>Builds confidence and trust</li>
                      <li>Higher close rates</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">Cons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>Takes more time</li>
                      <li>Can be overkill for small projects</li>
                      <li>May feel &quot;too formal&quot; for casual relationships</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* When Each Format Wins */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">When Each Format Wins</h2>

              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Use an ESTIMATE When:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      <li>Client asks &quot;ballpark?&quot;</li>
                      <li>You haven&apos;t had a real discovery conversation</li>
                      <li>Scope is too vague to price</li>
                      <li>You&apos;re qualifying the lead</li>
                    </ul>
                    <p className="font-medium text-primary">Goal: Start a conversation, not close a deal.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Use a QUOTE When:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      <li>Work is standardized/repeatable</li>
                      <li>Client knows exactly what they want</li>
                      <li>You have an existing relationship</li>
                      <li>They explicitly asked for a quote</li>
                      <li>It&apos;s transactional, not consultative</li>
                    </ul>
                    <p className="font-medium text-primary">Goal: Provide clear pricing for a defined scope.</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary">
                  <CardHeader>
                    <CardTitle>Use a PROPOSAL When:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      <li>It&apos;s a new client</li>
                      <li>Project is $5K+ (or whatever&apos;s significant for you)</li>
                      <li>You&apos;re competing for the work</li>
                      <li>You need to justify your pricing</li>
                      <li>Multiple stakeholders will review</li>
                      <li>The work requires explanation</li>
                    </ul>
                    <p className="font-medium text-primary">Goal: Win the business and close the deal.</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* The Business Impact */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">The Business Impact</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Format</th>
                      <th className="text-center py-3 px-4 font-medium">Typical Close Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Estimate only</td>
                      <td className="text-center py-3 px-4">15-20%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Quote</td>
                      <td className="text-center py-3 px-4">30-40%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Full proposal</td>
                      <td className="text-center py-3 px-4 font-semibold text-green-600">45-55%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Proposal + follow-up</td>
                      <td className="text-center py-3 px-4 font-semibold text-green-600">60-70%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-6 text-muted-foreground">
                The extra effort of writing proposals pays off in higher win rates—especially for larger projects where the dollar value justifies the time investment.
              </p>
            </section>

            {/* Hybrid Approaches */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">Hybrid Approaches</h2>

              <h3 className="text-2xl font-semibold mt-8 mb-4">The Quick Proposal</h3>
              <p className="mb-4">
                For smaller projects, combine quote efficiency with proposal elements:
              </p>
              <ul className="space-y-2">
                <li>1 page max</li>
                <li>Brief problem statement</li>
                <li>Clear deliverables</li>
                <li>Single price</li>
                <li>One testimonial</li>
                <li>Signature line</li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                Takes 15 minutes instead of an hour, but closes better than a plain quote.
              </p>

              <h3 className="text-2xl font-semibold mt-8 mb-4">The Phased Approach</h3>
              <p className="mb-4">For complex projects:</p>
              <ol className="space-y-2">
                <li><strong>Discovery phase</strong> - Small paid engagement to define scope</li>
                <li><strong>Detailed proposal</strong> - Full scope and pricing based on discovery</li>
              </ol>
              <p className="mt-4 text-muted-foreground">
                This reduces risk for both parties and ensures accurate pricing.
              </p>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Quote + Proposal Hybrid</h3>
              <Card className="my-6 bg-muted/50">
                <CardContent className="pt-6">
                  <pre className="whitespace-pre-wrap text-sm">
{`QUOTE & PROPOSAL

Dear [Name],

Thanks for the great conversation about your website needs.

THE OPPORTUNITY
[1-2 sentences about their situation]

WHAT WE'LL DO
[Bulleted scope]

INVESTMENT
$X,XXX

TIMELINE
X weeks

WHY US
[1-2 sentences + testimonial]

NEXT STEPS
Reply "Approved" or sign below to begin.

________________________`}
                  </pre>
                </CardContent>
              </Card>
            </section>

            {/* Common Mistakes */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">Common Mistakes</h2>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mistake 1: Using Quotes When You Should Propose</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      If you&apos;re competing for work, a plain quote puts you at a disadvantage against competitors sending proposals.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mistake 2: Over-Engineering Small Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      A 10-page proposal for a $500 project wastes everyone&apos;s time. Match effort to opportunity size.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mistake 3: Treating Estimates as Binding</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Be clear: &quot;This estimate is not a quote. Final pricing will be provided after we discuss requirements in detail.&quot;
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mistake 4: Letting Clients Define the Format</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2">Client: &quot;Just send me a quick quote.&quot;</p>
                    <p>
                      You: &quot;Happy to! I find clients appreciate a brief proposal that outlines exactly what&apos;s included and what results to expect. I&apos;ll have it to you by tomorrow.&quot;
                    </p>
                    <p className="mt-4 font-medium">Control the format when possible.</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Making the Transition */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">Making the Transition</h2>
              <p className="mb-6">
                If you&apos;ve been sending quotes and want to switch to proposals:
              </p>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Start simple:</h3>
              <ol className="space-y-2">
                <li>Add an executive summary (3 sentences)</li>
                <li>Add one case study or testimonial</li>
                <li>Add a clear next steps section</li>
              </ol>
              <p className="mt-4 text-muted-foreground">
                That&apos;s it. You now have a basic proposal that will close better than a quote.
              </p>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Then iterate:</h3>
              <ul className="space-y-2">
                <li>Add more detail to each section</li>
                <li>Include multiple pricing options</li>
                <li>Add methodology/process</li>
                <li>Polish the design</li>
              </ul>
            </section>

            {/* Tools for Each Format */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">Tools for Each Format</h2>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estimates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>Email (just type it)</li>
                      <li>Notion/Google Docs</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quotes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>Invoice software (FreshBooks, QuickBooks)</li>
                      <li>Simple PDF</li>
                      <li>Email with clear formatting</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary">
                  <CardHeader>
                    <CardTitle className="text-lg">Proposals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li><strong>OpenProposal</strong> - Full proposal + e-signature + payment</li>
                      <li>PandaDoc</li>
                      <li>Proposify</li>
                      <li>Google Docs/Canva (manual signatures)</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* What Clients Actually Want */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">What Clients Actually Want</h2>
              <p className="mb-6">
                Clients don&apos;t really care whether you call it a quote, proposal, or estimate. They want:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">1. Clarity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>What exactly will they get?</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">2. Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Why should they trust you?</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">3. Price</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>How much will it cost?</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">4. Ease</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>How do they say yes?</p>
                  </CardContent>
                </Card>
              </div>

              <p className="mt-6 text-muted-foreground">
                Whatever format you use, make sure it answers these questions clearly.
              </p>
            </section>

            {/* CTA Section */}
            <section className="my-12">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="py-12 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Stop Leaving Money on the Table
                  </h2>
                  <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                    Switch from quotes to proposals and watch your close rates climb.
                  </p>
                  <div className="space-y-4">
                    <p className="text-primary-foreground/80">
                      <strong>OpenProposal</strong> makes it easy:
                    </p>
                    <ul className="space-y-2 text-left max-w-md mx-auto text-primary-foreground/90">
                      <li>✓ Create proposals in minutes (not hours)</li>
                      <li>✓ Include e-signatures for instant acceptance</li>
                      <li>✓ Collect payment when they sign</li>
                      <li>✓ Track views and engagement</li>
                      <li>✓ Win more deals</li>
                    </ul>
                    <div className="pt-4">
                      <Button size="lg" variant="secondary" asChild>
                        <Link href="https://sendprop.com">
                          Try OpenProposal Free
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Summary */}
            <section className="my-12">
              <h2 className="text-3xl font-bold mb-6">Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Need</th>
                      <th className="text-left py-3 px-4 font-medium">Use This</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Ballpark for early conversation</td>
                      <td className="py-3 px-4">Estimate</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Fixed price for defined work</td>
                      <td className="py-3 px-4">Quote</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Win new clients and close deals</td>
                      <td className="py-3 px-4 font-semibold text-primary">Proposal</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-6 text-lg font-medium">
                When in doubt, propose. The extra effort pays off in higher win rates and better client relationships.
              </p>
            </section>

            <div className="text-sm text-muted-foreground text-center mt-12">
              <p>Last updated: January 2026</p>
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
