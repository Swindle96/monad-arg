"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { ZERO_ADDR } from "@/lib/constants";
import DecodeText from "@/components/DecodeText";

type Entry = { addr: `0x${string}`; score: bigint; puzzlesSolved: bigint };

interface LbApiResponse {
  leaderboard: { addr: string; score: string; puzzlesSolved: string }[];
  playerCount: string;
  season: { name: string; isActive: boolean; prizeWei: string };
}

const mono: React.CSSProperties = { fontFamily: "var(--font-mono), monospace" };

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handle(e: React.MouseEvent) {
    e.preventDefault();
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  }
  return (
    <button
      onClick={handle}
      aria-label={copied ? "Address copied" : "Copy address"}
      style={{
        background: "none",
        border: "1px solid transparent",
        padding: "4px 8px",
        cursor: "pointer",
        color: copied ? "var(--acid)" : "var(--text-faint)",
        ...mono,
        fontSize: "0.60rem",
        letterSpacing: "0.18em",
        textShadow: copied ? "0 0 4px var(--acid-glow)" : "none",
        transition: "color 150ms",
      }}
      className="chroma"
    >
      {copied ? "[✓]" : "[cp]"}
    </button>
  );
}

function SkeletonRow() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "40px 1fr 90px 90px 40px",
        gap: "16px",
        padding: "12px 24px",
        borderBottom: "1px solid var(--border)",
        ...mono,
        alignItems: "center",
      }}
    >
      {[1, 0.7, 0.4, 0.4, 0.5].map((w, i) => (
        <div
          key={i}
          className="flicker"
          style={{ height: "11px", width: `${w * 100}%`, background: "var(--green-dim)" }}
        />
      ))}
    </div>
  );
}

const RANK_GLYPHS: Record<number, { glyph: string; color: string; title: string }> = {
  1: { glyph: "▣", color: "#FFD700", title: "CHIEF_DETECTIVE" },
  2: { glyph: "▢", color: "#C0C0C0", title: "SENIOR_AGENT" },
  3: { glyph: "▤", color: "#CD7F32", title: "FIELD_AGENT" },
};

