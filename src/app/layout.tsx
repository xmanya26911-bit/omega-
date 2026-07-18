import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const display = Hanken_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const APP_URL = "https://omega-nine-weld.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Ω OMEGA — THE OMEGA AI Operating System",
  description:
    "Omega is a cinematic AI operating system. Intelligence at every layer — a living digital environment engineered for depth, motion, and craft.",
  keywords: [
    "Omega",
    "AI Operating System",
    "AI",
    "cinematic",
    "motion",
    "WebGL",
    "AI agent",
    "multi-agent",
    "DeepSeek",
    "reasoning engine",
  ],
  authors: [{ name: "Omega" }],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Ω OMEGA — THE OMEGA AI Operating System",
    description:
      "A cinematic AI operating system. Intelligence at every layer — living, deep, intelligent.",
    type: "website",
    url: APP_URL,
    siteName: "OMEGA",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OMEGA — The OMEGA AI Operating System",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ω OMEGA — THE OMEGA AI Operating System",
    description:
      "A cinematic AI operating system. Intelligence at every layer — living, deep, intelligent.",
    images: ["/og-image.png"],
    creator: "@omega",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
