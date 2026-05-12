import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Files — Active Puzzles",
  description:
    "Open the active case file, commit your answer using keccak256 before the mempool sees it, wait the 10-block delay, then reveal and claim the season record.",
  alternates: { canonical: "/play" },
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
