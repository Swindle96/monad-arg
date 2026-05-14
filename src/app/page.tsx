import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CHAIN_DETECTIVE — On-Chain ARG on Monad Testnet",
  description: "Decode the chain. Solve cryptographic puzzles. Claim the prize pool.",
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CHAIN_DETECTIVE",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://monad-arg.vercel.app",
  applicationCategory: "Game",
  operatingSystem: "Web",
  description: "An on-chain alternate reality game running on Monad Testnet.",
  genre: "Alternate Reality Game",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const BOOT_LINES = [
  { c: "var(--text-faint)", t: "$ booting cyberintrusion_v4..." },
  { c: "var(--green)",      t: "[ OK ] kernel: linux 6.8.0-monad" },
  { c: "var(--green)",      t: "[ OK ] mounting /chain/monad-testnet/10143" },
  { c: "var(--green)",      t: "[ OK ] loading puzzle_set: 100 ciphers" },
  { c: "var(--green)",      t: "[ OK ] commit-reveal protocol: ACTIVE" },
  { c: "var(--monad)",      t: "[ OK ] rpc handshake: testnet-rpc.monad.xyz" },
  { c: "var(--acid)",       t: "$ session ready. press connect to begin." },
];

const PROTOCOL = [
  { phase: "01", title: "STUDY",   t: "Read the case brief. Each puzzle is a cryptographic, algorithmic, or chain-math riddle. AI assistants welcome." },
  { phase: "02", title: "COMMIT",  t: "Hash answer + your address + random nonce → submit. The mempool only sees the hash. Your answer stays hidden." },
  { phase: "03", title: "WAIT",    t: "Hold 10 blocks (~5s on Monad). The seal matures. Block counter ticks live in the HUD." },
  { phase: "04", title: "REVEAL",  t: "Submit raw answer + nonce. Contract verifies the commitment, awards the point, writes you on-chain." },
];

