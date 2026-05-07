import Link from "next/link";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

const ConnectButton = dynamic(() => import("@/components/ConnectButton"), { ssr: false });

export const metadata: Metadata = {
  title: "CHAIN_DETECTIVE — On-Chain ARG on Monad Testnet",
  description: "A live anomaly has been detected on-chain. Decode transactions, solve cryptographic puzzles, commit your answer before the mempool sees it, then break the seal.",
  alternates: { canonical: "/" },
};

const AnomalyScene = dynamic(() => import("@/components/AnomalyScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0" style={{ background: "var(--abyss)" }} aria-hidden="true" />,
});

const caseStats = [
  { label: "CASE STATUS",  value: "UNSTABLE",     color: "var(--crimson)" },
  { label: "PROTOCOL",     value: "COMMIT·REVEAL", color: "var(--mono-pale)" },
  { label: "BLOCK DELAY",  value: "10 BLOCKS",     color: "var(--amber)" },
  { label: "NETWORK",      value: "MONAD",         color: "var(--cyan)" },
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
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col overflow-hidden"
        style={{ minHeight: "calc(100svh - 56px)" }}
      >
        {/* 3D scene — full bleed */}
        <div className="absolute inset-0 scene-canvas">
          <AnomalyScene />
        </div>

        {/* Ambient fade layers */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{ height: "45%", background: "linear-gradient(to top, var(--abyss) 20%, transparent)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{ height: "35%", background: "linear-gradient(to bottom, rgba(3,1,8,0.72), transparent)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0"
          style={{ width: "40%", background: "linear-gradient(to left, rgba(3,1,8,0.55), transparent)" }}
          aria-hidden="true"
        />

        {/* Scan sweep */}
        <div className="scan-line" aria-hidden="true" />

        {/* Content frame */}
        <div
          className="relative flex flex-col flex-1 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 py-8"
          style={{ zIndex: 10 }}
        >

          {/* ── Top bar ── */}
          <div className="flex items-center justify-between mb-auto reveal-up">
            <div className="flex items-center gap-3">
              <span className="dot dot-red" style={{ width: "7px", height: "7px" }} aria-hidden="true" />
              <span className="label-case" style={{ fontSize: "0.62rem" }}>
                CASE FILE #0001 · SEASON 01 · MONAD TESTNET
              </span>
            </div>
            <span className="stamp stamp-in hidden sm:inline-block" aria-label="Active Investigation">
              ACTIVE
            </span>
          </div>

          {/* ── Headline — left-aligned, massive ── */}
          <div
            className="flex flex-col py-10 reveal-up reveal-up-1"
            style={{ gap: "1.5rem", maxWidth: "820px" }}
          >
            {/* Kicker */}
            <div className="flex items-center gap-3">
              <div className="wire-amber" style={{ width: "32px", flexShrink: 0 }} aria-hidden="true" />
              <p className="kicker" style={{ color: "var(--amber)", fontSize: "0.72rem", letterSpacing: "0.30em" }}>
                Alternate Reality Game · On-Chain Investigation
              </p>
            </div>

            {/* Main title with glitch */}
            <div className="relative select-none" style={{ display: "inline-block" }}>
              <h1
                className="display-3d"
                style={{ fontSize: "clamp(3.8rem, 13vw, 9.5rem)" }}
              >
                CHAIN
                <span
                  className="block shimmer"
                  style={{ fontSize: "clamp(3.8rem, 13vw, 9.5rem)", lineHeight: 0.88 }}
                >
                  DETECTIVE
                </span>
              </h1>

              {/* Chromatic glitch layers */}
              <h1
                className="display glitch-r pointer-events-none"
                style={{
                  fontSize: "clamp(3.8rem, 13vw, 9.5rem)",
                  color: "var(--amber)",
                  opacity: 0.07,
                  position: "absolute",
                  inset: 0,
                  lineHeight: 0.88,
                }}
                aria-hidden="true"
              >
                CHAIN<span className="block">DETECTIVE</span>
              </h1>
              <h1
                className="display glitch-b pointer-events-none"
                style={{
                  fontSize: "clamp(3.8rem, 13vw, 9.5rem)",
                  color: "var(--cyan)",
                  opacity: 0.07,
                  position: "absolute",
                  inset: 0,
                  lineHeight: 0.88,
                }}
                aria-hidden="true"
              >
                CHAIN<span className="block">DETECTIVE</span>
              </h1>
            </div>

            {/* Description */}
            <p
              className="reveal-up reveal-up-2 text-balance"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "clamp(0.88rem, 1.7vw, 1.02rem)",
                lineHeight: 1.8,
                color: "var(--ink-mid)",
                maxWidth: "500px",
              }}
            >
              A live anomaly has been detected on-chain. Read transaction residue,
              commit your answer before the mempool sees it, wait the block delay,
              then break the seal — and claim the season record.
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap gap-3 reveal-up reveal-up-2">
              <Link href="/play" className="btn">
                OPEN CASE FILE
              </Link>
              <Link href="/leaderboard" className="btn-ghost">
                FIELD AGENTS
              </Link>
            </div>
          </div>

          {/* ── Bottom stats strip ── */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 reveal-up reveal-up-3 mt-auto"
            style={{
              border: "1px solid var(--wire)",
              borderBottom: "none",
            }}
          >
            {caseStats.map(({ label, value, color }, i) => (
              <div
                key={label}
                className="px-5 py-4"
                style={{
                  background: "rgba(3,1,8,0.88)",
                  backdropFilter: "blur(12px)",
                  borderRight: i < 3 ? "1px solid var(--wire)" : "none",
                }}
              >
                <p className="label-mono" style={{ marginBottom: "6px" }}>{label}</p>
                <p
                  style={{
                    fontFamily: "var(--font-special-elite), monospace",
                    fontSize: "0.88rem",
                    letterSpacing: "0.08em",
                    color,
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGENT ID BAND ────────────────────────────────────────── */}
      <section className="p-hot">
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, var(--amber) 25%, var(--mono) 75%, transparent)",
          }}
          aria-hidden="true"
        />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-7 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex-1">
            <p className="label-case" style={{ marginBottom: "7px" }}>
              Agent Identification Required
            </p>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.88rem", lineHeight: 1.65, color: "var(--ink-mid)" }}>
              Connect your wallet to submit evidence on-chain. All answers verified by smart contract.
            </p>
          </div>
          <div className="shrink-0">
            <ConnectButton />
          </div>
        </div>
      </section>

      {/* ── INVESTIGATION PROTOCOL ───────────────────────────────── */}
      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">

          {/* Section header */}
          <div className="flex items-end justify-between mb-10 reveal-up">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="evidence-tag">FIELD PROTOCOL</span>
                <div className="dot dot-amber" style={{ width: "6px", height: "6px" }} aria-hidden="true" />
              </div>
              <h2 className="display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
                Not a game board.
                <span className="block" style={{ color: "var(--amber)" }}>A crime scene.</span>
              </h2>
            </div>
            <div className="hidden lg:flex flex-col items-end gap-2 pb-2">
              <div className="wire-h" style={{ width: "100px" }} />
              <div className="wire-amber" style={{ width: "62px" }} />
            </div>
          </div>

          {/* Card grid */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">

            {/* ── EVIDENCE 01: CALLDATA — 2 cols ── */}
            <article
              className="p-evidence group cursor-default relative reveal-up lg:col-span-2"
              style={{ padding: "32px", animationDelay: "0.1s" }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(212,165,116,0.06), transparent 70%)" }}
                aria-hidden="true"
              />
              <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="evidence-tag">EVIDENCE 01</span>
                    <span className="kicker" style={{ color: "var(--cyan)", fontSize: "0.60rem" }}>CALLDATA</span>
                  </div>
                  <h3
                    className="display"
                    style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)", marginBottom: "14px" }}
                  >
                    Decode the fracture
                  </h3>
                  <div className="wire-amber mb-5" style={{ width: "56px" }} />
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.9rem", lineHeight: 1.78, color: "var(--ink-mid)", maxWidth: "440px" }}>
                    Live transactions leak fragments — hex, method selectors,
                    addresses, payload residue. The interface treats the chain
                    as evidence, not decoration.
                  </p>
                </div>

                {/* Terminal inset */}
                <div
                  className="p-terminal shrink-0 p-4 hidden sm:block vhs flicker"
                  style={{
                    fontFamily: "var(--font-roboto-mono)",
                    lineHeight: 1.9,
                    fontSize: "0.65rem",
                    minWidth: "220px",
                    color: "var(--amber)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <p style={{ color: "var(--ink-trace)" }}>{`// tx.input decoded`}</p>
                  <p>0x3d18b912</p>
                  <p style={{ color: "var(--mono-pale)" }}>000000000000…</p>
                  <p style={{ color: "var(--pink)" }}>de4db33f…</p>
                  <p style={{ marginTop: "6px", color: "var(--crimson)", fontWeight: 700 }}>↳ CLUE DETECTED</p>
                </div>
              </div>
            </article>

            {/* ── EVIDENCE 02: COMMIT ── */}
            <article
              className="p-panel group cursor-default relative overflow-hidden reveal-up"
              style={{ padding: "28px", animationDelay: "0.22s" }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(110,84,255,0.14), transparent 70%)" }}
                aria-hidden="true"
              />
              <div className="flex items-center gap-3 mb-5">
                <span className="evidence-tag" style={{ borderColor: "var(--mono-wire)", color: "var(--mono-pale)", background: "var(--mono-fog)" }}>EVIDENCE 02</span>
                <span className="kicker" style={{ fontSize: "0.60rem" }}>COMMIT</span>
              </div>
              <h3 className="display" style={{ fontSize: "1.35rem", marginBottom: "12px" }}>
                Seal the evidence
              </h3>
              <div className="wire-h mb-5" style={{ width: "48px" }} />
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", lineHeight: 1.72, color: "var(--ink-mid)" }}>
                Submit a commitment first. Your solution stays concealed while
                the network records that you reached the anomaly.
              </p>
              <div className="mt-6 flex items-center gap-2 overflow-hidden">
                <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, var(--mono-wire-hot), transparent)" }} />
                <span
                  style={{
                    fontFamily: "var(--font-roboto-mono)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.12em",
                    color: "var(--mono)",
                    whiteSpace: "nowrap",
                  }}
                >
                  keccak256(ans ‖ addr ‖ nonce)
                </span>
              </div>
            </article>

            {/* ── EVIDENCE 03: REVEAL ── */}
            <article
              className="p-panel group cursor-default relative overflow-hidden reveal-up"
              style={{ padding: "28px", animationDelay: "0.34s" }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(255,142,228,0.10), transparent 70%)" }}
                aria-hidden="true"
              />
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="evidence-tag"
                  style={{ borderColor: "rgba(255,142,228,0.30)", color: "var(--pink)", background: "rgba(255,142,228,0.07)" }}
                >
                  EVIDENCE 03
                </span>
                <span className="kicker" style={{ color: "var(--pink)", fontSize: "0.60rem" }}>REVEAL</span>
              </div>
              <h3 className="display" style={{ fontSize: "1.35rem", marginBottom: "12px" }}>
                Break the seal
              </h3>
              <div className="wire-h mb-5" style={{ width: "48px" }} />
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", lineHeight: 1.72, color: "var(--ink-mid)" }}>
                After the delay, reveal the answer. The contract verifies the
                commitment and writes the solve into the season record.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-1.5">
                {[0.25, 0.55, 1].map((op, i) => (
                  <div key={i} className="rounded-full" style={{ height: "3px", background: `rgba(255,142,228,${op})` }} />
                ))}
              </div>
              <p
                className="label-mono mt-2"
                style={{ color: "rgba(255,142,228,0.50)", letterSpacing: "0.16em" }}
              >
                10 BLOCK DELAY · MANDATORY
              </p>
            </article>

            {/* ── SEASON 01 CTA — full width, holo border ── */}
            <article
              className="p-holo md:col-span-2 lg:col-span-3 relative reveal-up"
              style={{ animationDelay: "0.46s" }}
            >
              <div
                className="p-hot"
                style={{ padding: "28px" }}
              >
                {/* Accent top line */}
                <div
                  className="absolute top-0 left-0 right-0"
                  style={{
                    height: "1px",
                    background: "linear-gradient(90deg, transparent, var(--amber) 28%, var(--mono) 72%, transparent)",
                  }}
                  aria-hidden="true"
                />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="evidence-tag"
                        style={{ borderColor: "rgba(255,174,69,0.35)", color: "var(--orange)", background: "rgba(255,174,69,0.07)" }}
                      >
                        SEASON 01
                      </span>
                      <span className="label-case" style={{ color: "var(--ink-low)" }}>Case Access</span>
                    </div>
                    <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.9rem", lineHeight: 1.72, color: "var(--ink-mid)" }}>
                      Use <span style={{ color: "var(--ink)" }}>Case Files</span> for active puzzles. Use{" "}
                      <span style={{ color: "var(--ink)" }}>Intel Feed</span> when the clue points back
                      to calldata, contracts, or fresh block activity.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 shrink-0">
                    <Link href="/play" className="btn">CASE FILES</Link>
                    <Link href="/leaderboard" className="btn-ghost">FIELD AGENTS</Link>
                  </div>
                </div>
              </div>
            </article>

          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer
        className="px-5 py-8 sm:px-8 lg:px-12"
        style={{ borderTop: "1px solid var(--wire-amber)" }}
      >
        <div className="wire-amber mb-6" />
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="dot dot-amber" style={{ width: "6px", height: "6px" }} aria-hidden="true" />
            <span className="label-case" style={{ color: "var(--ink-low)" }}>CHAIN_DETECTIVE</span>
            <span style={{ color: "var(--wire-amber)" }}>·</span>
            <span className="label-mono">© 2026 · MONAD TESTNET</span>
          </div>
          <nav aria-label="Footer navigation" className="flex gap-6">
            {[
              { href: "/play",        label: "CASE FILES" },
              { href: "/leaderboard", label: "FIELD AGENTS" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="link-amber flex min-h-[44px] items-center"
                style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", letterSpacing: "0.18em" }}
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
