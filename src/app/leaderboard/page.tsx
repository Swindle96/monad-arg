"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

type Entry = { addr: `0x${string}`; score: bigint; puzzlesSolved: bigint };

interface LbApiResponse {
  leaderboard: { addr: string; score: string; puzzlesSolved: string }[];
  playerCount: string;
  season: { name: string; isActive: boolean; prizeWei: string };
}

const mono: React.CSSProperties = { fontFamily: "var(--font-mono), monospace" };

function shorten(addr: string) { return `${addr.slice(0, 8)}…${addr.slice(-6)}`; }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handle(e: React.MouseEvent) {
    e.preventDefault();
    navigator.clipboard.writeText(text)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })
      .catch(() => {});
  }
  return (
    <button
      onClick={handle}
      aria-label={copied ? "Address copied" : "Copy address"}
      aria-live="polite"
      style={{
        background: "none",
        border: "none",
        padding: "6px",
        cursor: "pointer",
        color: copied ? "var(--acid)" : "var(--text-faint)",
        transition: "color 150ms",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "32px",
        minHeight: "32px",
      }}
      onMouseEnter={e => { if (!copied) e.currentTarget.style.color = "var(--text-dim)"; }}
      onMouseLeave={e => { if (!copied) e.currentTarget.style.color = "var(--text-faint)"; }}
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <rect x="4" y="1" width="7" height="8" rx="0.5" stroke="currentColor" strokeWidth="1" />
          <rect x="1" y="3" width="7" height="8" rx="0.5" stroke="currentColor" strokeWidth="1" />
        </svg>
      )}
    </button>
  );
}

function SkeletonRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
      <div style={{ width: "32px", height: "14px", background: "var(--surface)", borderRadius: "2px" }} className="animate-pulse" />
      <div style={{ flex: 1, height: "14px", background: "var(--surface)", borderRadius: "2px" }} className="animate-pulse" />
      <div style={{ width: "60px", height: "14px", background: "var(--surface)", borderRadius: "2px" }} className="animate-pulse" />
    </div>
  );
}

const RANK_STYLES: Record<number, { accent: string; label: string; title: string }> = {
  1: { accent: "#FFD700", label: "1ST", title: "CHIEF DETECTIVE" },
  2: { accent: "#C0C0C0", label: "2ND", title: "SENIOR AGENT" },
  3: { accent: "#CD7F32", label: "3RD", title: "FIELD DETECTIVE" },
};

