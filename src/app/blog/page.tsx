import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "The SendProp Blog - Resources for Winning More Business",
  description:
    "Learn how to write winning proposals, close more deals, and grow your business with our comprehensive guides and templates.",
  openGraph: {
    title: "The SendProp Blog - Resources for Winning More Business",
    description:
      "Learn how to write winning proposals, close more deals, and grow your business with our comprehensive guides and templates.",
  },
};

const blogPosts = [
  {
    slug: "business-proposal-template",
    title: "Business Proposal Template: Free Download + Complete Guide [2026]",
    description:
      "Download our free business proposal template and learn how to create professional proposals that win clients. Includes step-by-step guide and examples.",
  },
  {
    slug: "freelance-proposal-template",
    title: "Freelance Proposal Template: Win More Clients [Free Template]",
    description:
      "Get our proven freelance proposal template used by successful freelancers to win high-paying clients. Free download with customizable sections.",
  },
  {
    slug: "consulting-proposal-template",
    title: "Consulting Proposal Template: Land High-Ticket Clients [2026]",
    description:
      "Win more consulting contracts with our professional consulting proposal template. Includes pricing strategies and persuasive frameworks.",
  },
  {
    slug: "how-to-write-winning-proposal",
    title: "How to Write a Winning Business Proposal [Step-by-Step Guide]",
    description:
      "Master the art of proposal writing with our comprehensive guide. Learn the exact framework used by top consultants to close deals consistently.",
  },
  {
    slug: "proposal-statistics-2026",
    title: "47 Proposal Statistics You Need to Know [2026 Data]",
    description:
      "Discover the latest proposal statistics and benchmarks. Learn what separates winning proposals from rejected ones with data-backed insights.",
  },
  {
    slug: "how-to-get-clients-to-pay-faster",
    title: "How to Get Clients to Pay Faster: 12 Proven Strategies",
    description:
      "Tired of chasing payments? Learn 12 proven strategies to get clients to pay invoices faster and improve your cash flow immediately.",
  },
  {
    slug: "web-design-proposal-template",
    title: "Web Design Proposal Template: Win More Design Projects [Free Template]",
    description:
      "Download our free web design proposal template that helps designers showcase their value and close more projects at higher rates.",
  },
  {
    slug: "marketing-proposal-template",
    title: "Marketing Proposal Template: Win Agency Clients [Free Template]",
    description:
      "Land more marketing clients with our proven proposal template. Includes scope of work examples and pricing frameworks for agencies.",
  },
  {
    slug: "why-proposals-get-rejected",
    title: "15 Reasons Your Proposals Get Rejected (And How to Fix Them)",
    description:
      "Stop losing deals. Discover the most common reasons proposals get rejected and learn exactly how to fix them to increase your win rate.",
  },
  {
    slug: "proposal-vs-quote-vs-estimate",
    title: "Proposal vs Quote vs Estimate: What's the Difference?",
    description:
      "Confused about the difference between proposals, quotes, and estimates? Learn when to use each and how they impact your sales process.",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            SendProp
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Button asChild>
              <Link href="/login">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container py-16 md:py-24 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              The SendProp Blog
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Resources for winning more business. Learn how to write proposals that close deals,
            get paid faster, and grow your revenue.
          </p>
        </section>

        {/* Blog Posts Grid */}
        <section className="container pb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{post.description}</CardDescription>
                    <span className="text-primary text-sm font-medium inline-flex items-center">
                      Read more <ArrowRight className="ml-1 h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SendProp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
