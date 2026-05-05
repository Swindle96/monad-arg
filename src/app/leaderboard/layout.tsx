import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Field Agents — Season Leaderboard",
  description:
    "Track the season standings for CHAIN_DETECTIVE. See which agents cracked the puzzles first, their solve times, and total prize pool claims on Monad Testnet.",
  alternates: { canonical: "/leaderboard" },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
