import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy - OpenProposal",
  description:
    "OpenProposal Privacy Policy. Learn how we collect, use, and protect your personal information.",
  openGraph: {
    title: "Privacy Policy - OpenProposal",
    description:
      "Learn how we collect, use, and protect your personal information.",
  },
};

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Last updated: January 7, 2026
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              Welcome to OpenProposal ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our e-signature and proposal software service available at sendprop.com.
            </p>
            <p className="text-zinc-700 dark:text-zinc-300">
              By using OpenProposal, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">Personal Information</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 mb-4">
              <li>Name and email address when you create an account</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Profile information you choose to provide</li>
              <li>Company name and business information</li>
              <li>Communications with us, including support requests</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Document and Content Data</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              When you use our service, we store:
            </p>
            <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 mb-4">
              <li>Proposals, documents, and templates you create</li>
              <li>E-signatures and signature data</li>
              <li>Files and images you upload</li>
              <li>Recipient information for documents you send</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Usage Information</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We automatically collect certain information about your device and how you interact with our service:
            </p>
            <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 mb-4">
              <li>Log data (IP address, browser type, pages visited, timestamps)</li>
              <li>Device information (device type, operating system, unique identifiers)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Document viewing and engagement analytics</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Third-Party Authentication</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              If you sign in using Google OAuth or other third-party authentication providers, we receive basic profile information (name, email) as permitted by your privacy settings with those providers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 mb-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send transaction notifications</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues and fraudulent activity</li>
              <li>Personalize and improve your experience</li>
              <li>Send marketing communications (with your consent, where required)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Share Your Information</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We may share your information in the following circumstances:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">With Your Consent</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We share information when you explicitly consent or direct us to share it, such as when you send a proposal to a recipient.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Service Providers</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We work with third-party service providers who perform services on our behalf:
            </p>
            <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 mb-4">
              <li>Stripe for payment processing</li>
              <li>Google OAuth for authentication</li>
              <li>Cloud hosting providers for data storage</li>
              <li>Email service providers for transactional emails</li>
              <li>Analytics providers to help us understand service usage</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Legal Requirements</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We may disclose your information if required by law or in response to valid requests by public authorities, or to protect our rights, privacy, safety, or property.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Business Transfers</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              If we are involved in a merger, acquisition, or sale of assets, your information may be transferred. We will notify you before your information becomes subject to a different privacy policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 mb-4">
              <li>Maintain your session and keep you logged in</li>
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our service</li>
              <li>Improve our service and user experience</li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure cloud storage infrastructure</li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We retain your information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When you delete your account, we will delete or anonymize your personal information within 90 days, except where we are required to retain it by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights and Choices</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 mb-4">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Export:</strong> Receive your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Object:</strong> Object to certain processing of your information</li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              To exercise these rights, please contact us at hello@sendprop.com. We will respond to your request within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. When we transfer your information internationally, we ensure appropriate safeguards are in place to protect your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              Our service is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately so we can delete it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our service after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              If you have questions or concerns about this privacy policy or our data practices, please contact us:
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
