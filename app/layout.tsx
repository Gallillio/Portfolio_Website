import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/scroll-to-top";
import { AchievementsProvider } from "@/lib/achievements-context";
import AchievementNotificationProvider from "@/components/achievement-notification-provider";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { links } from "@/lib/profile-data";
import { NAME, SITE_TITLE, HOME_TITLE, SITE_DESCRIPTION, OG_IMAGE, siteJsonLd } from "@/lib/seo";

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

// The home page's metadata; the other pages build their own with pageMetadata
// (lib/seo.ts). The canonical lives in app/page.tsx, not here, so no page can
// inherit the home page's. The terminal prompt stays as a title suffix.
export const metadata: Metadata = {
  title: HOME_TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL(links.portfolio),
  openGraph: {
    type: "profile",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
    url: links.portfolio,
    siteName: NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
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
        {/* schema.org WebSite and Person, so search engines can tie the site to the LinkedIn and GitHub profiles. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
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
