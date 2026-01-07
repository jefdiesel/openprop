import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service - OpenProposal",
  description:
    "OpenProposal Terms of Service. Read our terms and conditions for using our e-signature and proposal software.",
  openGraph: {
    title: "Terms of Service - OpenProposal",
    description:
      "Read our terms and conditions for using our e-signature and proposal software.",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Send className="h-6 w-6" />
            <span className="text-xl font-bold">OpenProposal</span>
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

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Last updated: January 7, 2026
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              These Terms of Service ("Terms") constitute a legally binding agreement between you and OpenProposal ("Company," "we," "us," or "our") concerning your access to and use of the OpenProposal service available at sendprop.com and any related services (collectively, the "Service").
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              OpenProposal is a SaaS platform that enables users to create, send, and manage proposals and documents with e-signature capabilities and integrated payment collection. The Service includes:
            </p>
            <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 mb-4">
              <li>Document creation and editing tools</li>
              <li>Electronic signature functionality</li>
              <li>Document tracking and analytics</li>
              <li>Payment collection integration</li>
              <li>Template management</li>
              <li>Team collaboration features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Account Registration</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              To use the Service, you must create an account. When creating an account, you agree to:
            </p>
            <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 mb-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              You must be at least 18 years old to use the Service. By using the Service, you represent that you meet this age requirement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Acceptable Use Policy</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 mb-4">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Send spam, unsolicited communications, or engage in phishing</li>
              <li>Upload or transmit viruses, malware, or malicious code</li>
              <li>Impersonate any person or entity, or falsely represent affiliation</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use the Service for fraudulent or illegal purposes</li>
              <li>Collect or harvest personal information without consent</li>
              <li>Reverse engineer, decompile, or disassemble the Service</li>
              <li>Use automated systems to access the Service without permission</li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We reserve the right to investigate and take appropriate action against anyone who violates this policy, including removing content, suspending or terminating accounts, and reporting to law enforcement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Intellectual Property Rights</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">Our Intellectual Property</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              The Service and its entire contents, features, and functionality (including but not limited to software, text, designs, graphics, logos, and trademarks) are owned by OpenProposal and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              You may not copy, modify, distribute, sell, or lease any part of our Service without our express written permission. You may not reverse engineer or attempt to extract the source code of our software.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Your Content</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              You retain all rights to the content, documents, and materials you create, upload, or transmit through the Service ("Your Content"). By using the Service, you grant us a limited, non-exclusive, royalty-free license to:
            </p>
            <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 mb-4">
              <li>Store, process, and display Your Content to provide the Service</li>
              <li>Create backup copies for disaster recovery</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              You represent and warrant that you own or have the necessary rights to Your Content and that it does not violate any third-party rights or applicable laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Subscription and Payments</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">Subscription Plans</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We offer various subscription plans with different features and limitations. Subscription fees are billed in advance on a monthly or annual basis and are non-refundable except as required by law or as stated in our refund policy.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Billing</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              By providing payment information, you authorize us to charge the applicable fees to your payment method. You are responsible for maintaining valid payment information. If payment fails, we may suspend or terminate your access to paid features.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Price Changes</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We may change our subscription fees at any time. We will provide you with at least 30 days' notice of any price increases. Your continued use of the Service after the price change constitutes acceptance of the new price.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Cancellation and Refunds</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              You may cancel your subscription at any time from your account settings. Cancellations take effect at the end of the current billing period. We offer a 30-day money-back guarantee for new subscriptions. Contact us at hello@sendprop.com to request a refund within 30 days of your initial purchase.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">E-Signature Functionality</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              Our Service includes electronic signature functionality that may create legally binding agreements. By using this feature, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 mb-4">
              <li>Electronic signatures have the same legal effect as handwritten signatures</li>
              <li>You are responsible for the content of documents you send for signature</li>
              <li>You must ensure signers have the authority and capacity to sign</li>
              <li>You must comply with all applicable laws regarding electronic signatures</li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We provide the technology platform but do not verify the identity of signers or the validity of agreements created through the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              Our Service integrates with third-party services including payment processors (Stripe) and authentication providers (Google OAuth). Your use of these third-party services is subject to their respective terms and conditions and privacy policies. We are not responsible for any third-party services or their content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Disclaimers and Limitation of Liability</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">Disclaimer of Warranties</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Limitation of Liability</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL OPENPROPOSAL, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 mb-4">
              <li>Your access to or use of or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Unauthorized access, use, or alteration of your content</li>
              <li>Any other matter relating to the Service</li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              OUR TOTAL LIABILITY FOR ANY CLAIMS UNDER THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              You agree to indemnify, defend, and hold harmless OpenProposal and its officers, directors, employees, contractors, agents, licensors, and suppliers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Termination</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination:
            </p>
            <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 mb-4">
              <li>Your right to use the Service will immediately cease</li>
              <li>We may delete your account and content after 90 days</li>
              <li>You remain liable for any charges incurred before termination</li>
              <li>All provisions that should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Governing Law and Dispute Resolution</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except that either party may seek injunctive or other equitable relief in any court of competent jurisdiction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Service after changes are posted constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">General Provisions</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">Entire Agreement</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              These Terms constitute the entire agreement between you and OpenProposal regarding the Service and supersede all prior agreements and understandings.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Severability</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Waiver</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term, and our failure to assert any right under these Terms shall not constitute a waiver of such right.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Assignment</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              You may not assign or transfer these Terms or your rights under them without our prior written consent. We may assign these Terms without restriction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg">
              <p className="text-zinc-700 dark:text-zinc-300 mb-2">
                <strong>Email:</strong> hello@sendprop.com
              </p>
              <p className="text-zinc-700 dark:text-zinc-300 mb-2">
                <strong>Service:</strong> OpenProposal
              </p>
              <p className="text-zinc-700 dark:text-zinc-300">
                <strong>Website:</strong> sendprop.com
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              <span className="font-semibold">OpenProposal</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                Terms
              </Link>
              <Link href="mailto:hello@sendprop.com" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                Contact
              </Link>
            </div>
            <div className="text-sm text-zinc-500">
              sendprop.com
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
