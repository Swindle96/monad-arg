"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { EXPLORER_URL } from "@/lib/constants";

type TxEntry = { hash: string; from: string; to: string | null; isGame: boolean };
type BlockData = { number: string | null; transactions: TxEntry[] };

const mono: React.CSSProperties = { fontFamily: "var(--font-mono), monospace" };

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
function shortenHash(hash: string) {
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

const POLL_MS  = 3_000;
const MAX_FEED = 60;

type FeedEntry = TxEntry & { blockNumber: string; ts: string };

export default function ExplorePage() {
  const [feed, setFeed]               = useState<FeedEntry[]>([]);
  const [blockNumber, setBlockNumber] = useState<string | null>(null);
  const [error, setError]             = useState(false);
  const [loading, setLoading]         = useState(true);
  const mountedRef                    = useRef(true);

  const fetchBlock = useCallback(async () => {
    try {
      const res = await fetch("/api/blocks");
      if (!res.ok) throw new Error("fetch failed");
      const data: BlockData = await res.json();
      if (!mountedRef.current) return;
      setBlockNumber(data.number);
      setError(false);

      if (data.number && data.transactions.length > 0) {
        const ts = new Date().toISOString().slice(11, 19);
        setFeed((prev) => {
          const seen = new Set(prev.map((e) => e.hash));
          const fresh: FeedEntry[] = data.transactions
            .filter((tx) => !seen.has(tx.hash))
            .map((tx) => ({ ...tx, blockNumber: data.number!, ts }));
          if (fresh.length === 0) return prev;
          return [...fresh, ...prev].slice(0, MAX_FEED);
        });
      }
    } catch {
      if (mountedRef.current) setError(true);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchBlock();
    const id = setInterval(fetchBlock, POLL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchBlock]);

  const gameCount = feed.filter((e) => e.isGame).length;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Sticky sub-header */}
      <div
        style={{
          position: "sticky",
          top: "56px",
          zIndex: 30,
          background: "rgba(5, 7, 9, 0.92)",
          borderBottom: "1px solid var(--green-line)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Link
              href="/"
              style={{ ...mono, fontSize: "0.68rem", color: "var(--text-dim)", letterSpacing: "0.14em" }}
              className="chroma"
            >
              cd ..
            </Link>
            <span style={{ color: "var(--border-2)" }}>│</span>
            <span style={{ ...mono, fontSize: "0.68rem", color: "var(--green)", letterSpacing: "0.14em", textShadow: "0 0 4px var(--green-glow)" }}>
              tail -f /chain.log
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {blockNumber && (
              <span style={{ ...mono, fontSize: "0.60rem", color: "var(--text-dim)", letterSpacing: "0.16em" }}>
                BLOCK <span style={{ color: "var(--monad)", textShadow: "0 0 4px var(--monad-glow)" }}>#{blockNumber}</span>
              </span>
            )}
            <div className="hidden sm:flex" style={{ alignItems: "center", gap: "8px" }}>
              <span className="dot dot-green" aria-hidden="true" />
              <span style={{ ...mono, fontSize: "0.60rem", color: "var(--green)", letterSpacing: "0.18em", textShadow: "0 0 4px var(--green-glow)" }}>
                LIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 24px 60px" }}>
        <div style={{ marginBottom: "24px" }}>
          <p className="label-green" style={{ marginBottom: "10px" }}>
            // monad_testnet // live block stream
          </p>
          <h1
            className="display"
            style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", marginBottom: "12px" }}
            data-text="INTEL FEED"
          >
            <span className="glitch" data-text="INTEL FEED">INTEL FEED</span>
          </h1>
          <p style={{ ...mono, fontSize: "0.84rem", color: "var(--text-soft)", lineHeight: 1.75, maxWidth: "580px" }}>
            // real-time transaction stream from monad testnet.<br />
            // <span style={{ color: "var(--monad)", textShadow: "0 0 4px var(--monad-glow)" }}>highlighted</span> entries are cyberintrusion contract calls.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border-2)", border: "1px solid var(--border-2)", marginBottom: "18px" }}>
          {[
            { k: "TX_SEEN",    v: String(feed.length) },
            { k: "GAME_CALLS", v: String(gameCount) },
            { k: "POLL_RATE",  v: "3s" },
          ].map(({ k, v }) => (
            <div key={k} style={{ padding: "14px 20px", background: "var(--surface)" }}>
              <p className="label" style={{ marginBottom: "6px" }}>{k}</p>
              <p style={{ ...mono, fontSize: "1rem", color: "var(--green)", textShadow: "0 0 4px var(--green-glow)" }} className="tabular-nums">{v}</p>
            </div>
          ))}
        </div>

        {/* Feed terminal */}
        <div className="terminal corners">
          <span className="corners-bl" />
          <span className="corners-br" />
          <div className="terminal-head">
            <span>── [ TX_STREAM ] ─────────────</span>
            <span style={{ ...mono, fontSize: "0.56rem", letterSpacing: "0.18em", color: "var(--text-dim)" }}>
              max={MAX_FEED}
            </span>
          </div>

          {loading ? (
            <div style={{ padding: "48px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
              <span className="ascii-spinner" style={{ color: "var(--green)", fontSize: "1rem" }} />
              <span style={{ ...mono, fontSize: "0.78rem", letterSpacing: "0.16em", color: "var(--text-dim)" }}>
                establishing connection…
              </span>
            </div>
          ) : error ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ ...mono, fontSize: "0.78rem", color: "var(--red)", letterSpacing: "0.16em", textShadow: "0 0 4px var(--red-glow)" }}>
                [ERR] RPC UNAVAILABLE
              </p>
              <p style={{ ...mono, fontSize: "0.62rem", color: "var(--text-faint)", marginTop: "8px" }}>retrying…</p>
            </div>
          ) : feed.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ ...mono, fontSize: "0.78rem", color: "var(--text-faint)", letterSpacing: "0.16em" }}>
                <span className="cursor">{"// waiting for transactions"}</span>
              </p>
            </div>
          ) : (
            <div role="feed" aria-label="Live transaction feed" aria-live="polite" aria-atomic="false">
              {/* Column headers */}
              <div
                className="hidden sm:grid"
                style={{
                  gridTemplateColumns: "70px 1.4fr 1fr 1fr 90px",
                  gap: "12px",
                  padding: "8px 20px",
                  borderBottom: "1px solid var(--green-line)",
                  background: "var(--bg-deep)",
                }}
              >
                {["TIME", "TX_HASH", "FROM", "TO", "BLOCK"].map((h) => (
                  <span
                    key={h}
                    style={{
                      ...mono,
                      fontSize: "0.54rem",
                      letterSpacing: "0.20em",
                      color: "var(--green)",
                      textShadow: "0 0 3px var(--green-glow)",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {feed.map((entry) => (
                <div
                  key={entry.hash}
                  className="hidden sm:grid"
                  style={{
                    gridTemplateColumns: "70px 1.4fr 1fr 1fr 90px",
                    gap: "12px",
                    padding: "9px 20px",
                    borderBottom: "1px solid var(--border)",
                    background: entry.isGame ? "rgba(131, 110, 249, 0.08)" : "transparent",
                    alignItems: "center",
                  }}
                >
                  <span style={{ ...mono, fontSize: "0.62rem", color: "var(--text-faint)" }} className="tabular-nums">
                    {entry.ts}
                  </span>
                  <a
                    href={`${EXPLORER_URL}/${entry.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...mono,
                      fontSize: "0.66rem",
                      color: entry.isGame ? "var(--monad)" : "var(--text-dim)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      textShadow: entry.isGame ? "0 0 3px var(--monad-glow)" : "none",
                    }}
                    className="chroma"
                  >
                    {shortenHash(entry.hash)} ↗
                  </a>
                  <span style={{ ...mono, fontSize: "0.66rem", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.from ? shorten(entry.from) : "—"}
                  </span>
                  <span style={{ ...mono, fontSize: "0.66rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: entry.isGame ? "var(--green)" : "var(--text-faint)", textShadow: entry.isGame ? "0 0 3px var(--green-glow)" : "none" }}>
                      {entry.to ? shorten(entry.to) : "CONTRACT_CREATE"}
                    </span>
                    {entry.isGame && (
                      <span style={{ ...mono, fontSize: "0.48rem", letterSpacing: "0.18em", color: "var(--monad)", border: "1px solid rgba(131,110,249,0.4)", padding: "1px 5px" }}>
                        GAME
                      </span>
                    )}
                  </span>
                  <span style={{ ...mono, fontSize: "0.62rem", color: "var(--text-faint)", textAlign: "right" }} className="tabular-nums">
                    #{entry.blockNumber}
                  </span>
                </div>
              ))}

              {/* Mobile fallback */}
              {feed.map((entry) => (
                <div
                  key={`m-${entry.hash}`}
                  className="sm:hidden"
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid var(--border)",
                    background: entry.isGame ? "rgba(131, 110, 249, 0.08)" : "transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ ...mono, fontSize: "0.58rem", color: "var(--text-faint)" }} className="tabular-nums">
                      {entry.ts}
                    </span>
                    <span style={{ ...mono, fontSize: "0.58rem", color: "var(--text-faint)" }} className="tabular-nums">
                      #{entry.blockNumber}
                    </span>
                    {entry.isGame && (
                      <span style={{ ...mono, fontSize: "0.50rem", letterSpacing: "0.16em", color: "var(--monad)", border: "1px solid rgba(131,110,249,0.4)", padding: "1px 5px" }}>
                        GAME
                      </span>
                    )}
                  </div>
                  <a
                    href={`${EXPLORER_URL}/${entry.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...mono,
                      fontSize: "0.66rem",
                      color: entry.isGame ? "var(--monad)" : "var(--text)",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {shortenHash(entry.hash)} ↗
                  </a>
                  <p style={{ ...mono, fontSize: "0.62rem", color: "var(--text-dim)", marginTop: "2px" }}>
                    {entry.from ? shorten(entry.from) : "—"} → {entry.to ? shorten(entry.to) : "CREATE"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.12em", color: "var(--text-faint)", marginTop: "16px", lineHeight: 1.8 }}>
          // calldata not shown — protects active puzzle commitments.{" "}
          <a
            href="https://testnet.monadexplorer.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--text-dim)" }}
            className="chroma"
          >
            full details ↗ monadexplorer
          </a>
        </p>
      </div>
    </div>
  );
}