const STATS = [
  { k: "TOTAL_CASES",  v: "100" },
  { k: "PROTOCOL",     v: "COMMIT·REVEAL" },
  { k: "BLOCK_TIME",   v: "500 ms" },
  { k: "NETWORK",      v: "MONAD" },
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
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "32px 24px 60px",
          position: "relative",
        }}
      >
        {/* Boot terminal */}
        <div
          className="terminal corners reveal-up reveal-up-1"
          style={{ maxWidth: "640px", marginBottom: "clamp(32px, 6vh, 56px)" }}
        >
          <span className="corners-bl" />
          <span className="corners-br" />
          <div className="terminal-head">
            <span>── [ INIT.LOG ] ───────────────</span>
            <span className="tag tag-green">
              <span className="dot dot-green" aria-hidden="true" />
              LIVE
            </span>
          </div>
          <div className="terminal-body" style={{ padding: "16px 20px", fontSize: "0.78rem", lineHeight: 1.85 }}>
            {BOOT_LINES.map((l, i) => (
              <div
                key={i}
                className="reveal-up"
                style={{
                  color: l.c,
                  animationDelay: `${0.1 + i * 0.06}s`,
                  fontFamily: "var(--font-mono), monospace",
                  letterSpacing: "0.02em",
                }}
              >
                {l.t}
              </div>
            ))}
          </div>
        </div>

        {/* Giant headline — VT323 CRT */}
        <h1
          className="display-xl reveal-up reveal-up-2 flicker"
          data-text="DECODE THE CHAIN"
          style={{
            fontSize: "clamp(3.8rem, 14vw, 11rem)",
            marginBottom: "clamp(24px, 4vh, 40px)",
          }}
        >
          <span className="glitch" data-text="DECODE">DECODE</span><br />
          <span style={{ color: "var(--monad)", textShadow: "0 0 12px var(--monad-glow), 0 0 30px rgba(131,110,249,0.45)" }}>
            THE
          </span><br />
          <span className="glitch" data-text="CHAIN">CHAIN</span>
        </h1>

        <p
          className="reveal-up reveal-up-3"
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "clamp(0.95rem, 1.8vw, 1.05rem)",
            color: "var(--text-soft)",
            lineHeight: 1.85,
            maxWidth: "560px",
            marginBottom: "clamp(32px, 5vh, 48px)",
          }}
        >
          // An on-chain ARG on Monad Testnet. <br />
          // 100 cryptographic puzzles. <br />
          // The mempool never sees your answer.
        </p>

        <div
          className="reveal-up reveal-up-4"
          style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center" }}
        >
          <Link href="/play" className="btn-acid">
            ./connect →
          </Link>
          <Link href="/leaderboard" className="btn">
            ls /agents
          </Link>
          <Link href="/explore" className="btn-outline">
            tail -f /chain
          </Link>
        </div>

        {/* Stats strip */}
        <div
          className="reveal-up reveal-up-5"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "1px",
            background: "var(--border-2)",
            border: "1px solid var(--border-2)",
            marginTop: "clamp(48px, 8vh, 80px)",
          }}
        >
          {STATS.map(({ k, v }) => (
            <div
              key={k}
              style={{
                background: "var(--surface)",
                padding: "18px 20px",
              }}
            >
              <p className="label" style={{ marginBottom: "6px", color: "var(--text-faint)" }}>
                {k}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-crt), monospace",
                  fontSize: "clamp(1.2rem, 2.4vw, 1.6rem)",
                  color: "var(--green)",
                  textShadow: "0 0 6px var(--green-glow)",
                  letterSpacing: "0.04em",
                }}
              >
                {v}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROTOCOL ─────────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid var(--border-2)",
          padding: "clamp(60px, 11vh, 110px) 24px",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "clamp(32px, 6vh, 56px)" }}>
          <p className="label-green" style={{ marginBottom: "12px" }}>
            // PROTOCOL.MD
          </p>
          <h2
            className="display"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}
          >
            HOW TO HACK
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1px",
            background: "var(--border-2)",
            border: "1px solid var(--border-2)",
          }}
        >
          {PROTOCOL.map(({ phase, title, t }) => (
            <div
              key={phase}
              style={{
                background: "var(--surface)",
                padding: "32px 28px",
                position: "relative",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.62rem",
                  letterSpacing: "0.22em",
                  color: "var(--monad)",
                  textShadow: "0 0 4px var(--monad-glow)",
                  display: "block",
                  marginBottom: "16px",
                }}
              >
                phase_{phase}
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-crt), monospace",
                  fontSize: "1.8rem",
                  color: "var(--green)",
                  textShadow: "0 0 6px var(--green-glow)",
                  marginBottom: "12px",
                  letterSpacing: "0.04em",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.82rem",
                  color: "var(--text-dim)",
                  lineHeight: 1.75,
                }}
              >
                {t}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid var(--border-2)",
          padding: "clamp(60px, 11vh, 110px) 24px",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        <div
          className="terminal corners"
          style={{ padding: 0 }}
        >
          <span className="corners-bl" />
          <span className="corners-br" />
          <div
            style={{
              padding: "clamp(40px, 7vh, 64px) clamp(28px, 4vw, 56px)",
              display: "flex",
              flexDirection: "column",
              gap: "28px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.72rem",
                color: "var(--green)",
                letterSpacing: "0.16em",
                textShadow: "0 0 4px var(--green-glow)",
              }}
            >
              <span className="cursor">$ exec /cases/001 </span>
            </p>
            <h2
              className="display"
              style={{ fontSize: "clamp(2.2rem, 5.5vw, 4rem)", maxWidth: "740px" }}
            >
              THE CASE IS OPEN.<br />
              <span style={{ color: "var(--monad)", textShadow: "0 0 10px var(--monad-glow)" }}>
                ARE YOU THE DETECTIVE?
              </span>
            </h2>
            <Link href="/play" className="btn-acid" style={{ alignSelf: "flex-start", fontSize: "0.82rem" }}>
              ./begin →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--border-2)",
          padding: "20px 24px",
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
            fontSize: "0.62rem",
            letterSpacing: "0.18em",
            color: "var(--text-faint)",
          }}
        >
          // chain_detective © 2026 · monad testnet · all rights null
        </span>
        <nav aria-label="Footer" style={{ display: "flex", gap: "20px" }}>
          {[
            { href: "/play",        label: "play" },
            { href: "/explore",     label: "explore" },
            { href: "/leaderboard", label: "leaderboard" },
            { href: "/privacy",     label: "privacy" },
            { href: "/terms",       label: "terms" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.62rem",
                letterSpacing: "0.18em",
                color: "var(--text-faint)",
                textTransform: "uppercase",
              }}
              className="chroma"
            >
              ./{label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
