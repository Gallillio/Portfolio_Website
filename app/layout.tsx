import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/scroll-to-top";
import { AchievementsProvider } from "@/lib/achievements-context";
import AchievementNotificationProvider from "@/components/achievement-notification-provider";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { title, contact } from "@/lib/profile-extras";
import { links } from "@/lib/profile-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',  // Enable safe area on modern mobile devices
};

// The name leads the title: it is what a recruiter searches for and what shows
// in a browser tab or a shared link. The terminal prompt stays as a suffix.
const SITE_TITLE = "Ahmed Galal Elzeky · AI Engineer";
const SITE_DESCRIPTION =
  "AI Engineer in Cairo building enterprise LLM systems: RAG, agents and model routing. Founding engineer on SIA at ISYS, an IBM partner.";

export const metadata: Metadata = {
  title: `${SITE_TITLE} | portfolio@Gallillio:~`,
  description: SITE_DESCRIPTION,
  metadataBase: new URL(links.portfolio),
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    // New filename on purpose: social networks cache preview images by URL.
    images: [{ url: "/og-2026.png", width: 1200, height: 630, alt: SITE_TITLE }],
    url: links.portfolio,
    siteName: "Ahmed Galal Elzeky",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-2026.png"],
  },
  manifest: "/site.webmanifest",
  icons: {
    // For standard favicons in different sizes
    icon: [
      {
        url: '/favicon-16x16.png', // 16×16
        sizes: '16x16',
        type: 'image/png'
      },
      {
        url: '/favicon-32x32.png', // 32×32
        sizes: '32x32',
        type: 'image/png'
      },
      {
        url: '/favicon.ico', // Fallback .ico
        type: 'image/x-icon'
      },
    ],
    // For iOS home screen
    apple: [
      {
        url: '/apple-touch-icon.png', // e.g. 180×180
        sizes: '180x180',
      },
    ],
    // Optional shortcut icon (some browsers use this)
    shortcut: [
      {
        url: '/favicon.ico',
      },
    ],
  },
};

// schema.org Person, so search engines can tie the site to the LinkedIn and GitHub profiles.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ahmed Galal Elzeky",
  alternateName: "Gallillio",
  jobTitle: title,
  url: links.portfolio,
  email: `mailto:${contact.email}`,
  worksFor: { "@type": "Organization", name: "Intelligent Systems (ISYS)" },
  address: { "@type": "PostalAddress", addressLocality: "Cairo", addressCountry: "EG" },
  sameAs: [links.linkedin, links.github, links.credly],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <AchievementsProvider>
          <AchievementNotificationProvider>
            {children}
            <ScrollToTop />
            <SpeedInsights />
            <Analytics />
          </AchievementNotificationProvider>
        </AchievementsProvider>
      </body>
    </html>
  );
}
