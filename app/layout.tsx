import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ThemeProvider from "@/components/ThemeProvider";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import BackgroundEffects from "@/components/BackgroundEffects";
import SkipLink from "@/components/ui/SkipLink";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { PostHogProvider } from "./providers";


const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

import { clientEnv } from "@/lib/env";

const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dev Event",
    template: "%s | Dev Event",
  },
  description: "The Hub for Every Dev Event You Can't Miss",
  openGraph: {
    title: "Dev Event",
    description: "The Hub for Every Dev Event You Can't Miss",
    siteName: "Dev Event",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dev Event",
    description: "The Hub for Every Dev Event You Can't Miss",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", schibstedGrotesk.variable, martianMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-screen flex flex-col">
        <AuthSessionProvider>
        <ThemeProvider>
        <ToastProvider>
        <SkipLink />
        <Navbar />
        <BackgroundEffects />
        <PostHogProvider>
          <main id="main-content" className="flex-1">
            {children}
          </main>
        </PostHogProvider>
        <Footer />
        </ToastProvider>
        </ThemeProvider>
        </AuthSessionProvider>
        </body>
    </html>
  );
}
