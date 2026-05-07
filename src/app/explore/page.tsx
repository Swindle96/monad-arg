"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hexToBytes } from "viem/utils";
import Link from "next/link";

function buildArgContracts(): Record<string, string> {
  const entries: Record<string, string> = {};
  const puzzle   = process.env.NEXT_PUBLIC_PUZZLE_CONTRACT;
  const argGame  = process.env.NEXT_PUBLIC_ARG_GAME;
  const registry = process.env.NEXT_PUBLIC_PLAYER_REGISTRY;
  if (puzzle)   entries[puzzle.toLowerCase()]   = "PuzzleChain";
  if (argGame)  entries[argGame.toLowerCase()]  = "ARGGame";
  if (registry) entries[registry.toLowerCase()] = "PlayerRegistry";
  return entries;
}
const ARG_CONTRACTS = buildArgContracts();

interface TxEntry {
  key:         string;
  blockNumber: bigint;
  hash:        `0x${string}`;
  from:        `0x${string}`;
  to:          `0x${string}` | null;
  input:       `0x${string}`;
}
const MAX_TXS = 50;

function shorten(s: string, h: number, t: number) { return `${s.slice(0, h)}…${s.slice(-t)}`; }
function sanitizeToAscii(raw: string) { return raw.replace(/[^\x20-\x7E]/g, "?"); }

