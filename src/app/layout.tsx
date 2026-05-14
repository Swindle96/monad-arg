import type { Metadata } from "next";
import { JetBrains_Mono, VT323 } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import MatrixRain from "@/components/MatrixRain";
import HudFrame from "@/components/HudFrame";

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const vt323 = VT323({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-crt",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://monad-arg.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CHAIN_DETECTIVE — On-Chain ARG on Monad Testnet",
    template: "%s | CHAIN_DETECTIVE",
  },
  description:
    "An on-chain ARG on Monad Testnet. Decode transactions, solve cryptographic puzzles via commit-reveal, claim the prize pool. Terminal interface, AI-assisted play.",
  keywords: ["ARG", "alternate reality game", "blockchain puzzle", "Monad testnet", "crypto detective", "web3 game", "on-chain", "matrix", "cyberhacking"],
  authors: [{ name: "CHAIN_DETECTIVE" }],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    title: "CHAIN_DETECTIVE — On-Chain ARG on Monad Testnet",
    description: "Decode the chain. Solve cryptographic puzzles on Monad Testnet.",
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
      <body className={`${jetbrainsMono.variable} ${vt323.variable}`}>
        {/* Matrix digital rain — z-index 0, behind everything */}
        <MatrixRain />

        {/* CRT atmosphere — z-index 9996-9998, above content but below modals (9999+) */}
        <div className="vignette" aria-hidden="true" />
        <div className="noise" aria-hidden="true" />
        <div className="scanlines" aria-hidden="true" />

        <a href="#main-content" className="skip-link">Skip to content</a>

        <Providers>
          <ErrorBoundary>
            <HudFrame />
            <Navbar />
            <main id="main-content" style={{ position: "relative", zIndex: 1 }}>
              {children}
            </main>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
