"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { playerRegistryAbi, argGameAbi, CONTRACT_ADDRESSES } from "@/lib/contracts";

const REGISTRY_ADDRESS = CONTRACT_ADDRESSES.playerRegistry as `0x${string}`;
const GAME_ADDRESS     = CONTRACT_ADDRESSES.argGame         as `0x${string}`;
const ZERO_ADDR        = "0x0000000000000000000000000000000000000000";

type LeaderboardResult = readonly [readonly `0x${string}`[], readonly bigint[], readonly bigint[]];
type SeasonInfo        = readonly [string, bigint, boolean, bigint, `0x${string}`];

const PODIUM: Record<number, { color: string; bg: string; border: string; label: string; glow: string; titleColor: string }> = {
  1: { color: "#FFAE45", bg: "rgba(255,174,69,0.07)",  border: "rgba(255,174,69,0.35)", label: "GOLD",   glow: "rgba(255,174,69,0.3)",  titleColor: "#FFAE45" },
  2: { color: "#DDD7FE", bg: "rgba(221,215,254,0.05)", border: "rgba(221,215,254,0.28)", label: "SILVER", glow: "rgba(221,215,254,0.2)", titleColor: "#DDD7FE" },
  3: { color: "#85E6FF", bg: "rgba(133,230,255,0.05)", border: "rgba(133,230,255,0.28)", label: "BRONZE", glow: "rgba(133,230,255,0.2)", titleColor: "#85E6FF" },
};

const mono: React.CSSProperties = { fontFamily: "var(--font-roboto-mono)" };

function shorten(addr: string) { return `${addr.slice(0, 8)}…${addr.slice(-6)}`; }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handle(e: React.MouseEvent) {
    e.preventDefault();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={handle}
      className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors duration-200 cursor-pointer"
      style={{ color: "var(--text-dim)" }}
      aria-label="Copy address"
      onMouseEnter={e => (e.currentTarget.style.color = "#6E54FF")}
      onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6L5 9L10 3" stroke="#85E6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <rect x="4" y="1" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
          <rect x="1" y="3" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
        </svg>
      )}
    </button>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: "1px solid rgba(110,84,255,0.08)" }}>
      <div className="w-8 h-5 rounded animate-pulse" style={{ background: "rgba(110,84,255,0.08)" }} />
      <div className="flex-1 h-4 rounded animate-pulse" style={{ background: "rgba(110,84,255,0.06)" }} />
      <div className="w-16 h-4 rounded animate-pulse" style={{ background: "rgba(110,84,255,0.06)" }} />
      <div className="w-14 h-4 rounded animate-pulse" style={{ background: "rgba(110,84,255,0.06)" }} />
    </div>
  );
}

