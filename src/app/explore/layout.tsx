import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intel Feed — Live Block Explorer",
  description:
    "Monitor live Monad Testnet transactions in real time. Decode calldata, identify ARG contract interactions, and surface hidden clues embedded in on-chain activity.",
  alternates: { canonical: "/explore" },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
