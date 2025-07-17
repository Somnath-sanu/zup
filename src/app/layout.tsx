import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ZUP | AI-Powered Project Collaboration",
    template: "%s | ZUP",
  },
  description: "ZUP is an AI-powered platform for seamless project collaboration, code sharing, and productivity.",
  keywords: [
    "AI",
    "project collaboration",
    "code sharing",
    "productivity",
    "Next.js",
    "ZUP"
  ],
  metadataBase: new URL("https://zup-tau.vercel.app"),
  openGraph: {
    title: "ZUP | AI-Powered Project Collaboration",
    description: "ZUP is an AI-powered platform for seamless project collaboration, code sharing, and productivity.",
    url: "https://zup-tau.vercel.app",
    siteName: "ZUP",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "ZUP Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZUP | AI-Powered Project Collaboration",
    description: "ZUP is an AI-powered platform for seamless project collaboration, code sharing, and productivity.",
    images: ["/logo.svg"],
    creator: "https://x.com/sanu7326_mishra",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
    appearance={{
      variables: {
        colorPrimary: ""
      }
    }}
    >
      <TRPCReactProvider>
        <html lang="en" suppressHydrationWarning>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#18181b" />
            <link rel="icon" href="/favicon.ico" />
            {/* SEO: fallback meta tags for crawlers */}
            <meta name="description" content="ZUP is an AI-powered platform for seamless project collaboration, code sharing, and productivity." />
            <meta property="og:title" content="ZUP | AI-Powered Project Collaboration" />
            <meta property="og:description" content="ZUP is an AI-powered platform for seamless project collaboration, code sharing, and productivity." />
            <meta property="og:image" content="/logo.svg" />
            <meta property="og:url" content="https://zup-tau.vercel.app" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="ZUP | AI-Powered Project Collaboration" />
            <meta name="twitter:description" content="ZUP is an AI-powered platform for seamless project collaboration, code sharing, and productivity." />
            <meta name="twitter:image" content="/logo.svg" />
          </head>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <Toaster />
              {children}
            </ThemeProvider>
          </body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
