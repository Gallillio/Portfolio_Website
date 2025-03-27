import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/scroll-to-top";
import { AchievementsProvider } from "@/lib/achievements-context";
import AchievementNotificationProvider from "@/components/achievement-notification-provider";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

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

export const metadata: Metadata = {
  title: "portfolio@Gallillio:~",
  description: "Ahmed Galal Elzeky's Portfolio - AI & Software Engineer",
  metadataBase: new URL("https://gallillio.vercel.app"),
  openGraph: {
    title: "portfolio@Gallillio:~",
    description: "Ahmed Galal Elzeky's Portfolio - AI & Software Engineer",
    images: ["/og-image.png"],
    url: "https://gallillio.vercel.app",
  },
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