function decodeInput(input: `0x${string}`): { display: string; decoded: boolean } {
  if (input === "0x") return { display: "", decoded: false };
  try {
    const bytes = hexToBytes(input);
    const text  = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const sanitized = sanitizeToAscii(text).replace(/[<>&"']/g, "?").slice(0, 40);
    return { display: sanitized, decoded: true };
  } catch {
    return { display: input.slice(0, 42), decoded: false };
  }
}

function getArgLabel(to: `0x${string}` | null): string | null {
  if (!to) return null;
  return ARG_CONTRACTS[to.toLowerCase()] ?? null;
}

const mono: React.CSSProperties = { fontFamily: "var(--font-roboto-mono)" };

const decodeCache = new Map<string, { display: string; decoded: boolean }>();

function decodeInputCached(input: `0x${string}`): { display: string; decoded: boolean } {
  const cached = decodeCache.get(input);
  if (cached) return cached;
  const result = decodeInput(input);
  if (decodeCache.size > 2000) {
    let evicted = 0;
    for (const k of decodeCache.keys()) {
      decodeCache.delete(k);
      if (++evicted >= 500) break;
    }
  }
  decodeCache.set(input, result);
  return result;
}

export default function ExplorePage() {
  const [txs, setTxs]                 = useState<TxEntry[]>([]);
  const [latestBlock, setLatestBlock] = useState<bigint | null>(null);
  const [status, setStatus]           = useState<"connecting" | "live" | "error">("connecting");
  const [filterARG, setFilterARG]     = useState(false);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const shouldScroll = useRef(true);
  const listRef      = useRef<HTMLDivElement>(null);
  const lastBlockRef = useRef<string | null>(null);
  const retryCount   = useRef(0);
  const mountedRef   = useRef(true);

  const fetchBlock = useCallback(async () => {
    try {
      const res = await fetch("/api/blocks");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!mountedRef.current) return;
      if (data.error) throw new Error(data.error);

      const { number, transactions } = data as {
        number: string | null;
        transactions: { hash: string; from: string; to: string | null; input: string }[];
      };

      if (!number || number === lastBlockRef.current) return;
      lastBlockRef.current = number;
      retryCount.current   = 0;

      setStatus("live");
      setLatestBlock(BigInt(number));

      if (!Array.isArray(transactions) || transactions.length === 0) return;

      const entries: TxEntry[] = transactions
        .filter(tx => tx && typeof tx.hash === "string" && typeof tx.from === "string")
        .map((tx, i) => ({
          key:         `${tx.hash}-${i}`,
          blockNumber: BigInt(number),
          hash:        tx.hash as `0x${string}`,
          from:        tx.from as `0x${string}`,
          to:          tx.to as `0x${string}` | null,
          input:       (tx.input ?? "0x") as `0x${string}`,
        }));

      setTxs(prev => [...prev, ...entries].slice(-MAX_TXS));
    } catch {
      if (!mountedRef.current) return;
      setStatus("error");
      retryCount.current += 1;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    function scheduleNext() {
      if (!mountedRef.current) return;
      const delay = status === "error"
        ? Math.min(3_000 * Math.pow(2, retryCount.current - 1), 30_000)
        : 3_000;
      timeoutId = setTimeout(async () => {
        if (status === "error") setStatus("connecting");
        await fetchBlock();
        scheduleNext();
      }, delay);
    }

    fetchBlock().then(scheduleNext);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchBlock]);

  useEffect(() => {
    if (shouldScroll.current) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [txs]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    shouldScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const { displayed, argCount } = useMemo(() => {
    const argTxs = txs.filter(tx => getArgLabel(tx.to) !== null);
    return { displayed: filterARG ? argTxs : txs, argCount: argTxs.length };
  }, [txs, filterARG]);

  const statusDotClass =
    status === "live"  ? "dot dot-amber" :
    status === "error" ? "dot dot-red"   : "dot dot-mono";
  const statusColor =
    status === "live"  ? "var(--amber)"   :
    status === "error" ? "var(--crimson)" : "var(--orange)";
  const statusLabel =
    status === "live"  ? "FEED LIVE" :
    status === "error" ? `SIGNAL LOST #${retryCount.current}` : "CONNECTING";

  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100dvh - 3.5rem)" }}
    >
      {/* ── SURVEILLANCE HEADER ───────────────────────────────────── */}
      <div
        style={{
          background:     "rgba(3,1,8,0.97)",
          borderBottom:   "1px solid var(--wire-amber)",
          backdropFilter: "blur(20px)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, var(--amber) 30%, var(--mono) 70%, transparent)",
          }}
          aria-hidden="true"
        />

        {/* Top row */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
              <span
                className="absolute w-full h-full rounded-full"
                style={{ background: statusColor, opacity: 0.10 }}
                aria-hidden="true"
              />
              <span className={statusDotClass} style={{ width: "10px", height: "10px" }} aria-hidden="true" />
            </div>

            <div>
              <h1
                style={{
                  fontFamily: "var(--font-special-elite), monospace",
                  fontWeight: 400,
                  fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--ink)",
                }}
              >
                Surveillance Feed
              </h1>
              <p style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.2em", color: statusColor, marginTop: "2px" }}>
                {statusLabel} · MONAD TESTNET
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {latestBlock !== null && (
              <div className="hidden sm:flex flex-col items-end">
                <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.2em", color: "var(--ink-low)" }}>LATEST BLOCK</span>
                <span className="tabular-nums" style={{ ...mono, fontSize: "0.82rem", color: "var(--amber)", letterSpacing: "0.06em" }}>
                  #{latestBlock.toString()}
                </span>
              </div>
            )}
            <div className="flex flex-col items-end">
              <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.2em", color: "var(--ink-low)" }}>BUFFER</span>
              <span className="tabular-nums" style={{ ...mono, fontSize: "0.82rem", color: "var(--ink)", letterSpacing: "0.06em" }}>
                {txs.length}/{MAX_TXS}
              </span>
            </div>
          </div>
        </div>

        {/* Filter + legend row */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3"
          style={{ borderTop: "1px solid rgba(212,165,116,0.08)", background: "rgba(212,165,116,0.02)" }}
        >
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: "rgba(212,165,116,0.7)" }} aria-hidden="true" />
              <span style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.16em", color: "var(--ink-low)" }}>ARG contract tx</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: "rgba(110,84,255,0.7)" }} aria-hidden="true" />
              <span style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.16em", color: "var(--ink-low)" }}>calldata detected</span>
            </span>
          </div>

          <button
            onClick={() => setFilterARG(f => !f)}
            className="flex items-center gap-2 min-h-[44px] px-4 transition-all duration-200 cursor-pointer"
            style={{
              ...mono,
              fontSize:      "0.68rem",
              letterSpacing: "0.16em",
              border:     filterARG ? "1px solid var(--amber-wire)" : "1px solid var(--wire)",
              background:  filterARG ? "var(--amber-fog)"          : "var(--mono-fog)",
              color:       filterARG ? "var(--amber)"              : "var(--ink-low)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: filterARG ? "var(--amber)" : "var(--ink-low)" }} aria-hidden="true" />
            ARG ONLY
            {argCount > 0 && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded-sm"
                style={{ background: "rgba(212,165,116,0.14)", color: "var(--amber)", fontSize: "0.65rem" }}
              >
                {argCount}
              </span>
            )}
          </button>
        </div>

        {/* Column headers */}
        <div
          className="hidden sm:grid px-4 sm:px-6 py-2"
          style={{
            gridTemplateColumns: "80px 150px 130px 130px 1fr",
            gap: "12px",
            borderTop: "1px solid rgba(212,165,116,0.06)",
            background: "rgba(212,165,116,0.015)",
          }}
        >
          {["BLOCK", "TX HASH", "FROM", "TO", "CALLDATA"].map(h => (
            <span key={h} style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.22em", color: "var(--ink-low)" }}>{h}</span>
          ))}
        </div>
      </div>

      {/* ── FEED ─────────────────────────────────────────────────── */}
      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto no-scrollbar"
        style={{ background: "rgba(3,1,8,0.55)" }}
      >
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <span
              className="animate-pulse"
              style={{ ...mono, fontSize: "0.72rem", letterSpacing: "0.22em", color: "var(--ink-low)" }}
            >
              {filterARG ? "NO ARG TRANSACTIONS INTERCEPTED" : "AWAITING SIGNAL"}
            </span>
            <span style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.14em", color: "var(--ink-trace)" }}>
              {filterARG ? "Toggle filter to see all transactions" : "Monitoring Monad Testnet — polling every 3s"}
            </span>
          </div>
        ) : displayed.map(tx => {
          const argLabel    = getArgLabel(tx.to);
          const isARG       = argLabel !== null;
          const hasCalldata = tx.input !== "0x";
          const { display, decoded } = decodeInputCached(tx.input);

          return (
            <a
              key={tx.key}
              href={`https://testnet.monadexplorer.com/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-all duration-150"
              style={{
                borderBottom: `1px solid ${isARG ? "rgba(212,165,116,0.14)" : "rgba(110,84,255,0.07)"}`,
                background:   isARG ? "rgba(212,165,116,0.035)" : "transparent",
                borderLeft:   isARG ? "2px solid rgba(212,165,116,0.5)" : "2px solid transparent",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = isARG ? "rgba(212,165,116,0.08)" : "rgba(110,84,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = isARG ? "rgba(212,165,116,0.035)" : "transparent")}
            >
              {/* Desktop row */}
              <div
                className="hidden sm:grid px-4 sm:px-6 py-2 items-center"
                style={{ gridTemplateColumns: "80px 150px 130px 130px 1fr", gap: "12px" }}
              >
                <span className="tabular-nums" style={{ ...mono, fontSize: "0.72rem", color: "var(--ink-low)" }}>
                  {tx.blockNumber.toString()}
                </span>
                <span style={{ ...mono, fontSize: "0.72rem", color: isARG ? "var(--amber)" : "var(--cyan)", opacity: 0.9 }}>
                  {shorten(tx.hash, 10, 6)}
                </span>
                <span style={{ ...mono, fontSize: "0.72rem", color: "var(--ink-mid)" }}>
                  {shorten(tx.from, 8, 5)}
                </span>
                <span className="truncate" style={{ ...mono, fontSize: "0.72rem" }}>
                  {isARG ? (
                    <span style={{ color: "var(--amber)" }}>{argLabel}</span>
                  ) : tx.to ? (
                    <span style={{ color: "var(--ink-low)" }}>{shorten(tx.to, 6, 4)}</span>
                  ) : (
                    <span style={{ color: "var(--ink-trace)", fontStyle: "italic" }}>deploy</span>
                  )}
                </span>
                <span className="flex items-center gap-2 min-w-0">
                  {isARG ? (
                    <>
                      <span
                        className="evidence-tag shrink-0"
                        style={{ fontSize: "0.58rem", letterSpacing: "0.14em" }}
                      >
                        ARG TX
                      </span>
                      {hasCalldata && (
                        <span className="truncate" style={{ ...mono, fontSize: "0.72rem", color: "rgba(212,165,116,0.7)" }}>
                          {display || tx.input.slice(0, 42)}
                        </span>
                      )}
                    </>
                  ) : hasCalldata ? (
                    <>
                      <span
                        className="case-badge shrink-0"
                        style={{ fontSize: "0.58rem", letterSpacing: "0.14em" }}
                      >
                        CLUE?
                      </span>
                      <span className="truncate" style={{ ...mono, fontSize: "0.72rem", color: decoded ? "var(--mono-pale)" : "var(--ink-low)" }}>{display}</span>
                    </>
                  ) : (
                    <span style={{ ...mono, fontSize: "0.72rem", color: "var(--ink-trace)", fontStyle: "italic" }}>transfer</span>
                  )}
                </span>
              </div>

              {/* Mobile row */}
              <div className="sm:hidden px-4 py-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span style={{ ...mono, fontSize: "0.75rem", color: isARG ? "var(--amber)" : "var(--cyan)", opacity: 0.9 }}>
                    {shorten(tx.hash, 12, 6)}
                  </span>
                  {isARG ? (
                    <span className="evidence-tag" style={{ fontSize: "0.58rem" }}>ARG TX</span>
                  ) : hasCalldata ? (
                    <span className="case-badge" style={{ fontSize: "0.58rem" }}>CLUE?</span>
                  ) : null}
                </div>
                <div className="flex items-center gap-3" style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.12em", color: "var(--ink-low)" }}>
                  <span className="tabular-nums">#{tx.blockNumber.toString()}</span>
                  <span>{shorten(tx.from, 8, 4)}</span>
                  {isARG && <span style={{ color: "var(--amber)" }}>{argLabel}</span>}
                </div>
                {hasCalldata && display && (
                  <span className="truncate" style={{ ...mono, fontSize: "0.65rem", color: isARG ? "rgba(212,165,116,0.75)" : decoded ? "var(--mono-pale)" : "var(--ink-low)" }}>
                    {display}
                  </span>
                )}
              </div>
            </a>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── STATUS BAR ───────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 shrink-0"
        style={{
          background:     "rgba(3,1,8,0.97)",
          borderTop:      "1px solid var(--wire-amber)",
          backdropFilter: "blur(16px)",
        }}
      >
        <span className="label-case" style={{ color: "var(--ink-low)" }}>
          CHAIN_DETECTIVE · MONAD TESTNET
        </span>
        <Link
          href="/play"
          className="flex items-center min-h-[44px] transition-colors duration-200"
          style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--ink-low)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--amber)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-low)")}
        >
          OPEN CASE →
        </Link>
      </div>
    </div>
  );
}
