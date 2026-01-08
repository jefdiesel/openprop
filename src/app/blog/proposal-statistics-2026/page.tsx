import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp, Clock, Target, Users, Zap, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "47 Proposal Statistics You Need to Know [2026 Data] - OpenProposal",
  description:
    "The latest data on proposal win rates, response times, and what separates top performers from the rest. Benchmark your proposal process with 2026 industry statistics.",
  openGraph: {
    title: "47 Proposal Statistics You Need to Know [2026 Data]",
    description:
      "The latest data on proposal win rates, response times, and what separates top performers from the rest.",
  },
};

const keyStats = [
  { label: "Average proposal win rate", value: "45%" },
  { label: "Top performers' win rate", value: "75%+" },
  { label: "Average time to write a proposal", value: "25 hours" },
  { label: "24-hour proposals close rate boost", value: "+60%" },
  { label: "Additional deals won with software", value: "+43/year" },
];

export default function ProposalStatistics2026Page() {
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

      <main className="container max-w-4xl py-12">
        {/* Article Header */}
        <article>
          <div className="mb-8">
            <Badge className="mb-4">Industry Research</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              47 Proposal Statistics You Need to Know [2026 Data]
            </h1>
            <p className="text-xl text-muted-foreground">
              The latest data on proposal win rates, response times, and what separates top performers from the rest.
            </p>
          </div>

          <div className="border-t border-b py-8 my-8">
            <p className="text-lg leading-relaxed">
              How does your proposal process compare to the best in the business?
            </p>
            <p className="text-lg leading-relaxed mt-4">
              We compiled the latest proposal and RFP statistics from industry surveys to help you benchmark your performance and identify opportunities for improvement.
            </p>
          </div>

          {/* Key Stats at a Glance */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Key Proposal Statistics at a Glance</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {keyStats.map((stat, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Proposal Win Rate Statistics */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Proposal Win Rate Statistics</h2>

            <h3 className="text-2xl font-semibold mb-4">Average Win Rates</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Metric</th>
                    <th className="text-left py-3 px-4 font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Overall average win rate</td>
                    <td className="py-3 px-4 font-semibold">45%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Top performer win rate</td>
                    <td className="py-3 px-4 font-semibold text-green-600">75%+</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Bottom performer win rate</td>
                    <td className="py-3 px-4 font-semibold">40%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Solicited proposals</td>
                    <td className="py-3 px-4 font-semibold">47%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Unsolicited proposals</td>
                    <td className="py-3 px-4 font-semibold">18%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              <strong>Source:</strong> RAIN Group, Loopio RFP Benchmark Report 2025
            </p>

            <h3 className="text-2xl font-semibold mb-4">Win Rates by Company Size</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Company Size</th>
                    <th className="text-left py-3 px-4 font-medium">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Enterprise (5000+ employees)</td>
                    <td className="py-3 px-4 font-semibold">49%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Mid-Market (500-4999)</td>
                    <td className="py-3 px-4 font-semibold">46%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Small Business (50-499)</td>
                    <td className="py-3 px-4 font-semibold">45%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Small (under 50)</td>
                    <td className="py-3 px-4 font-semibold">42%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mb-8">
              Larger companies win more often, but not by as much as you&apos;d think. Process matters more than size.
            </p>

            <h3 className="text-2xl font-semibold mb-4">Win Rates by Industry</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Industry</th>
                    <th className="text-left py-3 px-4 font-medium">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Non-Profit/Government</td>
                    <td className="py-3 px-4 font-semibold">50%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Healthcare</td>
                    <td className="py-3 px-4 font-semibold">47%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Financial Services</td>
                    <td className="py-3 px-4 font-semibold">46%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Professional Services</td>
                    <td className="py-3 px-4 font-semibold">45%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Manufacturing</td>
                    <td className="py-3 px-4 font-semibold">44%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Technology/Software</td>
                    <td className="py-3 px-4 font-semibold">38%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mb-8">
              Tech companies have the lowest win rate despite (or because of?) high volume.
            </p>
          </section>

          {/* Proposal Response Time Statistics */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Proposal Response Time Statistics</h2>

            <h3 className="text-2xl font-semibold mb-4">Time Spent on Proposals</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Metric</th>
                    <th className="text-left py-3 px-4 font-medium">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Average time to complete a proposal</td>
                    <td className="py-3 px-4 font-semibold">25 hours</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Top performers&apos; average time</td>
                    <td className="py-3 px-4 font-semibold">29 hours</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Bottom performers&apos; average time</td>
                    <td className="py-3 px-4 font-semibold">21 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mb-8">
              Counterintuitive: top performers spend MORE time per proposal, but win significantly more often. Quality over quantity.
            </p>

            <h3 className="text-2xl font-semibold mb-4">Speed to Send</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Time to Send</th>
                    <th className="text-left py-3 px-4 font-medium">Impact on Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Within 24 hours</td>
                    <td className="py-3 px-4 font-semibold text-green-600">+60% higher close rate</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Within 48 hours</td>
                    <td className="py-3 px-4 font-semibold text-green-600">+40% higher close rate</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Within 1 week</td>
                    <td className="py-3 px-4 font-semibold">Baseline</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Over 1 week</td>
                    <td className="py-3 px-4 font-semibold text-red-600">-25% lower close rate</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mb-8">
              Speed matters. A good proposal today beats a perfect proposal next week.
            </p>

            <h3 className="text-2xl font-semibold mb-4">Response Rate by Follow-Up</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Follow-Up Strategy</th>
                    <th className="text-left py-3 px-4 font-medium">Response Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">No follow-up</td>
                    <td className="py-3 px-4 font-semibold">18%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">1 follow-up</td>
                    <td className="py-3 px-4 font-semibold">35%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">2-3 follow-ups</td>
                    <td className="py-3 px-4 font-semibold">50%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">4+ follow-ups</td>
                    <td className="py-3 px-4 font-semibold text-green-600">65%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mb-8">
              Most deals are won (or lost) in the follow-up.
            </p>
          </section>

          {/* Proposal Volume Statistics */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Proposal Volume Statistics</h2>

            <h3 className="text-2xl font-semibold mb-4">Annual Proposal Volume</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Company Size</th>
                    <th className="text-left py-3 px-4 font-medium">Proposals Per Year</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Enterprise</td>
                    <td className="py-3 px-4 font-semibold">266</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Mid-Market</td>
                    <td className="py-3 px-4 font-semibold">186</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Small Business</td>
                    <td className="py-3 px-4 font-semibold">142</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Average (all sizes)</td>
                    <td className="py-3 px-4 font-semibold">153</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-2xl font-semibold mb-4">Volume Trends</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-8">
              <li>Organizations respond to 153 proposals per year on average (down from 175)</li>
              <li>Companies are becoming more selective about which opportunities to pursue</li>
              <li>Win rates have increased as volume decreased (quality over quantity)</li>
            </ul>
          </section>

          {/* Proposal Software Statistics */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Proposal Software Statistics</h2>

            <h3 className="text-2xl font-semibold mb-4">Adoption Rates</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Metric</th>
                    <th className="text-left py-3 px-4 font-medium">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Companies using proposal software</td>
                    <td className="py-3 px-4 font-semibold">47%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Top performers using proposal software</td>
                    <td className="py-3 px-4 font-semibold text-green-600">69%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Bottom performers using proposal software</td>
                    <td className="py-3 px-4 font-semibold">23%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-2xl font-semibold mb-4">Impact of Proposal Software</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Metric</th>
                    <th className="text-left py-3 px-4 font-medium">With Software</th>
                    <th className="text-left py-3 px-4 font-medium">Without Software</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Proposals completed per year</td>
                    <td className="py-3 px-4 font-semibold text-green-600">196</td>
                    <td className="py-3 px-4">153</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Average win rate</td>
                    <td className="py-3 px-4 font-semibold text-green-600">51%</td>
                    <td className="py-3 px-4">42%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Time to create proposal</td>
                    <td className="py-3 px-4 font-semibold text-green-600">18 hours</td>
                    <td className="py-3 px-4">32 hours</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Client response time</td>
                    <td className="py-3 px-4 font-semibold text-green-600">3 days</td>
                    <td className="py-3 px-4">7 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Card className="bg-primary/5 border-primary/20 mb-8">
              <CardContent className="pt-6">
                <p className="font-semibold mb-2">Teams using proposal software:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Complete <strong>43 more proposals</strong> per year</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Win <strong>9% more often</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Spend <strong>44% less time</strong> per proposal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Get responses <strong>2x faster</strong></span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Proposal Content Statistics */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Proposal Content Statistics</h2>

            <h3 className="text-2xl font-semibold mb-4">What Clients Read First</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Section</th>
                    <th className="text-left py-3 px-4 font-medium">% Read First</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Pricing</td>
                    <td className="py-3 px-4 font-semibold">42%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Executive Summary</td>
                    <td className="py-3 px-4 font-semibold">28%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Scope/Deliverables</td>
                    <td className="py-3 px-4 font-semibold">18%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Timeline</td>
                    <td className="py-3 px-4 font-semibold">7%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">About Us</td>
                    <td className="py-3 px-4 font-semibold">5%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mb-8">
              <strong>Takeaway:</strong> Make your pricing easy to find and your executive summary compelling.
            </p>

            <h3 className="text-2xl font-semibold mb-4">Proposal Length</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Length</th>
                    <th className="text-left py-3 px-4 font-medium">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">1-2 pages</td>
                    <td className="py-3 px-4 font-semibold">38%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">3-5 pages</td>
                    <td className="py-3 px-4 font-semibold text-green-600">48%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">6-10 pages</td>
                    <td className="py-3 px-4 font-semibold">45%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">11-20 pages</td>
                    <td className="py-3 px-4 font-semibold">42%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">20+ pages</td>
                    <td className="py-3 px-4 font-semibold">35%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mb-8">
              The sweet spot is 3-5 pages for most proposals. Long enough to be thorough, short enough to be read.
            </p>

            <h3 className="text-2xl font-semibold mb-4">Elements That Increase Win Rates</h3>
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Element</th>
                    <th className="text-left py-3 px-4 font-medium">Impact on Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Case studies/social proof</td>
                    <td className="py-3 px-4 font-semibold text-green-600">+27%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Multiple pricing options</td>
                    <td className="py-3 px-4 font-semibold text-green-600">+22%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Clear ROI calculation</td>
                    <td className="py-3 px-4 font-semibold text-green-600">+19%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Digital signatures</td>
                    <td className="py-3 px-4 font-semibold text-green-600">+18%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Custom (not templated) content</td>
                    <td className="py-3 px-4 font-semibold text-green-600">+15%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Video content</td>
                    <td className="py-3 px-4 font-semibold text-green-600">+12%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Interactive elements</td>
                    <td className="py-3 px-4 font-semibold text-green-600">+10%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Pricing Statistics */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Pricing Statistics</h2>

            <h3 className="text-2xl font-semibold mb-4">Pricing Strategy Performance</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Strategy</th>
                    <th className="text-left py-3 px-4 font-medium">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Value-based pricing</td>
                    <td className="py-3 px-4 font-semibold text-green-600">52%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Tiered pricing (3 options)</td>
                    <td className="py-3 px-4 font-semibold">48%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Single price</td>
                    <td className="py-3 px-4 font-semibold">42%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Hourly/time-based</td>
                    <td className="py-3 px-4 font-semibold">38%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-2xl font-semibold mb-4">Option Selection (When 3 Tiers Offered)</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Tier</th>
                    <th className="text-left py-3 px-4 font-medium">Selection Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Premium (highest)</td>
                    <td className="py-3 px-4 font-semibold">22%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Standard (middle)</td>
                    <td className="py-3 px-4 font-semibold text-green-600">56%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Basic (lowest)</td>
                    <td className="py-3 px-4 font-semibold">22%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mb-8">
              Most clients pick the middle option. Structure your tiers accordingly.
            </p>

            <h3 className="text-2xl font-semibold mb-4">Discount Requests</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-8">
              <li>67% of clients ask for a discount</li>
              <li>23% of sellers hold firm on price</li>
              <li>Sellers who hold firm and reduce scope maintain 3x higher margins</li>
            </ul>
          </section>

          {/* E-Signature Statistics */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">E-Signature Statistics</h2>

            <h3 className="text-2xl font-semibold mb-4">E-Signature Impact</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Metric</th>
                    <th className="text-left py-3 px-4 font-medium">Paper Signatures</th>
                    <th className="text-left py-3 px-4 font-medium">E-Signatures</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Average time to sign</td>
                    <td className="py-3 px-4">5.2 days</td>
                    <td className="py-3 px-4 font-semibold text-green-600">0.5 days</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Completion rate</td>
                    <td className="py-3 px-4">78%</td>
                    <td className="py-3 px-4 font-semibold text-green-600">94%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Cost per signature</td>
                    <td className="py-3 px-4">$8.00</td>
                    <td className="py-3 px-4 font-semibold text-green-600">$0.50</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Card className="bg-primary/5 border-primary/20 mb-6">
              <CardContent className="pt-6">
                <p className="font-semibold mb-2">Proposals with e-signatures close:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span><strong>10x faster</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>21% more often</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>At <strong>94% lower cost</strong></span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <h3 className="text-2xl font-semibold mb-4">E-Signature Adoption</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-8">
              <li>89% of businesses now accept e-signatures</li>
              <li>72% prefer e-signatures over paper</li>
              <li>Legal in 180+ countries</li>
            </ul>
          </section>

          {/* Follow-Up Statistics */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Follow-Up Statistics</h2>

            <h3 className="text-2xl font-semibold mb-4">Follow-Up Frequency</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Number of Follow-Ups</th>
                    <th className="text-left py-3 px-4 font-medium">Deals Closed</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">0</td>
                    <td className="py-3 px-4 font-semibold">2%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">1</td>
                    <td className="py-3 px-4 font-semibold">8%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">2</td>
                    <td className="py-3 px-4 font-semibold">15%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">3</td>
                    <td className="py-3 px-4 font-semibold">25%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">4</td>
                    <td className="py-3 px-4 font-semibold">35%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">5+</td>
                    <td className="py-3 px-4 font-semibold text-green-600">80%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mb-8">
              <strong>80% of deals require 5+ follow-ups.</strong> Most salespeople give up after 2.
            </p>

            <h3 className="text-2xl font-semibold mb-4">Best Time to Follow Up</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Day</th>
                    <th className="text-left py-3 px-4 font-medium">Response Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Monday</td>
                    <td className="py-3 px-4 font-semibold">22%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Tuesday</td>
                    <td className="py-3 px-4 font-semibold text-green-600">28%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Wednesday</td>
                    <td className="py-3 px-4 font-semibold">26%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Thursday</td>
                    <td className="py-3 px-4 font-semibold">24%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Friday</td>
                    <td className="py-3 px-4 font-semibold">15%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Weekend</td>
                    <td className="py-3 px-4 font-semibold">5%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mb-8">
              Tuesday morning is the best time for proposal follow-ups.
            </p>

            <h3 className="text-2xl font-semibold mb-4">Follow-Up Channel Effectiveness</h3>
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Channel</th>
                    <th className="text-left py-3 px-4 font-medium">Response Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Phone call</td>
                    <td className="py-3 px-4 font-semibold text-green-600">34%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Email</td>
                    <td className="py-3 px-4 font-semibold">28%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">LinkedIn message</td>
                    <td className="py-3 px-4 font-semibold">19%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Text message</td>
                    <td className="py-3 px-4 font-semibold">18%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mb-8">
              Phone still wins, but most people only email.
            </p>
          </section>

          {/* Top Performer Insights */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Top Performer Insights</h2>

            <h3 className="text-2xl font-semibold mb-4">What Top Performers Do Differently</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Practice</th>
                    <th className="text-left py-3 px-4 font-medium">Top Performers</th>
                    <th className="text-left py-3 px-4 font-medium">Average Performers</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Use proposal software</td>
                    <td className="py-3 px-4 font-semibold text-green-600">69%</td>
                    <td className="py-3 px-4">35%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Include case studies</td>
                    <td className="py-3 px-4 font-semibold text-green-600">94%</td>
                    <td className="py-3 px-4">61%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Customize each proposal</td>
                    <td className="py-3 px-4 font-semibold text-green-600">88%</td>
                    <td className="py-3 px-4">52%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Follow up 3+ times</td>
                    <td className="py-3 px-4 font-semibold text-green-600">91%</td>
                    <td className="py-3 px-4">44%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Send within 24 hours</td>
                    <td className="py-3 px-4 font-semibold text-green-600">78%</td>
                    <td className="py-3 px-4">34%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Use e-signatures</td>
                    <td className="py-3 px-4 font-semibold text-green-600">85%</td>
                    <td className="py-3 px-4">48%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Track proposal opens</td>
                    <td className="py-3 px-4 font-semibold text-green-600">76%</td>
                    <td className="py-3 px-4">29%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Include video</td>
                    <td className="py-3 px-4 font-semibold text-green-600">42%</td>
                    <td className="py-3 px-4">12%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-2xl font-semibold mb-4">Time Allocation (Top Performers)</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Activity</th>
                    <th className="text-left py-3 px-4 font-medium">% of Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Discovery/understanding needs</td>
                    <td className="py-3 px-4 font-semibold">35%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Customization</td>
                    <td className="py-3 px-4 font-semibold">25%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Pricing strategy</td>
                    <td className="py-3 px-4 font-semibold">20%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Writing/formatting</td>
                    <td className="py-3 px-4 font-semibold">15%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Review/polish</td>
                    <td className="py-3 px-4 font-semibold">5%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mb-8">
              Top performers spend more time understanding the client and less time on formatting.
            </p>
          </section>

          {/* Key Takeaways */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Key Takeaways</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Zap className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Speed wins</p>
                      <p className="text-sm text-muted-foreground">Proposals sent within 24 hours close 60% more often</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Users className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Follow up relentlessly</p>
                      <p className="text-sm text-muted-foreground">80% of deals require 5+ touches</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Use software</p>
                      <p className="text-sm text-muted-foreground">Teams with proposal tools win 9% more often</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Target className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Keep it focused</p>
                      <p className="text-sm text-muted-foreground">3-5 pages is the sweet spot</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Show proof</p>
                      <p className="text-sm text-muted-foreground">Case studies increase win rates by 27%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Offer options</p>
                      <p className="text-sm text-muted-foreground">Tiered pricing boosts close rates by 22%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Go digital</p>
                      <p className="text-sm text-muted-foreground">E-signatures close 21% more deals, 10x faster</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="mb-12">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="py-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Improve Your Proposal Win Rate
                </h2>
                <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                  Join the 69% of top performers using proposal software.
                </p>
                <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                  <strong>OpenProposal</strong> helps you send proposals faster, track when they&apos;re opened,
                  get e-signatures instantly, collect payment on signing, and win more deals.
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

          {/* Data Sources */}
          <div className="text-sm text-muted-foreground border-t pt-8">
            <p>
              <em>
                Data sources: Loopio RFP Benchmark Report, RAIN Group Sales Research, DocuSign Business Impact Study,
                Proposify State of Proposals Report. Last updated January 2026.
              </em>
            </p>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} OpenProposal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