function PodiumCard({ entry, rank }: { entry: Entry; rank: number }) {
  const { addr, score, puzzlesSolved } = entry;
  const r = RANK_STYLES[rank];
  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${r.accent}33`,
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        transition: "transform 200ms, box-shadow 200ms",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 16px 40px ${r.accent}18`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: r.accent }} aria-hidden="true" />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <span
          style={{
            fontFamily: "var(--font-display), sans-serif",
            fontWeight: 700,
            fontSize: "1.4rem",
            color: r.accent,
            lineHeight: 1,
          }}
        >
          {rank}
        </span>
        <span style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.16em", color: r.accent, opacity: 0.8 }}>
          {r.title}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "16px" }}>
        <span style={{ ...mono, fontSize: "0.82rem", color: "var(--text-dim)" }}>
          {shorten(addr)}
        </span>
        <CopyButton text={addr} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", paddingTop: "16px", borderTop: `1px solid ${r.accent}22` }}>
        <div>
          <p className="label" style={{ marginBottom: "4px" }}>SOLVED</p>
          <p style={{ fontFamily: "var(--font-display), sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "var(--text)" }}>
            {Number(puzzlesSolved)}
          </p>
        </div>
        <div>
          <p className="label" style={{ marginBottom: "4px" }}>SCORE</p>
          <p className="tabular-nums" style={{ fontFamily: "var(--font-display), sans-serif", fontWeight: 700, fontSize: "1.3rem", color: r.accent }}>
            {Number(score).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [data, setData]       = useState<LbApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/leaderboard");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json() as LbApiResponse;
        if (mounted) { setData(json); setIsError(false); }
      } catch {
        if (mounted) setIsError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 30_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const leaderboard = useMemo((): Entry[] | null => {
    if (!data) return null;
    return data.leaderboard
      .map(e => ({
        addr:          e.addr as `0x${string}`,
        score:         BigInt(e.score),
        puzzlesSolved: BigInt(e.puzzlesSolved),
      }))
      .filter(e => e.addr.toLowerCase() !== ZERO_ADDR && e.score > 0n);
  }, [data]);

  const playerCount  = data ? BigInt(data.playerCount) : undefined;
  const seasonName   = data?.season.name   ?? "Season 1";
  const prizeWei     = data ? BigInt(data.season.prizeWei) : 0n;
  const prizeDisplay = prizeWei > 0n ? `${formatEther(prizeWei)} MON` : "0 MON";
  const isActive     = data?.season.isActive ?? true;

  const podiumEntries = leaderboard?.slice(0, 3) ?? [];
  const tableEntries  = leaderboard?.slice(3)    ?? [];

  return (
    <div style={{ minHeight: "100vh", padding: "0 24px", maxWidth: "1280px", margin: "0 auto" }}>

      {/* Back */}
      <div style={{ paddingTop: "32px", marginBottom: "32px" }}>
        <Link
          href="/"
          style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.16em", color: "var(--text-faint)", textDecoration: "none", transition: "color 150ms" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-faint)")}
        >
          ← BACK
        </Link>
      </div>

      {/* Prize hero */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-2)",
          padding: "32px",
          marginBottom: "48px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, var(--purple) 50%, transparent)" }}
          aria-hidden="true"
        />
        <div>
          <p className="label-purple" style={{ marginBottom: "10px" }}>{seasonName} · PRIZE POOL</p>
          <p
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 5vw, 3rem)",
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            {loading ? "—" : prizeDisplay}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              className={isActive ? "dot dot-green" : "dot"}
              style={{ width: "7px", height: "7px", background: isActive ? undefined : "var(--text-faint)" }}
              aria-hidden="true"
            />
            <span style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.14em", color: isActive ? "var(--green)" : "var(--text-dim)" }}>
              {isActive ? "CASE ACTIVE" : "CASE CLOSED"}
            </span>
          </div>
          {playerCount !== undefined && !loading && (
            <span className="label">
              {playerCount.toString()} AGENT{playerCount === 1n ? "" : "S"} ON FILE
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <p className="label-purple" style={{ marginBottom: "8px" }}>FORENSIC REGISTRY</p>
          <h1
            className="display"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            FIELD AGENTS
          </h1>
        </div>
        <span className="label">
          {loading ? "—" : playerCount !== undefined ? `${playerCount} TOTAL` : "—"}
        </span>
      </div>

      <div className="divider" style={{ marginBottom: "32px" }} />

      {/* Content */}
      {isError ? (
        <div style={{ background: "var(--surface)", border: "1px solid rgba(255,59,48,0.25)", padding: "64px 24px", textAlign: "center" }}>
          <p style={{ ...mono, fontSize: "0.72rem", letterSpacing: "0.22em", color: "var(--red)", marginBottom: "8px" }}>RPC CONNECTION FAILED</p>
          <p className="label">Could not reach contract — try again shortly.</p>
        </div>
      ) : loading || leaderboard === null ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : leaderboard.length === 0 ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "80px 24px", textAlign: "center" }}>
          <p style={{ ...mono, fontSize: "0.72rem", letterSpacing: "0.22em", color: "var(--text-dim)", marginBottom: "8px" }}>NO AGENTS ON FILE</p>
          <p className="label" style={{ marginBottom: "32px" }}>Be the first detective to crack a case.</p>
          <Link href="/play" className="btn">OPEN CASE FILE</Link>
        </div>
      ) : (
        <>
          {/* Podium */}
          {podiumEntries.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1px",
                background: "var(--border)",
                border: "1px solid var(--border)",
                marginBottom: "1px",
              }}
            >
              {podiumEntries.map((entry, i) => (
                <PodiumCard key={entry.addr} entry={entry} rank={i + 1} />
              ))}
            </div>
          )}

          {/* Table */}
          {tableEntries.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              {/* Header */}
              <div
                className="hidden sm:grid"
                style={{
                  gridTemplateColumns: "48px 1fr 100px 90px 40px",
                  gap: "16px",
                  padding: "10px 24px",
                  borderBottom: "1px solid var(--border-2)",
                  background: "var(--raised)",
                }}
              >
                {["RANK", "ADDRESS", "CASES", "SCORE", ""].map(h => (
                  <span key={h} className="label">{h}</span>
                ))}
              </div>

              {tableEntries.map(({ addr, score, puzzlesSolved }, idx) => {
                const rank = idx + 4;
                return (
                  <div
                    key={addr}
                    style={{ borderBottom: "1px solid var(--border)", transition: "background 150ms" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--raised)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Desktop */}
                    <div
                      className="hidden sm:grid"
                      style={{ gridTemplateColumns: "48px 1fr 100px 90px 40px", gap: "16px", padding: "14px 24px", alignItems: "center" }}
                    >
                      <span style={{ ...mono, fontSize: "0.72rem", color: "var(--text-faint)", textAlign: "center" }}>{rank}</span>
                      <span style={{ ...mono, fontSize: "0.85rem", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {shorten(addr)}
                      </span>
                      <span className="tabular-nums" style={{ fontFamily: "var(--font-display), sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>
                        {Number(puzzlesSolved)}
                      </span>
                      <span className="tabular-nums" style={{ fontFamily: "var(--font-display), sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "var(--purple)" }}>
                        {Number(score).toLocaleString()}
                      </span>
                      <CopyButton text={addr} />
                    </div>

                    {/* Mobile */}
                    <div className="sm:hidden" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px" }}>
                      <span style={{ ...mono, fontSize: "0.68rem", color: "var(--text-faint)", width: "24px", textAlign: "center", flexShrink: 0 }}>{rank}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", ...mono, fontSize: "0.82rem", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {shorten(addr)}
                        </span>
                        <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                          <span className="label">{Number(puzzlesSolved)} solved</span>
                          <span style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.12em", color: "var(--purple)" }}>
                            {Number(score).toLocaleString()} pts
                          </span>
                        </div>
                      </div>
                      <CopyButton text={addr} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <p className="label" style={{ textAlign: "center", marginTop: "32px", paddingBottom: "48px" }}>
        LIVE ON-CHAIN · {isError ? "—" : seasonName.toUpperCase()} · MONAD TESTNET · REFRESHES EVERY 30S
      </p>
    </div>
  );
}
