import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "How to Get Clients to Pay Faster: 12 Proven Strategies - OpenProposal",
  description:
    "Stop chasing invoices. These tactics help freelancers and agencies get paid on time—or even upfront. Learn proven strategies to improve cash flow.",
  openGraph: {
    title: "How to Get Clients to Pay Faster: 12 Proven Strategies",
    description:
      "Stop chasing invoices. These tactics help freelancers and agencies get paid on time—or even upfront.",
  },
};

export default function HowToGetClientToPayFasterPage() {
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
            <Badge variant="secondary" className="mb-4">
              Business Tips
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              How to Get Clients to Pay Faster: 12 Proven Strategies
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Stop chasing invoices. These tactics help freelancers and agencies get paid on time—or even upfront.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Last updated: January 2026</span>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <article className="container pb-16">
          <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert max-w-none">
            {/* Introduction */}
            <div className="mb-12">
              <p className="text-lg">
                Late payments are the #1 cash flow killer for freelancers and small businesses.
              </p>
              <p className="text-lg">
                The average small business is owed $84,000 in unpaid invoices at any given time. And 29% of invoices are paid late.
              </p>
              <p className="text-lg">
                But some businesses get paid on time (or early) consistently. Here&apos;s how they do it.
              </p>
            </div>

            {/* Why Clients Pay Late */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Why Clients Pay Late</h2>
              <p className="mb-4">Before fixing the problem, understand the causes:</p>
              <div className="space-y-3">
                <div>
                  <strong>1. They forgot</strong> - Your invoice got buried in their inbox
                </div>
                <div>
                  <strong>2. Cash flow</strong> - They&apos;re managing their own cash timing
                </div>
                <div>
                  <strong>3. Disorganization</strong> - No system for paying vendors
                </div>
                <div>
                  <strong>4. Disputes</strong> - Unhappy with work or confused about charges
                </div>
                <div>
                  <strong>5. No urgency</strong> - No consequence for paying late
                </div>
                <div>
                  <strong>6. Friction</strong> - Payment process is complicated
                </div>
              </div>
              <p className="mt-6 text-lg font-medium">
                Most late payments aren&apos;t malicious—they&apos;re systemic. Fix the system.
              </p>
            </section>

            {/* Strategy 1 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Strategy 1: Get Payment Upfront (Or Partially Upfront)</h2>
              <p className="text-lg mb-4">
                The most reliable way to get paid on time is to get paid before you start.
              </p>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Standard structures:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>50/50:</strong> 50% deposit, 50% on completion</div>
                  <div><strong>40/30/30:</strong> 40% start, 30% midpoint, 30% completion</div>
                  <div><strong>100% upfront:</strong> For smaller projects or new clients</div>
                </CardContent>
              </Card>

              <div className="bg-muted/50 border-l-4 border-primary p-6 rounded-r-lg mb-6">
                <p className="font-medium mb-2">How to introduce it:</p>
                <p className="italic">
                  &quot;I require a 50% deposit to reserve your spot on my calendar. The remaining 50% is due upon completion.&quot;
                </p>
                <p className="mt-4">Frame it as standard practice, not negotiable.</p>
              </div>

              <h3 className="text-2xl font-semibold mb-4">Who Can Require Upfront Payment?</h3>
              <p className="mb-4">Anyone. But it&apos;s especially important for:</p>
              <ul className="space-y-2 mb-4">
                <li>New client relationships</li>
                <li>Clients without established credit</li>
                <li>Projects over 2 weeks</li>
                <li>International clients</li>
              </ul>
              <p className="font-medium">
                The risk of not getting paid always exceeds the risk of asking for a deposit.
              </p>
            </section>

            {/* Strategy 2 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Strategy 2: Make Payment Stupidly Easy</h2>
              <p className="text-lg mb-4">Every friction point costs you money.</p>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Remove friction:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>✓ Accept credit cards (yes, eat the 3% fee)</div>
                  <div>✓ Include payment link directly in invoice</div>
                  <div>✓ Offer multiple payment methods</div>
                  <div>✓ Use one-click payment when possible</div>
                  <div>✓ Auto-save payment methods for recurring clients</div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-4 rounded-lg">
                  <p className="font-semibold text-red-900 dark:text-red-300 mb-2">Bad:</p>
                  <p className="text-red-800 dark:text-red-400">&quot;Please wire payment to account #...&quot;</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                  <p className="font-semibold text-green-900 dark:text-green-300 mb-2">Good:</p>
                  <p className="text-green-800 dark:text-green-400">&quot;Click here to pay by card&quot; [button]</p>
                </div>
              </div>

              <p className="text-lg">
                Clients who can pay in one click pay immediately. Clients who need to find their checkbook pay &quot;eventually.&quot;
              </p>
            </section>

            {/* Strategy 3 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Strategy 3: Invoice Immediately</h2>
              <p className="text-lg mb-6">
                The longer you wait to invoice, the longer you wait to get paid.
              </p>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Invoice triggers:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Project completion:</strong> Invoice same day</div>
                  <div><strong>Milestone completion:</strong> Invoice within 24 hours</div>
                  <div><strong>Monthly retainer:</strong> Invoice on the 1st (or last day of prior month)</div>
                </CardContent>
              </Card>

              <p className="mb-4">Set calendar reminders. Automate if possible.</p>

              <h3 className="text-2xl font-semibold mb-4">The Psychology of Quick Invoicing</h3>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-green-600">When you invoice immediately:</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>✓ The value is fresh in their mind</div>
                    <div>✓ They haven&apos;t moved on mentally</div>
                    <div>✓ They feel obligated while you&apos;re top of mind</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">When you invoice 2 weeks later:</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>✗ They&apos;ve forgotten the details</div>
                    <div>✗ The value feels distant</div>
                    <div>✗ Your invoice competes with newer priorities</div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Strategy 4 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Strategy 4: Shorten Payment Terms</h2>
              <p className="text-lg mb-6">
                &quot;Net 30&quot; is a relic from when checks traveled by mail.
              </p>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Modern payment terms:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Due on receipt:</strong> For small invoices or deposits</div>
                  <div><strong>Net 7:</strong> For project completions</div>
                  <div><strong>Net 14:</strong> For larger invoices</div>
                  <div><strong>Net 30:</strong> Only if client requires it</div>
                </CardContent>
              </Card>

              <p className="text-lg font-medium">
                Shorter terms = faster payment. Most clients pay on the due date regardless of when it is.
              </p>
            </section>

            {/* Strategy 5 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Strategy 5: Build Payment Into Your Proposal</h2>
              <p className="text-lg mb-6">
                The best time to discuss payment is before you start work.
              </p>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Include in every proposal:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>• Payment schedule (deposit, milestones, completion)</div>
                  <div>• Payment methods accepted</div>
                  <div>• Late payment policy</div>
                  <div>• Payment link or instructions</div>
                </CardContent>
              </Card>

              <p className="mb-6">
                When payment terms are agreed upfront, there&apos;s no negotiation when the invoice arrives.
              </p>

              <h3 className="text-2xl font-semibold mb-4">Example Payment Section</h3>

              <div className="bg-muted border rounded-lg p-6 mb-6">
                <p className="text-2xl font-bold mb-4">Investment: $5,000</p>
                <p className="font-semibold mb-2">Payment Schedule:</p>
                <ul className="space-y-2 mb-4">
                  <li>$2,500 deposit to begin (due upon signing)</li>
                  <li>$2,500 upon completion (due within 7 days)</li>
                </ul>
                <p className="mb-2">Payment accepted via credit card or ACH transfer.</p>
                <p className="mb-4">Late payments subject to 1.5% monthly fee.</p>
                <Button>Pay Deposit Now →</Button>
              </div>
            </section>

            {/* Strategy 6 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Strategy 6: Automate Payment Reminders</h2>
              <p className="text-lg mb-6">
                Don&apos;t manually chase every invoice. Set up automatic reminders.
              </p>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Reminder sequence:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Day -3:</strong> Invoice coming due in 3 days</div>
                  <div><strong>Day 0:</strong> Invoice due today</div>
                  <div><strong>Day +3:</strong> Invoice is 3 days overdue</div>
                  <div><strong>Day +7:</strong> Invoice is 7 days overdue (escalate tone)</div>
                  <div><strong>Day +14:</strong> Final notice before collection</div>
                </CardContent>
              </Card>

              <p>
                Most accounting and proposal tools can automate this. If yours can&apos;t, switch tools.
              </p>
            </section>

            {/* Strategy 7 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Strategy 7: Charge Late Fees (And Enforce Them)</h2>
              <p className="text-lg mb-6">
                Late fees work—if clients know you&apos;ll actually charge them.
              </p>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Standard late fees:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>• 1-2% per month (12-24% APR)</div>
                  <div>• Or flat fee ($25-50 per late invoice)</div>
                </CardContent>
              </Card>

              <div className="bg-muted/50 border-l-4 border-primary p-6 rounded-r-lg mb-6">
                <p className="font-medium mb-2">How to implement:</p>
                <ol className="space-y-2 list-decimal list-inside">
                  <li>Include late fee policy in your contract/proposal</li>
                  <li>Warn them at Day +7</li>
                  <li>Add fee at Day +14</li>
                  <li>Actually charge it</li>
                </ol>
              </div>

              <p className="text-lg font-medium">
                The goal isn&apos;t to collect late fees—it&apos;s to motivate on-time payment.
              </p>
            </section>

            {/* Strategy 8 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Strategy 8: Stop Work on Past-Due Accounts</h2>
              <p className="text-lg mb-6">
                No pay, no work. It&apos;s that simple.
              </p>

              <div className="bg-muted/50 border-l-4 border-primary p-6 rounded-r-lg mb-6">
                <p className="font-medium mb-2">Script:</p>
                <p className="italic">
                  &quot;Hi [Name], I noticed invoice #123 is 14 days past due. I&apos;ll need to pause work on the project until this is resolved. Happy to resume as soon as payment is received.&quot;
                </p>
              </div>

              <p className="mb-4">This:</p>
              <ul className="space-y-2">
                <li>✓ Creates urgency</li>
                <li>✓ Establishes boundaries</li>
                <li>✓ Protects you from extending more credit</li>
                <li>✓ Is completely reasonable (they agreed to payment terms)</li>
              </ul>
            </section>

            {/* Strategy 9 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Strategy 9: Offer Early Payment Discounts</h2>
              <p className="text-lg mb-6">
                Flip the psychology: reward good behavior instead of punishing bad behavior.
              </p>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Example:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>• &quot;2/10 Net 30&quot; = 2% discount if paid within 10 days</div>
                  <div>• &quot;Pay today, save 5%&quot;</div>
                  <div>• &quot;Annual payment: 15% discount&quot;</div>
                </CardContent>
              </Card>

              <p>
                Some clients will take advantage of this. The ones who don&apos;t will still pay on normal terms.
              </p>
            </section>

            {/* Strategy 10 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Strategy 10: Qualify Clients Before Working Together</h2>
              <p className="text-lg mb-6">
                Some clients are chronic late payers. Screen them out.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">Warning signs:</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>✗ Excessive price negotiation</div>
                    <div>✗ Resistance to deposits</div>
                    <div>✗ &quot;Pay you when we get paid&quot;</div>
                    <div>✗ Bad reviews from other vendors</div>
                    <div>✗ History of lawsuits</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-green-600">Qualifying questions:</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>• &quot;What&apos;s your typical vendor payment process?&quot;</div>
                    <div>• &quot;Who approves invoices?&quot;</div>
                    <div>• &quot;Is there anything that would delay payment?&quot;</div>
                  </CardContent>
                </Card>
              </div>

              <p className="text-lg font-medium">
                Trust your gut. The headache isn&apos;t worth it.
              </p>
            </section>

            {/* Strategy 11 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Strategy 11: Build Relationships With The Right People</h2>
              <p className="text-lg mb-6">
                The person who hires you isn&apos;t always the person who pays you.
              </p>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Know:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>• Who approves your invoices?</div>
                  <div>• What information does accounting need?</div>
                  <div>• When do they process payments? (Many companies have weekly or bi-weekly payment runs)</div>
                </CardContent>
              </Card>

              <p className="text-lg font-medium">
                Get friendly with accounting. A 2-minute call when you onboard a new client can prevent weeks of chasing later.
              </p>
            </section>

            {/* Strategy 12 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Strategy 12: Use Proposal + Payment Software</h2>
              <p className="text-lg mb-6">
                The ultimate solution: collect payment at the moment they say yes.
              </p>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Integrated workflow:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>1. Client receives proposal</div>
                  <div>2. Client signs electronically</div>
                  <div>3. Client pays deposit immediately</div>
                  <div>4. Work begins</div>
                </CardContent>
              </Card>

              <p className="mb-6">No separate invoice. No waiting. No chasing.</p>

              <p className="text-lg">
                Tools like <strong>OpenProposal</strong> combine proposals, e-signatures, and Stripe payments in one workflow. The client never leaves the document.
              </p>
            </section>

            {/* What To Do When Clients Won't Pay */}
            <section className="mb-12 border-t pt-12">
              <h2 className="text-3xl font-bold mb-6">What To Do When Clients Won&apos;t Pay</h2>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Step 1: Friendly Reminder (Day 1-7)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="italic">
                      &quot;Hi [Name], just a friendly reminder that invoice #123 is due. Let me know if you have any questions!&quot;
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Step 2: Firm Follow-Up (Day 8-14)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="italic">
                      &quot;Hi [Name], invoice #123 is now [X] days overdue. Please process payment at your earliest convenience. Per our agreement, I&apos;ll need to pause ongoing work until this is resolved.&quot;
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Step 3: Final Notice (Day 15-30)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="italic">
                      &quot;Hi [Name], this is a final notice regarding invoice #123, now [X] days past due. If payment isn&apos;t received by [date], I&apos;ll need to pursue collection options and add the agreed late fees.&quot;
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Step 4: Collection (Day 30+)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2">Options:</p>
                    <ul className="space-y-2">
                      <li>• Collection agency (they take 25-50%)</li>
                      <li>• Small claims court (under $10K usually)</li>
                      <li>• Payment plan negotiation</li>
                      <li>• Write off and move on</li>
                    </ul>
                    <p className="mt-4 text-muted-foreground">
                      For amounts under $500, it&apos;s often not worth pursuing. Fire the client and move on.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* The Best Payment System */}
            <section className="mb-12 border-t pt-12">
              <h2 className="text-3xl font-bold mb-6">The Best Payment System</h2>

              <p className="text-2xl font-semibold mb-6">
                Collect payment at proposal acceptance.
              </p>

              <p className="text-lg mb-4">Here&apos;s why:</p>
              <ul className="space-y-2 mb-6 text-lg">
                <li>✓ No chasing invoices</li>
                <li>✓ No cash flow gaps</li>
                <li>✓ Clients expect it (like paying for any other service)</li>
                <li>✓ Signals professionalism</li>
              </ul>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">OpenProposal makes this seamless:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>✓ Professional proposals</div>
                  <div>✓ Built-in e-signatures</div>
                  <div>✓ Stripe payment collection</div>
                  <div>✓ Automatic deposits</div>
                  <div>✓ No per-seat pricing</div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button size="lg" asChild>
                  <Link href="https://sendprop.com">
                    Get Paid Faster
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </section>

            {/* Quick Payment Checklist */}
            <section className="mb-12 border-t pt-12">
              <h2 className="text-3xl font-bold mb-6">Quick Payment Checklist</h2>

              <Card>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <CheckSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Require deposits for new clients</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Invoice within 24 hours of completion</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Use Net 7 or Net 14 terms</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Accept credit cards</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Include payment link in every invoice</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Set up automatic reminders</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>State late fee policy clearly</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Stop work on overdue accounts</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Qualify clients before engaging</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Use proposal software with integrated payments</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </article>

        {/* CTA */}
        <section className="container pb-24">
          <Card className="bg-primary text-primary-foreground max-w-4xl mx-auto">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to get paid faster?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                OpenProposal combines proposals, e-signatures, and payments in one simple workflow.
                Get paid at the moment clients say yes.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/login">Try OpenProposal Free</Link>
              </Button>
            </CardContent>
          </Card>
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
