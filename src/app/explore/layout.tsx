import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intel Feed | CHAIN_DETECTIVE",
  description:
    "Live Monad Testnet block activity — watch CHAIN_DETECTIVE game interactions in real time.",
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
