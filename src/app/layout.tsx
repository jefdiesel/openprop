import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sendprop.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SendProp - Proposals, E-Signatures & Payments in One Workflow",
    template: "%s | SendProp",
  },
  description:
    "Create beautiful proposals with drag-and-drop, get legally binding e-signatures, and collect payments - all in one seamless workflow. No more switching between tools.",
  keywords: [
    "proposal software",
    "e-signature",
    "electronic signature",
    "contract signing",
    "payment collection",
    "invoicing",
    "proposal builder",
    "docusign alternative",
    "pandadoc alternative",
    "digital contracts",
    "business proposals",
  ],
  authors: [{ name: "SendProp" }],
  creator: "SendProp",
  publisher: "SendProp",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "SendProp",
    title: "SendProp - Proposals, E-Signatures & Payments in One Workflow",
    description:
      "Create beautiful proposals with drag-and-drop, get legally binding e-signatures, and collect payments - all in one seamless workflow.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SendProp - Proposals, Signatures & Payments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SendProp - Proposals, E-Signatures & Payments in One Workflow",
    description:
      "Create beautiful proposals with drag-and-drop, get legally binding e-signatures, and collect payments - all in one seamless workflow.",
    images: ["/og-image.png"],
    creator: "@sendprop",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: BASE_URL,
  },
};

// JSON-LD structured data for the organization
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SendProp",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Proposal builder with built-in e-signatures and payment collection",
  url: BASE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free tier available",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "150",
  },
  featureList: [
    "Drag-and-drop proposal builder",
    "Legally binding e-signatures",
    "Integrated payment collection",
    "Team collaboration",
    "Document templates",
    "Blockchain verification",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
