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

const RANKS: Record<number, { color: string; bg: string; border: string; label: string; glow: string; title: string }> = {
  1: { color: "var(--amber)",    bg: "rgba(212,165,116,0.07)", border: "rgba(212,165,116,0.35)", label: "1ST", glow: "rgba(212,165,116,0.28)", title: "CHIEF DETECTIVE" },
  2: { color: "var(--mono-pale)", bg: "rgba(221,215,254,0.05)", border: "rgba(221,215,254,0.28)", label: "2ND", glow: "rgba(221,215,254,0.18)", title: "SENIOR AGENT" },
  3: { color: "var(--cyan)",     bg: "rgba(133,230,255,0.05)", border: "rgba(133,230,255,0.28)", label: "3RD", glow: "rgba(133,230,255,0.18)", title: "FIELD DETECTIVE" },
};

const mono: React.CSSProperties = { fontFamily: "var(--font-roboto-mono)" };

function shorten(addr: string) { return `${addr.slice(0, 8)}…${addr.slice(-6)}`; }

/* ── CopyButton ─────────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handle(e: React.MouseEvent) {
    e.preventDefault();
    navigator.clipboard.writeText(text)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })
      .catch(() => { setCopied(false); });
  }
  return (
    <button
      onClick={handle}
      className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors duration-200 cursor-pointer"
      style={{ color: "var(--ink-low)" }}
      aria-label={copied ? "Address copied" : "Copy address"}
      aria-live="polite"
      onMouseEnter={e => (e.currentTarget.style.color = "var(--amber)")}
      onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-low)")}
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 6L5 9L10 3" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <rect x="4" y="1" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
          <rect x="1" y="3" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
        </svg>
      )}
    </button>
  );
}

/* ── SkeletonRow ────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: "1px solid rgba(212,165,116,0.06)" }}>
      <div className="w-8 h-5 rounded animate-pulse" style={{ background: "rgba(212,165,116,0.06)" }} />
      <div className="flex-1 h-4 rounded animate-pulse" style={{ background: "rgba(212,165,116,0.04)" }} />
      <div className="w-16 h-4 rounded animate-pulse" style={{ background: "rgba(212,165,116,0.04)" }} />
      <div className="w-14 h-4 rounded animate-pulse" style={{ background: "rgba(212,165,116,0.04)" }} />
    </div>
  );
}

/* ── EvidenceVault (prize pool hero) ────────────────────────────── */
function EvidenceVault({ loading, seasonName, prizeDisplay, isActive, playerCount, playerCountLoading }: {
  loading: boolean;
  seasonName: string;
  prizeDisplay: string;
  isActive: boolean;
  playerCount: bigint | undefined;
  playerCountLoading: boolean;
}) {
  return (
    <div className="p-evidence relative overflow-hidden mb-3" style={{ backdropFilter: "blur(20px)" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(212,165,116,0.07) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {loading ? (
        <div className="p-6 flex items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-32 rounded animate-pulse" style={{ background: "rgba(212,165,116,0.08)" }} />
            <div className="h-10 w-56 rounded animate-pulse" style={{ background: "rgba(212,165,116,0.06)" }} />
          </div>
        </div>
      ) : (
        <div className="relative p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="label-case" style={{ marginBottom: "10px", color: "rgba(212,165,116,0.6)" }}>
              {seasonName} · Evidence Vault
            </p>
            <p
              className="shimmer"
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 800,
                fontSize: "clamp(2rem, 6vw, 3rem)",
                letterSpacing: "0.06em",
              }}
            >
              {prizeDisplay}
            </p>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-3">
            <span
              className="flex items-center gap-2"
              style={{ ...mono, fontSize: "0.72rem", letterSpacing: "0.16em", color: isActive ? "var(--amber)" : "var(--ink-low)" }}
            >
              <span
                className={isActive ? "dot dot-amber" : "dot"}
                style={{
                  width: "8px",
                  height: "8px",
                  background: isActive ? undefined : "var(--ink-low)",
                }}
                aria-hidden="true"
              />
              {isActive ? "CASE ACTIVE" : "CASE CLOSED"}
            </span>
            {playerCount !== undefined && !playerCountLoading && (
              <span className="label-mono">
                {playerCount.toString()} AGENT{playerCount === 1n ? "" : "S"}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── PodiumSection ──────────────────────────────────────────────── */
function PodiumSection({ entries }: { entries: Entry[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3 mb-4">
      {entries.map(({ addr, score, puzzlesSolved }, idx) => {
        const rank = idx + 1;
        const r    = RANKS[rank];
        return (
          <div
            key={addr}
            className="relative overflow-hidden"
            style={{
              background:   r.bg,
              border:       `1px solid ${r.border}`,
              boxShadow:    `0 0 30px ${r.glow}, 0 20px 60px rgba(0,0,0,0.4)`,
              padding:      "20px",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${r.color}, transparent)` }} aria-hidden="true" />
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${r.glow} 0%, transparent 70%)` }} aria-hidden="true" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span
                  style={{
                    color:            r.color,
                    fontFamily:       "var(--font-syne)",
                    fontSize:         "1rem",
                    fontWeight:       800,
                    width:            "36px",
                    height:           "36px",
                    display:          "flex",
                    alignItems:       "center",
                    justifyContent:   "center",
                    border:           `1px solid ${r.border}`,
                    boxShadow:        `0 0 12px ${r.glow}`,
                  }}
                >
                  {rank}
                </span>
                <span
                  style={{
                    fontFamily:    "var(--font-special-elite), monospace",
                    fontSize:      "0.60rem",
                    letterSpacing: "0.18em",
                    color:         r.color,
                    textTransform: "uppercase",
                    opacity:       0.9,
                  }}
                >
                  {r.title}
                </span>
              </div>

              <div className="flex items-center gap-1 mb-4">
                <span style={{ color: r.color, fontFamily: "var(--font-roboto-mono)", fontSize: "0.82rem", fontWeight: 600 }}>
                  {shorten(addr)}
                </span>
                <CopyButton text={addr} />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3" style={{ borderTop: `1px solid ${r.border}` }}>
                <div>
                  <p className="label-mono" style={{ marginBottom: "3px" }}>SOLVED</p>
                  <p style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.1rem", color: "var(--ink)" }}>
                    {Number(puzzlesSolved)}
                  </p>
                </div>
                <div>
                  <p className="label-mono" style={{ marginBottom: "3px" }}>SCORE</p>
                  <p className="tabular-nums" style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.1rem", color: r.color }}>
                    {Number(score).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── RankingsTable ──────────────────────────────────────────────── */
function RankingsTable({ entries }: { entries: Entry[] }) {
  return (
    <div className="p-panel">
      <div
        className="hidden sm:grid px-5 py-2"
        style={{
          gridTemplateColumns: "52px 1fr 100px 90px 48px",
          gap: "16px",
          borderBottom: "1px solid rgba(212,165,116,0.10)",
          background: "rgba(212,165,116,0.025)",
        }}
      >
        {["RANK", "ADDRESS", "CASES", "SCORE", ""].map(h => (
          <span key={h} className="label-mono">{h}</span>
        ))}
      </div>

      {entries.map(({ addr, score, puzzlesSolved }, idx) => {
        const rank = idx + 4;
        return (
          <div
            key={addr}
            className="transition-colors duration-150"
            style={{ borderBottom: "1px solid rgba(212,165,116,0.06)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(212,165,116,0.03)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            {/* Desktop */}
            <div className="hidden sm:grid px-5 py-3 items-center" style={{ gridTemplateColumns: "52px 1fr 100px 90px 48px", gap: "16px" }}>
              <span style={{ ...mono, fontSize: "0.72rem", color: "var(--ink-low)", width: 32, display: "block", textAlign: "center" }}>{rank}</span>
              <span className="truncate" style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.875rem", color: "var(--ink-mid)" }}>{shorten(addr)}</span>
              <div className="flex items-center gap-1.5">
                <span className="tabular-nums" style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)" }}>{Number(puzzlesSolved)}</span>
                <span className="label-mono">solved</span>
              </div>
              <span className="tabular-nums font-bold" style={{ fontFamily: "var(--font-syne)", fontSize: "0.9rem", color: "var(--amber)" }}>{Number(score).toLocaleString()}</span>
              <CopyButton text={addr} />
            </div>

            {/* Mobile */}
            <div className="sm:hidden px-4 py-3 flex items-center gap-3">
              <span style={{ ...mono, fontSize: "0.72rem", color: "var(--ink-low)", width: 28, flexShrink: 0, textAlign: "center" }}>{rank}</span>
              <div className="flex-1 min-w-0">
                <span className="block truncate" style={{ color: "var(--ink-mid)", fontFamily: "var(--font-roboto-mono)", fontSize: "0.82rem" }}>{shorten(addr)}</span>
                <div className="flex items-center gap-3 mt-1 label-mono">
                  <span>{Number(puzzlesSolved)} solved</span>
                  <span style={{ color: "var(--amber)" }}>{Number(score).toLocaleString()} pts</span>
                </div>
              </div>
              <CopyButton text={addr} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── LeaderboardPage ────────────────────────────────────────────── */
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
        addr:         e.addr as `0x${string}`,
        score:        BigInt(e.score),
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
    <div className="min-h-screen px-4 sm:px-6 py-8">
      <div className="mx-auto max-w-4xl">

        {/* Back link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center min-h-[44px] transition-colors"
            style={{ ...mono, fontSize: "0.72rem", letterSpacing: "0.18em", color: "var(--ink-low)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--amber)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-low)")}
          >
            ← BACK
          </Link>
        </div>

        <EvidenceVault
          loading={loading}
          seasonName={seasonName}
          prizeDisplay={prizeDisplay}
          isActive={isActive}
          playerCount={playerCount}
          playerCountLoading={loading}
        />

        {/* Section header */}
        <div className="flex items-end justify-between mb-3 mt-10 reveal-up">
          <div>
            <p className="label-case" style={{ marginBottom: "8px" }}>Forensic Registry</p>
            <h1 className="display-3d" style={{ fontSize: "clamp(2rem, 6vw, 2.8rem)" }}>FIELD AGENTS</h1>
          </div>
          <p className="label-mono">
            {loading ? "—" : playerCount !== undefined ? `${playerCount} AGENT${playerCount === 1n ? "" : "S"}` : "—"}
          </p>
        </div>

        <div className="wire-amber mb-6" />

        {isError ? (
          <div className="p-panel px-5 py-16 text-center">
            <p className="label-mono" style={{ color: "var(--crimson)", marginBottom: 8, letterSpacing: "0.22em" }}>SIGNAL LOST</p>
            <p className="label-mono">Could not reach contract — check RPC connection.</p>
          </div>
        ) : (loading || leaderboard === null) ? (
          <div className="p-panel">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-panel px-5 py-16 text-center">
            <p className="label-mono" style={{ letterSpacing: "0.22em", marginBottom: 8 }}>NO AGENTS ON FILE</p>
            <p className="label-case" style={{ color: "var(--ink-low)", marginBottom: 28 }}>
              Be the first detective to crack a case
            </p>
            <Link href="/play" className="btn inline-flex px-6">OPEN CASE FILE</Link>
          </div>
        ) : (
          <>
            {podiumEntries.length > 0 && <PodiumSection entries={podiumEntries} />}
            {tableEntries.length > 0  && <RankingsTable entries={tableEntries} />}
          </>
        )}

        <p className="mt-8 text-center label-mono">
          LIVE ON-CHAIN · {isError ? "—" : seasonName.toUpperCase()} · MONAD TESTNET · REFRESHES EVERY 30S
        </p>
      </div>
    </div>
  );
}
