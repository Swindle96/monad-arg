"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPublicClient, http } from "viem";
import { hexToBytes } from "viem/utils";
import { monadTestnet } from "@/lib/wagmi";
import Link from "next/link";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "https://testnet-rpc.monad.xyz";

const client = createPublicClient({
  chain: monadTestnet,
  transport: http(rpcUrl),
  pollingInterval: 2_000,
});

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

export default function ExplorePage() {
  const [txs, setTxs]                 = useState<TxEntry[]>([]);
  const [latestBlock, setLatestBlock] = useState<bigint | null>(null);
  const [status, setStatus]           = useState<"connecting" | "live" | "error">("connecting");
  const [filterARG, setFilterARG]     = useState(false);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const shouldScroll = useRef(true);
  const listRef      = useRef<HTMLDivElement>(null);
  const unwatchRef   = useRef<(() => void) | null>(null);
  const retryCount   = useRef(0);
  const retryTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startWatcher = useCallback(() => {
    if (unwatchRef.current) unwatchRef.current();
    const unwatch = client.watchBlocks({
      includeTransactions: true,
      onBlock(block) {
        setStatus("live");
        retryCount.current = 0;
        setLatestBlock(block.number ?? null);
        if (!Array.isArray(block.transactions) || block.transactions.length === 0) return;
        type RawTx = { hash: `0x${string}`; from: `0x${string}`; to: `0x${string}` | null; input: `0x${string}` };
        const raw = block.transactions as unknown as RawTx[];
        const entries: TxEntry[] = raw.map((tx, i) => ({
          key: `${tx.hash}-${i}`, blockNumber: block.number ?? 0n,
          hash: tx.hash, from: tx.from, to: tx.to ?? null, input: tx.input,
        }));
        setTxs(prev => [...prev, ...entries].slice(-MAX_TXS));
      },
      onError() {
        setStatus("error");
        if (unwatchRef.current) { unwatchRef.current(); unwatchRef.current = null; }
        const delay = Math.min(1000 * 2 ** retryCount.current, 30_000);
        retryCount.current += 1;
        retryTimer.current = setTimeout(() => { setStatus("connecting"); startWatcher(); }, delay);
      },
    });
    unwatchRef.current = unwatch;
  }, []);

  useEffect(() => {
    startWatcher();
    return () => {
      if (unwatchRef.current) unwatchRef.current();
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [startWatcher]);

  useEffect(() => {
    if (shouldScroll.current) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [txs]);

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    shouldScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  const displayed = filterARG ? txs.filter(tx => getArgLabel(tx.to) !== null) : txs;
  const argCount  = txs.filter(tx => getArgLabel(tx.to) !== null).length;

  const statusColor =
    status === "live"  ? "#85E6FF" :
    status === "error" ? "#FF8EE4" : "#FFAE45";
  const statusLabel =
    status === "live"  ? "LIVE" :
    status === "error" ? `ERR #${retryCount.current}` : "CONNECTING";

  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100dvh - 3.5rem)", color: "var(--text)" }}
    >
      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div
        style={{
          background:    "rgba(7,4,15,0.94)",
          borderBottom:  "1px solid rgba(110,84,255,0.2)",
          backdropFilter: "blur(20px)",
          flexShrink: 0,
        }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Pulse dot */}
            <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
              <span
                className="absolute w-full h-full rounded-full"
                style={{ background: statusColor, opacity: 0.12, animation: status === "live" ? "neon-pulse 2s ease-in-out infinite" : "none" }}
              />
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: statusColor, boxShadow: `0 0 10px ${statusColor}`, animation: status === "live" ? "neon-pulse 2s ease-in-out infinite" : "none" }}
              />
            </div>

            <div>
              <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text)", textShadow: "0 0 20px rgba(110,84,255,0.4)" }}>
                INTELLIGENCE FEED
              </h1>
              <p style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.2em", color: statusColor, marginTop: "2px" }}>
                {statusLabel} · MONAD TESTNET
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {latestBlock !== null && (
              <div className="hidden sm:flex flex-col items-end">
                <span style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.2em", color: "var(--text-dim)" }}>LATEST BLOCK</span>
                <span className="tabular-nums" style={{ ...mono, fontSize: "0.82rem", color: "var(--text)", letterSpacing: "0.06em" }}>#{latestBlock.toString()}</span>
              </div>
            )}
            <div className="flex flex-col items-end">
              <span style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.2em", color: "var(--text-dim)" }}>BUFFER</span>
              <span className="tabular-nums" style={{ ...mono, fontSize: "0.82rem", color: "var(--text)", letterSpacing: "0.06em" }}>{txs.length}/{MAX_TXS}</span>
            </div>
          </div>
        </div>

        {/* Filter + legend row */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3"
          style={{ borderTop: "1px solid rgba(110,84,255,0.12)", background: "rgba(110,84,255,0.03)" }}
        >
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: "rgba(255,174,69,0.7)" }} />
              <span style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.16em", color: "var(--text-dim)" }}>ARG contract tx</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: "rgba(110,84,255,0.7)" }} />
              <span style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.16em", color: "var(--text-dim)" }}>calldata detected</span>
            </span>
          </div>

          <button
            onClick={() => setFilterARG(f => !f)}
            className="flex items-center gap-2 min-h-[44px] px-4 transition-all duration-200 cursor-pointer"
            style={{
              ...mono,
              fontSize:      "0.68rem",
              letterSpacing: "0.16em",
              border:     filterARG ? "1px solid rgba(255,174,69,0.6)" : "1px solid rgba(110,84,255,0.25)",
              background:  filterARG ? "rgba(255,174,69,0.08)" : "rgba(110,84,255,0.04)",
              color:       filterARG ? "#FFAE45" : "var(--text-dim)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: filterARG ? "#FFAE45" : "var(--text-dim)" }} />
            ARG ONLY
            {argCount > 0 && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded-sm"
                style={{ background: "rgba(255,174,69,0.18)", color: "#FFAE45", fontSize: "0.65rem" }}
              >
                {argCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop column headers */}
        <div
          className="hidden sm:grid px-4 sm:px-6 py-2"
          style={{
            gridTemplateColumns: "80px 150px 130px 130px 1fr",
            gap: "12px",
            borderTop: "1px solid rgba(110,84,255,0.1)",
            background: "rgba(110,84,255,0.025)",
          }}
        >
          {["BLOCK", "TX HASH", "FROM", "TO", "CALLDATA"].map(h => (
            <span key={h} style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.22em", color: "var(--text-dim)" }}>{h}</span>
          ))}
        </div>
      </div>

      {/* ── FEED ─────────────────────────────────────────────────── */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ background: "rgba(7,4,15,0.5)" }}
      >
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <span
              className="animate-pulse"
              style={{ ...mono, fontSize: "0.72rem", letterSpacing: "0.22em", color: "var(--text-dim)" }}
            >
              {filterARG ? "NO ARG TRANSACTIONS YET" : "WAITING FOR BLOCKS"}
            </span>
            <span style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.14em", color: "var(--text-dim)", opacity: 0.6 }}>
              {filterARG ? "Toggle filter to see all transactions" : "Polling Monad Testnet every 2s"}
            </span>
          </div>
        ) : displayed.map(tx => {
          const argLabel    = getArgLabel(tx.to);
          const isARG       = argLabel !== null;
          const hasCalldata = tx.input !== "0x";
          const { display, decoded } = decodeInput(tx.input);

          return (
            <a
              key={tx.key}
              href={`https://testnet.monadexplorer.com/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-all duration-150"
              style={{
                borderBottom: `1px solid ${isARG ? "rgba(255,174,69,0.15)" : "rgba(110,84,255,0.07)"}`,
                background:   isARG ? "rgba(255,174,69,0.04)" : "transparent",
                borderLeft:   isARG ? "2px solid rgba(255,174,69,0.5)" : "2px solid transparent",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = isARG ? "rgba(255,174,69,0.09)" : "rgba(110,84,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = isARG ? "rgba(255,174,69,0.04)" : "transparent")}
            >
              {/* Desktop row */}
              <div
                className="hidden sm:grid px-4 sm:px-6 py-2 items-center"
                style={{ gridTemplateColumns: "80px 150px 130px 130px 1fr", gap: "12px" }}
              >
                <span className="tabular-nums" style={{ ...mono, fontSize: "0.72rem", color: "var(--text-dim)" }}>
                  {tx.blockNumber.toString()}
                </span>
                <span style={{ ...mono, fontSize: "0.72rem", color: isARG ? "#FFAE45" : "#85E6FF", opacity: 0.9 }}>
                  {shorten(tx.hash, 10, 6)}
                </span>
                <span style={{ ...mono, fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  {shorten(tx.from, 8, 5)}
                </span>
                <span className="truncate" style={{ ...mono, fontSize: "0.72rem" }}>
                  {isARG ? (
                    <span style={{ color: "#FFAE45" }}>{argLabel}</span>
                  ) : tx.to ? (
                    <span style={{ color: "var(--text-dim)" }}>{shorten(tx.to, 6, 4)}</span>
                  ) : (
                    <span style={{ color: "var(--text-dim)", fontStyle: "italic" }}>deploy</span>
                  )}
                </span>
                <span className="flex items-center gap-2 min-w-0">
                  {isARG ? (
                    <>
                      <span className="shrink-0 px-1.5 py-0.5" style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.14em", fontWeight: 700, background: "rgba(255,174,69,0.14)", color: "#FFAE45", border: "1px solid rgba(255,174,69,0.35)" }}>ARG TX</span>
                      {hasCalldata && <span className="truncate" style={{ ...mono, fontSize: "0.72rem", color: "rgba(255,174,69,0.7)" }}>{display || tx.input.slice(0, 42)}</span>}
                    </>
                  ) : hasCalldata ? (
                    <>
                      <span className="shrink-0 px-1.5 py-0.5" style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.14em", fontWeight: 700, background: "rgba(110,84,255,0.12)", color: "#6E54FF", border: "1px solid rgba(110,84,255,0.3)" }}>CLUE?</span>
                      <span className="truncate" style={{ ...mono, fontSize: "0.72rem", color: decoded ? "#DDD7FE" : "var(--text-dim)" }}>{display}</span>
                    </>
                  ) : (
                    <span style={{ ...mono, fontSize: "0.72rem", color: "var(--text-dim)", fontStyle: "italic" }}>transfer</span>
                  )}
                </span>
              </div>

              {/* Mobile row */}
              <div className="sm:hidden px-4 py-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span style={{ ...mono, fontSize: "0.75rem", color: isARG ? "#FFAE45" : "#85E6FF", opacity: 0.9 }}>
                    {shorten(tx.hash, 12, 6)}
                  </span>
                  {isARG ? (
                    <span className="px-1.5 py-0.5" style={{ ...mono, fontSize: "0.62rem", fontWeight: 700, background: "rgba(255,174,69,0.14)", color: "#FFAE45", border: "1px solid rgba(255,174,69,0.35)" }}>ARG TX</span>
                  ) : hasCalldata ? (
                    <span className="px-1.5 py-0.5" style={{ ...mono, fontSize: "0.62rem", fontWeight: 700, background: "rgba(110,84,255,0.12)", color: "#6E54FF", border: "1px solid rgba(110,84,255,0.3)" }}>CLUE?</span>
                  ) : null}
                </div>
                <div className="flex items-center gap-3" style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.12em", color: "var(--text-dim)" }}>
                  <span className="tabular-nums">#{tx.blockNumber.toString()}</span>
                  <span>{shorten(tx.from, 8, 4)}</span>
                  {isARG && <span style={{ color: "#FFAE45" }}>{argLabel}</span>}
                </div>
                {hasCalldata && display && (
                  <span className="truncate" style={{ ...mono, fontSize: "0.65rem", color: isARG ? "rgba(255,174,69,0.75)" : decoded ? "#DDD7FE" : "var(--text-dim)" }}>
                    {display}
                  </span>
                )}
              </div>
            </a>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 shrink-0"
        style={{
          background:     "rgba(7,4,15,0.94)",
          borderTop:      "1px solid rgba(110,84,255,0.18)",
          backdropFilter: "blur(16px)",
        }}
      >
        <span style={{ ...mono, fontSize: "0.65rem", letterSpacing: "0.2em", color: "var(--text-dim)" }}>
          CHAIN_DETECTIVE · MONAD TESTNET
        </span>
        <Link
          href="/play"
          className="flex items-center min-h-[44px] transition-colors duration-200 hover:text-[#6E54FF]"
          style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--text-dim)" }}
        >
          PLAY →
        </Link>
      </div>
    </div>
  );
}
