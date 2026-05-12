import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | CHAIN_DETECTIVE",
  description: "Terms of Service for CHAIN_DETECTIVE — a Web3 ARG on Monad Testnet.",
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
