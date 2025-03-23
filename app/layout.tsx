import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/scroll-to-top";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "portfolio@Gallillio:~",
  description: "Ahmed Galal Elzeky's Portfolio - AI & Software Engineer",
  // icons: {
  //   icon:['/favicon.ico?v=4'],
  //   apple:['/apple-touch-icon.png?v=4'],
  //   shortcut:['/apple-touch-icon.png'],
  // },
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',  // Enable safe area on modern mobile devices
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
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
