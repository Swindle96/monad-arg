import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CHAIN_DETECTIVE",
  description: "Privacy Policy for CHAIN_DETECTIVE — a Web3 ARG on Monad Testnet.",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
