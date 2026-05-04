import type { Metadata } from "next";
import { Inter, Roboto_Mono, Syne } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";

const syne = Syne({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-syne",
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
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CHAIN_DETECTIVE — On-Chain ARG on Monad Testnet",
  description:
    "The clues are hidden in the blockchain. Decode transactions, solve cryptographic puzzles, and claim the prize pool. An on-chain ARG running on Monad Testnet.",
  keywords: ["ARG", "blockchain", "puzzle", "Monad", "crypto", "web3", "detective"],
  openGraph: {
    title: "CHAIN_DETECTIVE",
    description: "The clues are hidden in the blockchain. Find them.",
    type: "website",
    siteName: "CHAIN_DETECTIVE",
  },
  twitter: {
    card: "summary_large_image",
    title: "CHAIN_DETECTIVE",
    description: "The clues are hidden in the blockchain. Find them.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scanlines">
      <body className={`${syne.variable} ${inter.variable} ${robotoMono.variable}`}>
        {/* Fixed background layers — always behind everything */}
        <div className="rift-bg" aria-hidden="true" />
        <div className="rift-grid" aria-hidden="true" />

        <a href="#main-content" className="skip-link">Skip to content</a>

        <Providers>
          <ErrorBoundary>
            <Navbar />
            <main id="main-content">
              {children}
            </main>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
