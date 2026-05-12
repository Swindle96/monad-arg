"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { EXPLORER_URL } from "@/lib/constants";

type TxEntry = { hash: string; from: string; to: string | null; isGame: boolean };
type BlockData = { number: string | null; transactions: TxEntry[] };

const mono: React.CSSProperties = { fontFamily: "var(--font-mono), monospace" };

function shorten(addr: string) {
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}
function shortenHash(hash: string) {
  return `${hash.slice(0, 14)}…${hash.slice(-8)}`;
}

const POLL_MS  = 3_000;
const MAX_FEED = 60;

type FeedEntry = TxEntry & { blockNumber: string };

export default function ExplorePage() {
  const [feed, setFeed]             = useState<FeedEntry[]>([]);
  const [blockNumber, setBlockNumber] = useState<string | null>(null);
  const [error, setError]           = useState(false);
  const [loading, setLoading]       = useState(true);
  const mountedRef                  = useRef(true);

  const fetchBlock = useCallback(async () => {
    try {
      const res = await fetch("/api/blocks");
      if (!res.ok) throw new Error("fetch failed");
      const data: BlockData = await res.json();
      if (!mountedRef.current) return;
      setBlockNumber(data.number);
      setError(false);

      if (data.number && data.transactions.length > 0) {
        setFeed(prev => {
          const seen = new Set(prev.map(e => e.hash));
          const fresh: FeedEntry[] = data.transactions
            .filter(tx => !seen.has(tx.hash))
            .map(tx => ({ ...tx, blockNumber: data.number! }));
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

  const gameCount = feed.filter(e => e.isGame).length;

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ── STICKY SUB-HEADER ─────────────────────────────────── */}
      <div style={{
        position: "sticky", top: "56px", zIndex: 30,
        background: "rgba(7,7,7,0.95)", borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      }}>
        <div style={{
          maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "48px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/"
              style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.16em", color: "var(--text-faint)", textDecoration: "none", transition: "color 150ms", display: "flex", alignItems: "center", minHeight: "44px" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-faint)")}
            >
              ← BACK
            </Link>
            <span style={{ color: "var(--border-2)", userSelect: "none" }}>|</span>
            <span style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.16em", color: "var(--text-dim)" }}>
              INTEL FEED
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {blockNumber && (
              <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.18em", color: "var(--text-faint)" }}>
                BLOCK <span style={{ color: "var(--purple)" }}>#{blockNumber}</span>
              </span>
            )}
            <div className="hidden sm:flex" style={{ alignItems: "center", gap: "8px" }}>
              <span className="dot dot-green" style={{ width: "6px", height: "6px" }} aria-hidden="true" />
              <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.20em", color: "var(--green)" }}>
                LIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <p style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.22em", color: "var(--text-faint)", marginBottom: "8px" }}>
            MONAD TESTNET — LIVE CHAIN ACTIVITY
          </p>
          <h1 className="display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", marginBottom: "12px" }}>
            INTEL <span style={{ color: "var(--purple)" }}>FEED</span>
          </h1>
          <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "0.875rem", color: "var(--text-dim)", lineHeight: 1.7, maxWidth: "560px" }}>
            Real-time block activity on Monad Testnet.{" "}
            <span style={{ color: "var(--purple)" }}>Highlighted</span>{" "}
            transactions interact with CHAIN_DETECTIVE contracts.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", marginBottom: "20px" }}>
          {[
            { label: "TRANSACTIONS SEEN", value: String(feed.length) },
            { label: "GAME INTERACTIONS", value: String(gameCount) },
            { label: "REFRESH RATE",      value: "3s" },
          ].map(({ label, value }) => (
            <div key={label} style={{
              padding: "14px 20px",
              background: "var(--surface)", border: "1px solid var(--border)",
            }}>
              <p style={{ ...mono, fontSize: "0.56rem", letterSpacing: "0.20em", color: "var(--text-faint)", marginBottom: "6px" }}>{label}</p>
              <p style={{ ...mono, fontSize: "1rem", color: "var(--text)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Feed table */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>

          {/* Terminal bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 20px", background: "var(--raised)", borderBottom: "1px solid var(--border)",
          }}>
            <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.22em", color: "var(--text-faint)" }}>
              TRANSACTION STREAM
            </span>
            <div style={{ display: "flex", gap: "6px" }} aria-hidden="true">
              {["var(--red)", "var(--orange)", "var(--acid)"].map((c, i) => (
                <span key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c, opacity: 0.5 }} />
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "48px 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.18em", color: "var(--text-faint)" }}>
                ESTABLISHING CONNECTION…
              </span>
            </div>
          ) : error ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ ...mono, fontSize: "0.68rem", color: "var(--red)", letterSpacing: "0.16em" }}>RPC UNAVAILABLE</p>
              <p style={{ ...mono, fontSize: "0.60rem", color: "var(--text-faint)", marginTop: "8px" }}>Retrying…</p>
            </div>
          ) : feed.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ ...mono, fontSize: "0.68rem", color: "var(--text-faint)", letterSpacing: "0.16em" }}>
                WAITING FOR TRANSACTIONS…
              </p>
            </div>
          ) : (
            <div role="feed" aria-label="Live transaction feed" aria-live="polite" aria-atomic="false">
              {/* Column headers */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) auto",
                gap: "0 16px",
                padding: "8px 20px",
                borderBottom: "1px solid var(--border)",
              }}>
                {["TX HASH", "FROM", "TO", "BLOCK"].map(h => (
                  <span key={h} style={{ ...mono, fontSize: "0.56rem", letterSpacing: "0.18em", color: "var(--text-faint)" }}>{h}</span>
                ))}
              </div>

              {feed.map(entry => (
                <div
                  key={entry.hash}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) auto",
                    gap: "0 16px",
                    padding: "11px 20px",
                    borderBottom: "1px solid var(--border)",
                    background: entry.isGame ? "rgba(155,127,252,0.04)" : "transparent",
                    alignItems: "center",
                  }}
                >
                  <a
                    href={`${EXPLORER_URL}/${entry.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...mono, fontSize: "0.68rem",
                      color: entry.isGame ? "var(--purple)" : "var(--text-dim)",
                      textDecoration: "none",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                  >
                    {shortenHash(entry.hash)} ↗
                  </a>
                  <span style={{ ...mono, fontSize: "0.68rem", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.from ? shorten(entry.from) : "—"}
                  </span>
                  <span style={{ ...mono, fontSize: "0.68rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: entry.isGame ? "var(--acid)" : "var(--text-faint)" }}>
                      {entry.to ? shorten(entry.to) : "CONTRACT CREATE"}
                    </span>
                    {entry.isGame && (
                      <span style={{ ...mono, fontSize: "0.50rem", letterSpacing: "0.16em", color: "var(--purple)", border: "1px solid var(--purple-border)", padding: "1px 5px", flexShrink: 0 }}>
                        GAME
                      </span>
                    )}
                  </span>
                  <span style={{ ...mono, fontSize: "0.64rem", color: "var(--text-faint)", whiteSpace: "nowrap", textAlign: "right" }}>
                    #{entry.blockNumber}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <p style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.12em", color: "var(--text-faint)", marginTop: "16px", lineHeight: 1.8 }}>
          Transaction calldata is not displayed to protect active puzzle commitments.{" "}
          <a
            href="https://testnet.monadexplorer.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--text-dim)", textDecoration: "none" }}
          >
            View full details on Monad Explorer ↗
          </a>
        </p>
      </div>
    </div>
  );
}
