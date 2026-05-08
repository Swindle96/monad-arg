import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CHAIN_DETECTIVE — On-Chain ARG on Monad Testnet",
  description: "The clues are hidden in the blockchain. Solve cryptographic puzzles and claim the prize pool.",
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CHAIN_DETECTIVE",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://chaindetective.xyz",
  applicationCategory: "Game",
  operatingSystem: "Web",
  description: "An on-chain alternate reality game running on Monad Testnet.",
  genre: "Alternate Reality Game",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const STEPS = [
  {
    num: "01",
    title: "Study the brief",
    desc: "Each case is a cryptographic or algorithmic puzzle. Read the brief, research the answer.",
  },
  {
    num: "02",
    title: "Commit sealed",
    desc: "Hash your answer with a random nonce and submit on-chain. The mempool sees only a hash — your answer stays hidden.",
  },
  {
    num: "03",
    title: "Wait 10 blocks",
    desc: "Monad's 500ms blocks pass in ~5 seconds. The seal matures.",
  },
  {
    num: "04",
    title: "Break the seal",
    desc: "Reveal your answer. The contract verifies it matches your commitment and awards the point.",
  },
];

const STATS = [
  { label: "PUZZLES",  value: "100"    },
  { label: "PROTOCOL", value: "COMMIT·REVEAL" },
  { label: "NETWORK",  value: "MONAD TESTNET" },
  { label: "BLOCK TIME", value: "500 MS" },
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "calc(100svh - 56px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "0 24px",
          maxWidth: "1280px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Vertical accent line */}
        <div
          style={{
            position: "absolute",
            left: "24px",
            top: 0,
            bottom: 0,
            width: "1px",
            background: "linear-gradient(to bottom, var(--purple) 0%, transparent 60%)",
            opacity: 0.3,
          }}
          aria-hidden="true"
        />

        {/* Top kicker */}
        <div
          style={{ paddingTop: "clamp(40px, 8vh, 80px)" }}
          className="reveal-up"
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              border: "1px solid var(--purple-border)",
              background: "var(--purple-dim)",
              marginBottom: "clamp(32px, 6vh, 64px)",
            }}
          >
            <span
              className="dot dot-green"
              style={{ width: "6px", height: "6px" }}
              aria-hidden="true"
            />
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.62rem",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "var(--purple)",
              }}
            >
              LIVE ON MONAD TESTNET
            </span>
          </div>
        </div>

        {/* Giant headline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1
            className="display-xl reveal-up reveal-up-1"
            style={{
              fontSize: "clamp(3.5rem, 13vw, 10rem)",
              color: "var(--text)",
              marginBottom: "clamp(16px, 3vh, 32px)",
            }}
          >
            DECODE<br />
            <span style={{ color: "var(--purple)" }}>THE</span><br />
            CHAIN
          </h1>

          <p
            className="reveal-up reveal-up-2"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
              color: "var(--text-dim)",
              lineHeight: 1.7,
              maxWidth: "480px",
              marginBottom: "clamp(32px, 5vh, 56px)",
            }}
          >
            An on-chain ARG on Monad Testnet. Solve 100 cryptographic and
            algorithmic puzzles. Every answer is sealed with a commit-reveal
            scheme — the mempool never sees your answer.
          </p>

          <div
            className="reveal-up reveal-up-3"
            style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}
          >
            <Link href="/play" className="btn">
              OPEN CASE FILE →
            </Link>
            <Link href="/leaderboard" className="btn-outline">
              FIELD AGENTS
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="reveal-up reveal-up-4"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1px",
            background: "var(--border)",
            borderTop: "1px solid var(--border)",
            paddingBottom: "0",
            marginTop: "clamp(40px, 8vh, 80px)",
          }}
        >
          {STATS.map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: "var(--bg)",
                padding: "20px 24px",
              }}
            >
              <p className="label" style={{ marginBottom: "6px" }}>{label}</p>
              <p
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                  color: "var(--text)",
                  letterSpacing: "0.02em",
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          padding: "clamp(48px,10vh,100px) 24px",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "clamp(32px, 6vh, 56px)" }}>
          <p className="label-purple" style={{ marginBottom: "12px" }}>
            HOW IT WORKS
          </p>
          <h2
            className="display"
            style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}
          >
            The protocol
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1px",
            background: "var(--border)",
            border: "1px solid var(--border)",
          }}
        >
          {STEPS.map(({ num, title, desc }) => (
            <div
              key={num}
              className="step-card"
              style={{
                padding: "32px 28px",
                position: "relative",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.62rem",
                  letterSpacing: "0.22em",
                  color: "var(--purple)",
                  display: "block",
                  marginBottom: "16px",
                }}
              >
                {num}
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "var(--text)",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "0.875rem",
                  color: "var(--text-dim)",
                  lineHeight: 1.7,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BLOCK ────────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          padding: "clamp(48px,10vh,100px) 24px",
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "32px",
        }}
      >
        <div
          style={{
            display: "inline-block",
            width: "48px",
            height: "48px",
            background: "var(--acid)",
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <h2
          className="display"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", maxWidth: "600px" }}
        >
          The case is open.<br />
          <span style={{ color: "var(--purple)" }}>Are you the detective?</span>
        </h2>
        <Link href="/play" className="btn-acid" style={{ fontSize: "0.8rem" }}>
          START INVESTIGATION →
        </Link>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px",
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            color: "var(--text-faint)",
          }}
        >
          CHAIN_DETECTIVE © 2026 · MONAD TESTNET
        </span>
        <nav aria-label="Footer" style={{ display: "flex", gap: "24px" }}>
          {[
            { href: "/play",        label: "CASE FILES" },
            { href: "/leaderboard", label: "FIELD AGENTS" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="footer-link"
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.18em",
                textDecoration: "none",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