export default function LeaderboardPage() {
  const { data: rawLeaderboard, isLoading: lbLoading } = useReadContract({
    address: REGISTRY_ADDRESS, abi: playerRegistryAbi, functionName: "getLeaderboard",
    query: { refetchInterval: 10_000 },
  });
  const { data: rawPlayerCount, isLoading: playerCountLoading } = useReadContract({
    address: REGISTRY_ADDRESS, abi: playerRegistryAbi, functionName: "getPlayerCount",
    query: { refetchInterval: 10_000 },
  });
  const { data: rawSeasonInfo, isLoading: seasonLoading } = useReadContract({
    address: GAME_ADDRESS, abi: argGameAbi, functionName: "getSeasonInfo",
    query: { refetchInterval: 10_000 },
  });

  const leaderboard = useMemo(() => {
    const r = rawLeaderboard as LeaderboardResult | undefined;
    if (!r) return null;
    const [addrs, scores, puzzlesSolvedArr] = r;
    return addrs
      .map((addr, i) => ({ addr, score: scores[i] ?? 0n, puzzlesSolved: puzzlesSolvedArr?.[i] ?? 0n }))
      .filter(({ addr, score }) => addr.toLowerCase() !== ZERO_ADDR && score > 0n);
  }, [rawLeaderboard]);

  const playerCount  = rawPlayerCount as bigint | undefined;
  const season       = rawSeasonInfo  as SeasonInfo | undefined;
  const seasonName   = season?.[0] ?? "Season 1";
  const prizeWei     = season?.[3] ?? 0n;
  const prizeDisplay = prizeWei > 0n ? `${formatEther(prizeWei)} MON` : "0 MON";
  const isActive     = season?.[2] ?? true;

  const podiumEntries  = leaderboard?.slice(0, 3) ?? [];
  const tableEntries   = leaderboard?.slice(3)    ?? [];

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8" style={{ color: "var(--text)" }}>
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center min-h-[44px] transition-colors"
            style={{ ...mono, fontSize: "0.72rem", letterSpacing: "0.18em", color: "var(--text-dim)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#6E54FF")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}
          >
            ← BACK
          </Link>
        </div>

        {/* ── PRIZE POOL HERO ──────────────────────────────────────── */}
        <div
          className="relative overflow-hidden mb-3"
          style={{
            background:     "rgba(12,7,26,0.95)",
            border:         "1px solid rgba(255,174,69,0.3)",
            backdropFilter: "blur(20px)",
            boxShadow:      "0 0 60px rgba(255,174,69,0.07), 0 40px 100px rgba(0,0,0,0.6)",
          }}
        >
          {/* Top line accent */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 0%, #FFAE45 30%, #FF8EE4 60%, transparent 100%)" }} />
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,174,69,0.08) 0%, transparent 70%)" }} />

          {seasonLoading ? (
            <div className="p-6 flex items-center justify-between gap-6">
              <div className="flex flex-col gap-2">
                <div className="h-3 w-32 rounded animate-pulse" style={{ background: "rgba(255,174,69,0.1)" }} />
                <div className="h-10 w-56 rounded animate-pulse" style={{ background: "rgba(255,174,69,0.08)" }} />
              </div>
            </div>
          ) : (
            <div className="relative p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <p style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.32em", color: "rgba(255,174,69,0.6)", marginBottom: "10px" }}>
                  {seasonName.toUpperCase()} · PRIZE POOL
                </p>
                <p
                  className="shimmer-text"
                  style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(2rem, 6vw, 3rem)", letterSpacing: "0.06em" }}
                >
                  {prizeDisplay}
                </p>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-3">
                <span
                  className="flex items-center gap-2"
                  style={{ ...mono, fontSize: "0.72rem", letterSpacing: "0.16em", color: isActive ? "#85E6FF" : "var(--text-dim)" }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: isActive ? "#85E6FF" : "var(--text-dim)", animation: isActive ? "neon-pulse 2s ease-in-out infinite" : "none", boxShadow: isActive ? "0 0 8px #85E6FF" : "none" }}
                  />
                  {isActive ? "ACTIVE" : "ENDED"}
                </span>
                {playerCount !== undefined && !playerCountLoading && (
                  <span style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.18em", color: "var(--text-dim)" }}>
                    {playerCount.toString()} DETECTIVE{playerCount === 1n ? "" : "S"}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── PAGE HEADER ──────────────────────────────────────────── */}
        <div className="flex items-end justify-between mb-3 mt-10">
          <h1 className="rift-title-3d" style={{ fontSize: "clamp(2rem, 6vw, 2.8rem)" }}>
            FORENSIC RANKS
          </h1>
          <p style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.18em", color: "var(--text-dim)" }}>
            {playerCountLoading ? "—" : playerCount !== undefined ? `${playerCount} DETECTIVE${playerCount === 1n ? "" : "S"}` : "—"}
          </p>
        </div>
        <div className="rift-line mb-6" />

        {/* ── LOADING STATE ──────────────────────────────────────── */}
        {(lbLoading || leaderboard === null) ? (
          <div className="rift-panel" style={{ borderRadius: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="rift-panel px-5 py-16 text-center" style={{ borderRadius: 2 }}>
            <p style={{ ...mono, fontSize: "0.72rem", letterSpacing: "0.22em", color: "var(--text-dim)", marginBottom: 8 }}>
              NO PLAYERS YET
            </p>
            <p style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.16em", color: "var(--text-dim)", marginBottom: 28 }}>
              BE THE FIRST TO SOLVE A PUZZLE
            </p>
            <Link href="/play" className="rift-btn inline-flex px-6 py-3">
              START PLAYING
            </Link>
          </div>
        ) : (
          <>
            {/* ── PODIUM (top 3) ──────────────────────────────────── */}
            {podiumEntries.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3 mb-4">
                {podiumEntries.map(({ addr, score, puzzlesSolved }, idx) => {
                  const rank = idx + 1;
                  const p    = PODIUM[rank];
                  return (
                    <div
                      key={addr}
                      className="relative overflow-hidden"
                      style={{
                        background:  p.bg,
                        border:      `1px solid ${p.border}`,
                        borderRadius: "2px",
                        boxShadow:   `0 0 30px ${p.glow}, 0 20px 60px rgba(0,0,0,0.4)`,
                        padding:     "20px",
                      }}
                    >
                      {/* Ambient top glow */}
                      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${p.color}, transparent)` }} />
                      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${p.glow} 0%, transparent 70%)` }} />

                      <div className="relative">
                        {/* Rank badge */}
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className="text-sm font-bold w-9 h-9 flex items-center justify-center border"
                            style={{ color: p.color, borderColor: p.border, fontFamily: "var(--font-syne)", fontSize: "1rem", boxShadow: `0 0 12px ${p.glow}` }}
                          >
                            {rank}
                          </span>
                          <span
                            className="px-2 py-0.5 border"
                            style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.16em", color: p.color, borderColor: p.border }}
                          >
                            {p.label}
                          </span>
                        </div>

                        {/* Address */}
                        <div className="flex items-center gap-1 mb-4">
                          <span
                            className="text-sm font-mono truncate"
                            style={{ color: p.color, fontFamily: "var(--font-roboto-mono)", fontSize: "0.82rem", fontWeight: 600 }}
                          >
                            {shorten(addr)}
                          </span>
                          <CopyButton text={addr} />
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 pt-3" style={{ borderTop: `1px solid ${p.border}` }}>
                          <div>
                            <p style={{ ...mono, fontSize: "0.6rem", letterSpacing: "0.18em", color: "var(--text-dim)", marginBottom: "3px" }}>SOLVED</p>
                            <p style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text)" }}>
                              {Number(puzzlesSolved)}
                            </p>
                          </div>
                          <div>
                            <p style={{ ...mono, fontSize: "0.6rem", letterSpacing: "0.18em", color: "var(--text-dim)", marginBottom: "3px" }}>SCORE</p>
                            <p className="tabular-nums" style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.1rem", color: p.color }}>
                              {Number(score).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── REST OF RANKINGS ──────────────────────────────────── */}
            {tableEntries.length > 0 && (
              <div className="rift-panel" style={{ borderRadius: 2 }}>
                {/* Desktop headers */}
                <div
                  className="hidden sm:grid px-5 py-2"
                  style={{
                    gridTemplateColumns: "52px 1fr 100px 90px 48px",
                    gap: "16px",
                    borderBottom: "1px solid rgba(110,84,255,0.12)",
                    background: "rgba(110,84,255,0.04)",
                  }}
                >
                  {["RANK", "ADDRESS", "PUZZLES", "SCORE", ""].map(h => (
                    <span key={h} style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.2em", color: "var(--text-dim)" }}>{h}</span>
                  ))}
                </div>

                {tableEntries.map(({ addr, score, puzzlesSolved }, idx) => {
                  const rank = idx + 4;
                  return (
                    <div
                      key={addr}
                      className="transition-colors duration-150"
                      style={{ borderBottom: "1px solid rgba(110,84,255,0.08)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(110,84,255,0.04)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Desktop */}
                      <div
                        className="hidden sm:grid px-5 py-3 items-center"
                        style={{ gridTemplateColumns: "52px 1fr 100px 90px 48px", gap: "16px" }}
                      >
                        <span style={{ ...mono, fontSize: "0.72rem", color: "var(--text-dim)", width: 32, display: "block", textAlign: "center" }}>{rank}</span>
                        <span className="text-sm font-mono truncate" style={{ color: "var(--text-muted)", fontFamily: "var(--font-roboto-mono)" }}>
                          {shorten(addr)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="tabular-nums" style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>
                            {Number(puzzlesSolved)}
                          </span>
                          <span style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.14em", color: "var(--text-dim)" }}>solved</span>
                        </div>
                        <span className="tabular-nums font-bold" style={{ fontFamily: "var(--font-syne)", fontSize: "0.9rem", color: "#6E54FF" }}>
                          {Number(score).toLocaleString()}
                        </span>
                        <CopyButton text={addr} />
                      </div>

                      {/* Mobile */}
                      <div className="sm:hidden px-4 py-3 flex items-center gap-3">
                        <span style={{ ...mono, fontSize: "0.72rem", color: "var(--text-dim)", width: 28, flexShrink: 0, textAlign: "center" }}>{rank}</span>
                        <div className="flex-1 min-w-0">
                          <span className="block truncate" style={{ color: "var(--text-muted)", fontFamily: "var(--font-roboto-mono)", fontSize: "0.82rem" }}>
                            {shorten(addr)}
                          </span>
                          <div className="flex items-center gap-3 mt-1" style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.12em", color: "var(--text-dim)" }}>
                            <span>{Number(puzzlesSolved)} solved</span>
                            <span style={{ color: "#6E54FF" }}>{Number(score).toLocaleString()} pts</span>
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

        {/* Footer note */}
        <p
          className="mt-8 text-center"
          style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.2em", color: "var(--text-dim)" }}
        >
          LIVE ON-CHAIN · {seasonName.toUpperCase()} · MONAD TESTNET · REFRESHES EVERY 10S
        </p>
      </div>
    </div>
  );
}
