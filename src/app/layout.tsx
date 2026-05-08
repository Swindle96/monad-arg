import type { Metadata } from "next";
import { Inter, Roboto_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chaindetective.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CHAIN_DETECTIVE — On-Chain ARG on Monad Testnet",
    template: "%s | CHAIN_DETECTIVE",
  },
  description:
    "The clues are hidden in the blockchain. Decode transactions, solve cryptographic puzzles, and claim the prize pool. An on-chain ARG running on Monad Testnet.",
  keywords: ["ARG", "alternate reality game", "blockchain puzzle", "Monad testnet", "crypto detective", "web3 game", "on-chain"],
  authors: [{ name: "CHAIN_DETECTIVE" }],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    title: "CHAIN_DETECTIVE — On-Chain ARG on Monad Testnet",
    description: "The clues are hidden in the blockchain. Decode transactions, solve puzzles, claim the prize pool.",
    type: "website",
    siteName: "CHAIN_DETECTIVE",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "CHAIN_DETECTIVE",
    description: "The clues are hidden in the blockchain. Find them.",
    creator: "@chaindetective",
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${inter.variable} ${robotoMono.variable}`}>
        <div className="grain" aria-hidden="true" />
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Providers>
          <ErrorBoundary>
            <Navbar />
            <main id="main-content">{children}</main>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
