import Link from "next/link";
import dynamic from "next/dynamic";
import { ConnectKitButton } from "connectkit";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CHAIN_DETECTIVE — On-Chain ARG on Monad Testnet",
  description: "A live anomaly has been detected on-chain. Decode transactions, solve cryptographic puzzles, commit your answer before the mempool sees it, then break the seal.",
  alternates: { canonical: "/" },
};

const AnomalyScene = dynamic(() => import("@/components/AnomalyScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#07040f]" aria-hidden="true" />,
});

const caseStats = [
  { label: "CASE STATUS",  value: "UNSTABLE",      accent: "var(--red-alert)" },
  { label: "PROTOCOL",     value: "COMMIT/REVEAL",  accent: "var(--purple-light)" },
  { label: "BLOCK DELAY",  value: "10 BLOCKS",      accent: "var(--amber)" },
  { label: "NETWORK",      value: "MONAD",          accent: "var(--cyan)" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CHAIN_DETECTIVE",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://chaindetective.xyz",
  applicationCategory: "Game",
  operatingSystem: "Web",
  description:
    "An on-chain alternate reality game running on Monad Testnet. Decode transactions, solve cryptographic puzzles, commit your answer before the mempool sees it, then break the seal.",
  genre: "Alternate Reality Game",
  keywords: "ARG, blockchain puzzle, Monad testnet, on-chain game, crypto detective",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function Home() {
  return (
    <div style={{ color: "var(--text)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col overflow-hidden"
        style={{ minHeight: "calc(100svh - 56px)" }}
      >
        <AnomalyScene className="opacity-70" />

        {/* Scan line effect over hero */}
        <div className="scan-anim" aria-hidden="true" />

        {/* Gradient fades */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72" style={{ background: "linear-gradient(to top, #07040f 25%, transparent)" }} aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48"   style={{ background: "linear-gradient(to bottom, rgba(7,4,15,0.65), transparent)" }} aria-hidden="true" />

        {/* Content */}
        <div
          className="relative flex flex-col flex-1 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 py-8"
          style={{ zIndex: 10 }}
        >

          {/* Top bar */}
          <div className="flex items-center justify-between mb-auto reveal-up">
            <div className="flex items-center gap-3">
              {/* Amber pulse dot — evidence found */}
              <span
                className="w-2 h-2 rounded-full amber-pulse shrink-0"
                style={{ background: "var(--amber)", boxShadow: "0 0 10px var(--amber)" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-special-elite), monospace",
                  fontSize: "0.68rem",
                  letterSpacing: "0.26em",
                  color: "var(--text-dim)",
                }}
              >
                CASE FILE #0001 · SEASON 01 · MONAD TESTNET
              </span>
            </div>
            <span
              className="hidden sm:flex items-center gap-2 classified-stamp"
              aria-label="Classification: Active Investigation"
            >
              ACTIVE INVESTIGATION
            </span>
          </div>

          {/* Center — headline */}
          <div className="flex flex-col items-center text-center py-10 reveal-up reveal-up-1" style={{ gap: "1.75rem" }}>
            {/* Case file kicker */}
            <div className="flex items-center gap-3">
              <div className="h-px w-8" style={{ background: "var(--amber)", boxShadow: "0 0 6px var(--amber)" }} />
              <p
                style={{
                  fontFamily: "var(--font-special-elite), monospace",
                  fontSize: "0.75rem",
                  letterSpacing: "0.32em",
                  color: "var(--amber)",
                  textTransform: "uppercase",
                }}
              >
                Alternate Reality Game · On-Chain Investigation
              </p>
              <div className="h-px w-8" style={{ background: "var(--amber)", boxShadow: "0 0 6px var(--amber)" }} />
            </div>

            {/* 3-layer chromatic title */}
            <div className="relative select-none" style={{ display: "inline-block" }}>
              <h1
                className="rift-title-3d"
                style={{ fontSize: "clamp(4rem, 14vw, 10rem)", lineHeight: 0.85 }}
              >
                CHAIN
                <span
                  className="block"
                  style={{
                    color: "#6E54FF",
                    textShadow: "0 0 80px rgba(110,84,255,0.55), 4px 0 0 rgba(133,230,255,0.30), -4px 0 0 rgba(212,165,116,0.30)",
                  }}
                >
                  DETECTIVE
                </span>
              </h1>
              {/* Glitch layers */}
              <h1
                className="rift-title glitch-r pointer-events-none"
                style={{ fontSize: "clamp(4rem, 14vw, 10rem)", lineHeight: 0.85, color: "#D4A574", opacity: 0.08, position: "absolute", inset: 0 }}
                aria-hidden="true"
              >
                CHAIN<span className="block">DETECTIVE</span>
              </h1>
              <h1
                className="rift-title glitch-b pointer-events-none"
                style={{ fontSize: "clamp(4rem, 14vw, 10rem)", lineHeight: 0.85, color: "#85E6FF", opacity: 0.08, position: "absolute", inset: 0 }}
                aria-hidden="true"
              >
                CHAIN<span className="block">DETECTIVE</span>
              </h1>
            </div>

            {/* Description */}
            <p
              className="max-w-lg text-balance reveal-up reveal-up-2"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)",
                lineHeight: 1.75,
                color: "var(--text-muted)",
              }}
            >
              A live anomaly has been detected on-chain. Read transaction residue,
              commit your answer before the mempool sees it, wait the block delay,
              then break the seal — and claim the season record.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 reveal-up reveal-up-2">
              <Link href="/play" className="rift-btn px-9 py-3.5">
                OPEN CASE FILE
              </Link>
              <Link href="/explore" className="rift-btn-ghost px-9 py-3.5">
                MONITOR FEED
              </Link>
            </div>
          </div>

          {/* Bottom stats — evidence tags */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-px mt-auto reveal-up reveal-up-3"
            style={{ background: "rgba(212,165,116,0.12)" }}
          >
            {caseStats.map(({ label, value, accent }) => (
              <div
                key={label}
                className="px-4 py-3"
                style={{ background: "rgba(7,4,15,0.92)", backdropFilter: "blur(12px)" }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-roboto-mono)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.28em",
                    color: "var(--text-dim)",
                    marginBottom: "5px",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-special-elite), monospace",
                    fontSize: "0.85rem",
                    letterSpacing: "0.08em",
                    color: accent,
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WALLET BAND ──────────────────────────────────────────── */}
      <section
        style={{
          background: "rgba(14,9,28,0.97)",
          borderTop: "1px solid rgba(212,165,116,0.18)",
          borderBottom: "1px solid rgba(110,84,255,0.12)",
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
          <div className="flex-1">
            {/* Dossier-style label */}
            <p
              style={{
                fontFamily: "var(--font-special-elite), monospace",
                fontSize: "0.72rem",
                letterSpacing: "0.24em",
                color: "var(--amber)",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}
            >
              Agent Identification Required
            </p>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", lineHeight: 1.65, color: "var(--text-muted)" }}>
              Connect your wallet to submit answers on-chain. All evidence verified by smart contract.
            </p>
          </div>
          <ConnectKitButton />
        </div>
      </section>

      {/* ── INVESTIGATION PROTOCOL ───────────────────────────────── */}
      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">

          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {/* Evidence number marker */}
                <span
                  className="evidence-tag"
                  style={{ fontSize: "0.58rem", letterSpacing: "0.3em" }}
                >
                  FIELD PROTOCOL
                </span>
              </div>
              <h2 className="rift-title" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
                Not a game board.
                <span className="block" style={{ color: "var(--amber)" }}>A crime scene.</span>
              </h2>
            </div>
            <div className="hidden lg:flex flex-col items-end gap-1" style={{ marginBottom: "10px" }}>
              <div className="rift-line" style={{ width: "100px" }} />
              <div style={{ width: "60px", height: "1px", background: "rgba(212,165,116,0.3)" }} />
            </div>
          </div>

          {/* Bento grid */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">

            {/* ── EVIDENCE 01: CALLDATA (spans 2 cols) ── */}
            <article
              className="dossier group cursor-default relative reveal-up lg:col-span-2"
              style={{ borderRadius: "2px", padding: "32px", animationDelay: "0.1s" }}
            >
              {/* Corner fold already added by .dossier::after */}
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(212,165,116,0.06), transparent 65%)" }}
                aria-hidden="true"
              />
              <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                <div>
                  {/* Evidence label */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="evidence-tag">EVIDENCE 01</span>
                    <span
                      style={{
                        fontFamily: "var(--font-roboto-mono)",
                        fontSize: "0.62rem",
                        letterSpacing: "0.22em",
                        color: "var(--cyan)",
                      }}
                    >
                      CALLDATA
                    </span>
                  </div>
                  <h3 className="rift-title" style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)", marginBottom: "14px" }}>
                    Decode the fracture
                  </h3>
                  <div className="rift-line mb-5 w-14" />
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.9rem", lineHeight: 1.75, color: "var(--text-muted)", maxWidth: "440px" }}>
                    Live transactions leak fragments — hex, method selectors,
                    addresses, payload residue. The interface treats the chain
                    as evidence, not decoration.
                  </p>
                </div>

                {/* Terminal panel */}
                <div
                  className="shrink-0 p-4 hidden sm:block vhs-static"
                  style={{
                    background: "rgba(7,4,15,0.95)",
                    border: "1px solid rgba(212,165,116,0.18)",
                    fontFamily: "var(--font-roboto-mono)",
                    lineHeight: 1.9,
                    fontSize: "0.65rem",
                    minWidth: "220px",
                    color: "var(--amber)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Corner fold on terminal */}
                  <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 12px 12px 0", borderColor: `transparent rgba(212,165,116,0.2) transparent transparent` }} aria-hidden="true" />
                  <p style={{ color: "rgba(139,129,169,0.7)" }}>{`// tx.input decoded`}</p>
                  <p style={{ color: "var(--amber)" }}>0x3d18b912</p>
                  <p style={{ color: "var(--purple-light)" }}>000000000000…</p>
                  <p style={{ color: "var(--pink)" }}>de4db33f…</p>
                  <p style={{ marginTop: "6px", color: "var(--red-alert)", fontWeight: 700 }}>↳ CLUE DETECTED</p>
                </div>
              </div>
            </article>

            {/* ── EVIDENCE 02: COMMIT ── */}
            <article
              className="rift-panel group cursor-default relative overflow-hidden reveal-up"
              style={{ borderRadius: "2px", padding: "28px", animationDelay: "0.22s" }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(110,84,255,0.12), transparent 70%)" }}
                aria-hidden="true"
              />
              <div className="flex items-center gap-3 mb-5">
                <span className="evidence-tag">EVIDENCE 02</span>
                <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.62rem", letterSpacing: "0.22em", color: "var(--purple)" }}>COMMIT</span>
              </div>
              <h3 className="rift-title" style={{ fontSize: "1.35rem", marginBottom: "12px" }}>
                Seal the evidence
              </h3>
              <div className="rift-line mb-5 w-12" />
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", lineHeight: 1.7, color: "var(--text-muted)" }}>
                Submit a commitment first. Your solution stays concealed while
                the network records that you reached the anomaly.
              </p>
              <div className="mt-6 flex items-center gap-2 overflow-hidden">
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(110,84,255,0.55), transparent)" }} />
                <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.58rem", letterSpacing: "0.12em", color: "rgba(110,84,255,0.55)", whiteSpace: "nowrap" }}>
                  keccak256(ans ‖ addr ‖ nonce)
                </span>
              </div>
            </article>

            {/* ── EVIDENCE 03: REVEAL ── */}
            <article
              className="rift-panel group cursor-default relative overflow-hidden reveal-up"
              style={{ borderRadius: "2px", padding: "28px", animationDelay: "0.34s" }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(255,142,228,0.09), transparent 70%)" }}
                aria-hidden="true"
              />
              <div className="flex items-center gap-3 mb-5">
                <span className="evidence-tag" style={{ borderColor: "rgba(255,142,228,0.28)", color: "var(--pink)", background: "rgba(255,142,228,0.08)" }}>EVIDENCE 03</span>
                <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.62rem", letterSpacing: "0.22em", color: "var(--pink)" }}>REVEAL</span>
              </div>
              <h3 className="rift-title" style={{ fontSize: "1.35rem", marginBottom: "12px" }}>
                Break the seal
              </h3>
              <div className="rift-line mb-5 w-12" />
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", lineHeight: 1.7, color: "var(--text-muted)" }}>
                After the delay, reveal the answer. The contract verifies the
                commitment and writes the solve into the season record.
              </p>
              {/* Block delay visual */}
              <div className="mt-6 grid grid-cols-3 gap-1.5">
                {[0.25, 0.55, 1].map((op, i) => (
                  <div key={i} className="h-[3px] rounded-full" style={{ background: `rgba(255,142,228,${op})` }} />
                ))}
              </div>
              <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.62rem", letterSpacing: "0.18em", color: "rgba(255,142,228,0.5)", marginTop: "7px" }}>
                10 BLOCK DELAY · MANDATORY
              </p>
            </article>

            {/* ── CASE ACCESS CTA (full width) ── */}
            <article
              className="rift-panel-hot rift-glow-border md:col-span-2 lg:col-span-3 relative overflow-hidden reveal-up"
              style={{ borderRadius: "2px", padding: "28px", animationDelay: "0.46s" }}
            >
              {/* Amber top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, var(--amber) 30%, var(--purple) 70%, transparent)" }}
                aria-hidden="true"
              />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="evidence-tag"
                      style={{ borderColor: "rgba(255,174,69,0.35)", color: "var(--orange)", background: "rgba(255,174,69,0.08)" }}
                    >
                      SEASON 01
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-special-elite), monospace",
                        fontSize: "0.65rem",
                        letterSpacing: "0.22em",
                        color: "var(--text-dim)",
                      }}
                    >
                      Case Access
                    </span>
                  </div>
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.9rem", lineHeight: 1.7, color: "var(--text-muted)" }}>
                    Use <span style={{ color: "var(--text)" }}>Case Files</span> for active puzzles. Use{" "}
                    <span style={{ color: "var(--text)" }}>Intel Feed</span> when the clue points back
                    to calldata, contracts, or fresh block activity.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 shrink-0">
                  <Link href="/play" className="rift-btn px-7 py-3">CASE FILES</Link>
                  <Link href="/leaderboard" className="rift-btn-ghost px-7 py-3">FIELD AGENTS</Link>
                </div>
              </div>
            </article>

          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer
        className="px-5 py-8 sm:px-8 lg:px-12"
        style={{ borderTop: "1px solid rgba(212,165,116,0.12)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              style={{
                fontFamily: "var(--font-special-elite), monospace",
                fontSize: "0.68rem",
                letterSpacing: "0.2em",
                color: "var(--text-dim)",
              }}
            >
              CHAIN_DETECTIVE
            </span>
            <span style={{ color: "var(--amber-border)" }}>·</span>
            <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.62rem", letterSpacing: "0.18em", color: "var(--text-dim)" }}>
              © 2026 · MONAD TESTNET
            </span>
          </div>
          <nav aria-label="Footer navigation" className="flex gap-6">
            {[
              { href: "/play",        label: "CASE FILES" },
              { href: "/explore",     label: "INTEL FEED" },
              { href: "/leaderboard", label: "FIELD AGENTS" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex min-h-[44px] items-center transition-colors duration-200 hover:text-[var(--amber)]"
                style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", letterSpacing: "0.18em", color: "var(--text-dim)" }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>

    </div>
  );
}