function PodiumCard({ entry, rank }: { entry: Entry; rank: number }) {
  const { addr, score, puzzlesSolved } = entry;
  const r = RANK_GLYPHS[rank];
  return (
    <div
      className="terminal corners scan-target"
      style={{
        borderColor: `${r.color}66`,
        boxShadow: `0 0 18px ${r.color}33`,
      }}
    >
      <span className="corners-bl" />
      <span className="corners-br" />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          borderBottom: `1px solid ${r.color}33`,
          background: `linear-gradient(180deg, ${r.color}10, transparent)`,
        }}
      >
        <span
          style={{
            ...mono,
            fontSize: "0.62rem",
            letterSpacing: "0.20em",
            color: r.color,
            textShadow: `0 0 5px ${r.color}80`,
          }}
        >
          {r.glyph} RANK_{String(rank).padStart(2, "0")}
        </span>
        <span style={{ ...mono, fontSize: "0.56rem", letterSpacing: "0.16em", color: r.color, opacity: 0.8 }}>
          {r.title}
        </span>
      </div>

      <div style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "20px" }}>
          <span
            style={{
              fontFamily: "var(--font-crt), monospace",
              fontSize: "3rem",
              color: r.color,
              textShadow: `0 0 10px ${r.color}99`,
              lineHeight: 1,
            }}
          >
            {String(rank).padStart(2, "0")}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ ...mono, fontSize: "0.74rem", color: "var(--text)" }}>{shorten(addr)}</span>
            <CopyButton text={addr} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", paddingTop: "12px", borderTop: `1px solid ${r.color}33` }}>
          <div>
            <p className="label" style={{ marginBottom: "5px" }}>SOLVED</p>
            <p
              style={{
                fontFamily: "var(--font-crt), monospace",
                fontSize: "1.4rem",
                color: "var(--green)",
                textShadow: "0 0 5px var(--green-glow)",
              }}
              className="tabular-nums"
            >
              {Number(puzzlesSolved)}
            </p>
          </div>
          <div>
            <p className="label" style={{ marginBottom: "5px" }}>SCORE</p>
            <p
              className="tabular-nums"
              style={{
                fontFamily: "var(--font-crt), monospace",
                fontSize: "1.4rem",
                color: r.color,
                textShadow: `0 0 5px ${r.color}80`,
              }}
            >
              {Number(score).toLocaleString()}
            </p>
          </div>
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
        const json = (await res.json()) as LbApiResponse;
        if (mounted) {
          setData(json);
          setIsError(false);
        }
      } catch {
        if (mounted) setIsError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 30_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const leaderboard = useMemo((): Entry[] | null => {
    if (!data) return null;
    return data.leaderboard
      .map((e) => ({
        addr: e.addr as `0x${string}`,
        score: BigInt(e.score),
        puzzlesSolved: BigInt(e.puzzlesSolved),
      }))
      .filter((e) => e.addr.toLowerCase() !== ZERO_ADDR && e.score > 0n);
  }, [data]);

  const playerCount  = data ? BigInt(data.playerCount) : undefined;
  const seasonName   = data?.season.name   ?? "Season 01";
  const prizeWei     = data ? BigInt(data.season.prizeWei) : 0n;
  const prizeDisplay = prizeWei > 0n ? `${formatEther(prizeWei)} MON` : "0 MON";
  const isActive     = data?.season.isActive ?? true;

  const podiumEntries = leaderboard?.slice(0, 3) ?? [];
  const tableEntries  = leaderboard?.slice(3)    ?? [];

  return (
    <div style={{ minHeight: "100vh", maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 60px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "28px" }}>
        <Link
          href="/"
          style={{ ...mono, fontSize: "0.68rem", color: "var(--text-dim)", letterSpacing: "0.14em" }}
          className="chroma"
        >
          cd ..
        </Link>
      </div>

      {/* Prize hero */}
      <div
        className="terminal corners reveal-up"
        style={{ marginBottom: "36px" }}
      >
        <span className="corners-bl" />
        <span className="corners-br" />
        <div className="terminal-head">
          <span>── [ PRIZE_POOL.STATUS ] ─────</span>
          <span className={isActive ? "tag tag-green" : "tag"}>
            <span className={isActive ? "dot dot-green" : "dot"} style={{ background: isActive ? undefined : "var(--text-faint)" }} aria-hidden="true" />
            {isActive ? "CASE ACTIVE" : "CASE CLOSED"}
          </span>
        </div>
        <div
          style={{
            padding: "28px 28px 32px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "24px",
          }}
        >
          <div>
            <p className="label-monad" style={{ marginBottom: "12px" }}>
              // {seasonName.toLowerCase()} ── prize pool
            </p>
            <p
              style={{
                fontFamily: "var(--font-crt), monospace",
                fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
                color: "var(--acid)",
                textShadow: "0 0 12px var(--acid-glow), 0 0 28px rgba(204,255,0,0.4)",
                letterSpacing: "0.04em",
              }}
            >
              {loading ? "—" : prizeDisplay}
            </p>
          </div>
          {playerCount !== undefined && !loading && (
            <span className="label">
              [ {playerCount.toString()} agent{playerCount === 1n ? "" : "s"} on file ]
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <p className="label-green" style={{ marginBottom: "8px" }}>
            // forensic_registry
          </p>
          <h1
            className="display"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)" }}
            data-text="FIELD AGENTS"
          >
            <span className="glitch" data-text="FIELD AGENTS">FIELD AGENTS</span>
          </h1>
        </div>
        <span className="label">
          {loading ? "—" : playerCount !== undefined ? `[ total: ${playerCount} ]` : "—"}
        </span>
      </div>

      <div className="divider-green" style={{ marginBottom: "28px" }} />

      {isError ? (
        <div
          className="terminal corners"
          style={{ borderColor: "rgba(255,0,60,0.4)", padding: "60px 24px", textAlign: "center" }}
        >
          <span className="corners-bl" />
          <span className="corners-br" />
          <p style={{ ...mono, fontSize: "0.78rem", letterSpacing: "0.18em", color: "var(--red)", marginBottom: "8px", textShadow: "0 0 4px var(--red-glow)" }}>
            [ERR] RPC CONNECTION LOST
          </p>
          <p className="label">retrying in 30s…</p>
        </div>
      ) : loading || leaderboard === null ? (
        <div className="terminal" style={{ padding: 0 }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="terminal corners" style={{ padding: "80px 24px", textAlign: "center" }}>
          <span className="corners-bl" />
          <span className="corners-br" />
          <p style={{ ...mono, fontSize: "0.84rem", letterSpacing: "0.18em", color: "var(--text-dim)", marginBottom: "8px" }}>
            <DecodeText text="NO AGENTS ON FILE" duration={900} />
          </p>
          <p className="label" style={{ marginBottom: "28px" }}>
            // be the first detective to crack a case.
          </p>
          <Link href="/play" className="btn-acid">./open_case →</Link>
        </div>
      ) : (
        <>
          {/* Podium */}
          {podiumEntries.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              {podiumEntries.map((entry, i) => (
                <PodiumCard key={entry.addr} entry={entry} rank={i + 1} />
              ))}
            </div>
          )}

          {/* Table — ps-aux style */}
          {tableEntries.length > 0 && (
            <div className="terminal corners">
              <span className="corners-bl" />
              <span className="corners-br" />
              <div className="terminal-head">
                <span>── [ ps -ax /agents ] ──────</span>
              </div>
              <div
                className="hidden sm:grid"
                style={{
                  gridTemplateColumns: "60px 1fr 100px 100px 50px",
                  gap: "16px",
                  padding: "10px 24px",
                  borderBottom: "1px solid var(--green-line)",
                  background: "var(--bg-deep)",
                }}
              >
                {["RANK", "ADDR", "CASES", "SCORE", ""].map((h) => (
                  <span key={h} style={{ ...mono, fontSize: "0.56rem", letterSpacing: "0.20em", color: "var(--green)", textShadow: "0 0 3px var(--green-glow)" }}>
                    {h}
                  </span>
                ))}
              </div>

              {tableEntries.map(({ addr, score, puzzlesSolved }, idx) => {
                const rank = idx + 4;
                return (
                  <div
                    key={addr}
                    style={{ borderBottom: "1px solid var(--border)", transition: "background 150ms" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--green-dim)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Desktop */}
                    <div
                      className="hidden sm:grid"
                      style={{
                        gridTemplateColumns: "60px 1fr 100px 100px 50px",
                        gap: "16px",
                        padding: "12px 24px",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ ...mono, fontSize: "0.72rem", color: "var(--text-faint)", textAlign: "center" }}>
                        {String(rank).padStart(2, "0")}
                      </span>
                      <span style={{ ...mono, fontSize: "0.80rem", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {addr}
                      </span>
                      <span className="tabular-nums" style={{ ...mono, fontSize: "0.86rem", color: "var(--green)", textShadow: "0 0 3px var(--green-glow)" }}>
                        {Number(puzzlesSolved)}
                      </span>
                      <span className="tabular-nums" style={{ ...mono, fontSize: "0.86rem", color: "var(--monad)", textShadow: "0 0 3px var(--monad-glow)" }}>
                        {Number(score).toLocaleString()}
                      </span>
                      <CopyButton text={addr} />
                    </div>

                    {/* Mobile */}
                    <div className="sm:hidden" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px" }}>
                      <span style={{ ...mono, fontSize: "0.68rem", color: "var(--text-faint)", width: "26px", textAlign: "center" }}>
                        {String(rank).padStart(2, "0")}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", ...mono, fontSize: "0.78rem", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {shorten(addr)}
                        </span>
                        <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                          <span className="label">{Number(puzzlesSolved)} solved</span>
                          <span style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.12em", color: "var(--monad)", textShadow: "0 0 3px var(--monad-glow)" }}>
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

      <p className="label" style={{ textAlign: "center", marginTop: "32px" }}>
        // live on-chain · {isError ? "—" : seasonName.toLowerCase()} · monad testnet · auto-refresh 30s
      </p>
    </div>
  );
}
