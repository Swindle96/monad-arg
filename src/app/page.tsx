"use client";

import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import AnomalyScene from "@/components/AnomalyScene";

const heroStats = [
  { label: "SIGNAL",   value: "UNSTABLE" },
  { label: "PROTOCOL", value: "COMMIT/REVEAL" },
  { label: "DELAY",    value: "3 BLOCKS" },
  { label: "NETWORK",  value: "MONAD" },
];

export default function Home() {
  return (
    <div style={{ color: "var(--text)" }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col overflow-hidden"
        style={{ minHeight: "calc(100svh - 56px)" }}
      >
        <AnomalyScene className="opacity-80" />

        {/* Bottom + top gradient fades */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64" style={{ background: "linear-gradient(to top, #07040f 20%, transparent)" }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40" style={{ background: "linear-gradient(to bottom, rgba(7,4,15,0.55), transparent)" }} />

        {/* Content */}
        <div
          className="relative flex flex-col flex-1 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 py-8"
          style={{ zIndex: 10 }}
        >
          {/* Top signal bar */}
          <div className="flex items-center justify-between mb-auto reveal-up">
            <div className="flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full neon-pulse shrink-0"
                style={{ background: "#85E6FF", boxShadow: "0 0 10px #85E6FF" }}
              />
              <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", letterSpacing: "0.28em", color: "var(--text-dim)" }}>
                MONAD TESTNET · SEASON 01
              </span>
            </div>
            <span className="hidden sm:block cursor-blink after:content-['_'] after:inline-block" style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", letterSpacing: "0.22em", color: "var(--text-dim)" }}>
              LIVE SIGNAL ACTIVE
            </span>
          </div>

          {/* Center — headline */}
          <div className="flex flex-col items-center text-center py-10 reveal-up reveal-up-1" style={{ gap: "1.75rem" }}>
            <p className="rift-kicker">Alternate Reality Game</p>

            {/* 3-layer chromatic title */}
            <div className="relative select-none" style={{ display: "inline-block", overflow: "hidden" }}>
              <h1
                className="rift-title-3d"
                style={{ fontSize: "clamp(4rem, 14vw, 10rem)", lineHeight: 0.85 }}
              >
                CHAIN
                <span
                  className="block"
                  style={{
                    color: "#6E54FF",
                    textShadow: "0 0 80px rgba(110,84,255,0.55), 4px 0 0 rgba(133,230,255,0.35), -4px 0 0 rgba(255,142,228,0.35)",
                  }}
                >
                  DETECTIVE
                </span>
              </h1>
              <h1 className="rift-title glitch-r pointer-events-none" style={{ fontSize: "clamp(4rem, 14vw, 10rem)", lineHeight: 0.85, color: "#FF8EE4", opacity: 0.09, position: "absolute", inset: 0 }} aria-hidden="true">
                CHAIN<span className="block">DETECTIVE</span>
              </h1>
              <h1 className="rift-title glitch-b pointer-events-none" style={{ fontSize: "clamp(4rem, 14vw, 10rem)", lineHeight: 0.85, color: "#85E6FF", opacity: 0.09, position: "absolute", inset: 0 }} aria-hidden="true">
                CHAIN<span className="block">DETECTIVE</span>
              </h1>
            </div>

            <p
              className="max-w-lg text-balance reveal-up reveal-up-2"
              style={{ fontFamily: "var(--font-inter)", fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)", lineHeight: 1.75, color: "var(--text-muted)" }}
            >
              Investigate a live on-chain anomaly. Read transaction residue,
              commit the answer, reveal after the block delay, and claim the
              season record before anyone else.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 reveal-up reveal-up-2">
              <Link href="/play" className="rift-btn px-9 py-3.5">
                ENTER ANOMALY
              </Link>
              <Link href="/explore" className="rift-btn-ghost px-9 py-3.5">
                WATCH THE CHAIN
              </Link>
            </div>
          </div>

          {/* Bottom — stats grid pinned to hero bottom */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-px mt-auto reveal-up reveal-up-3"
            style={{ background: "rgba(110,84,255,0.18)" }}
          >
            {heroStats.map(({ label, value }) => (
              <div
                key={label}
                className="px-4 py-3"
                style={{ background: "rgba(7,4,15,0.88)", backdropFilter: "blur(12px)" }}
              >
                <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.62rem", letterSpacing: "0.26em", color: "var(--text-dim)", marginBottom: "5px" }}>
                  {label}
                </p>
                <p style={{ fontFamily: "var(--font-syne)", fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--text)" }}>
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
          background: "rgba(14,9,28,0.96)",
          borderTop: "1px solid rgba(110,84,255,0.22)",
          borderBottom: "1px solid rgba(110,84,255,0.12)",
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
          <div className="flex-1">
            <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.22em", color: "var(--purple)", marginBottom: "6px" }}>
              WALLET HANDSHAKE
            </p>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", lineHeight: 1.65, color: "var(--text-muted)" }}>
              Connect only when ready to submit or reveal. On-chain verification required.
            </p>
          </div>
          <ConnectKitButton />
        </div>
      </section>

      {/* ── BENTO FEATURES ───────────────────────────────────────── */}
      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">

          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="rift-kicker mb-3">Field protocol</p>
              <h2 className="rift-title" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
                Not a game board.
                <span className="block" style={{ color: "#85E6FF" }}>A hostile signal.</span>
              </h2>
            </div>
            <div className="hidden lg:block rift-line" style={{ width: "100px", marginBottom: "10px" }} />
          </div>

          {/* Bento grid */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">

            {/* ── LARGE: CALLDATA (spans 2 cols) ── */}
            <article
              className="rift-panel group cursor-default relative overflow-hidden reveal-up lg:col-span-2"
              style={{ borderRadius: "2px", padding: "32px", animationDelay: "0.1s" }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(133,230,255,0.07), transparent 65%)" }}
              />
              <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                <div>
                  <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", letterSpacing: "0.24em", color: "#85E6FF", marginBottom: "18px" }}>
                    01 / CALLDATA
                  </p>
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
                  className="shrink-0 p-4 hidden sm:block"
                  style={{
                    background: "rgba(7,4,15,0.9)",
                    border: "1px solid rgba(133,230,255,0.18)",
                    fontFamily: "var(--font-roboto-mono)",
                    lineHeight: 1.9,
                    fontSize: "0.65rem",
                    minWidth: "210px",
                    color: "#85E6FF",
                  }}
                >
                  <p style={{ color: "rgba(107,98,133,0.8)" }}>{`// tx.input decoded`}</p>
                  <p>0x3d18b912</p>
                  <p style={{ color: "#DDD7FE" }}>000000000000…</p>
                  <p style={{ color: "#FF8EE4" }}>de4db33f…</p>
                  <p style={{ marginTop: "6px", color: "#FFAE45" }}>↳ CLUE DETECTED</p>
                </div>
              </div>
            </article>

            {/* ── COMMIT ── */}
            <article
              className="rift-panel group cursor-default relative overflow-hidden reveal-up"
              style={{ borderRadius: "2px", padding: "28px", animationDelay: "0.22s" }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(110,84,255,0.12), transparent 70%)" }}
              />
              <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", letterSpacing: "0.24em", color: "#6E54FF", marginBottom: "18px" }}>
                02 / COMMIT
              </p>
              <h3 className="rift-title" style={{ fontSize: "1.35rem", marginBottom: "12px" }}>
                Hide the answer
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

            {/* ── REVEAL ── */}
            <article
              className="rift-panel group cursor-default relative overflow-hidden reveal-up"
              style={{ borderRadius: "2px", padding: "28px", animationDelay: "0.34s" }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(255,142,228,0.09), transparent 70%)" }}
              />
              <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", letterSpacing: "0.24em", color: "#FF8EE4", marginBottom: "18px" }}>
                03 / REVEAL
              </p>
              <h3 className="rift-title" style={{ fontSize: "1.35rem", marginBottom: "12px" }}>
                Break the lock
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
                3 BLOCK DELAY
              </p>
            </article>

            {/* ── SEASON ACCESS CTA (full width) ── */}
            <article
              className="rift-panel-hot rift-glow-border md:col-span-2 lg:col-span-3 relative overflow-hidden reveal-up"
              style={{ borderRadius: "2px", padding: "28px", animationDelay: "0.46s" }}
            >
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <p className="rift-kicker mb-2">Season access</p>
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.9rem", lineHeight: 1.7, color: "var(--text-muted)" }}>
                    Use Play for the active puzzle. Use Explore when the clue
                    points back to calldata, contracts, or fresh block activity.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 shrink-0">
                  <Link href="/play" className="rift-btn px-7 py-3">PLAY</Link>
                  <Link href="/leaderboard" className="rift-btn-ghost px-7 py-3">RANKS</Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer
        className="px-5 py-8 sm:px-8 lg:px-12"
        style={{ borderTop: "1px solid rgba(110,84,255,0.16)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.2em", color: "var(--text-dim)" }}>
            CHAIN_DETECTIVE © 2026 · MONAD TESTNET
          </span>
          <nav aria-label="Footer navigation" className="flex gap-6">
            {[
              { href: "/play",        label: "PLAY" },
              { href: "/explore",     label: "EXPLORE" },
              { href: "/leaderboard", label: "RANKS" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex min-h-[44px] items-center transition-colors duration-200 hover:text-[#6E54FF]"
                style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.18em", color: "var(--text-dim)" }}
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
