"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { keccak256, toHex, padHex, encodePacked } from "viem";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useReadContracts,
  useAccount,
  useBlockNumber,
} from "wagmi";
import { ConnectKitButton } from "connectkit";
import { puzzleChainAbi, CONTRACT_ADDRESSES } from "@/lib/contracts";

const CONTRACT_ADDRESS = CONTRACT_ADDRESSES.puzzleChain;
const EXPLORER         = "https://testnet.monadexplorer.com/tx";
const COMMIT_BLOCKS    = 3n;

type PuzzleResult = readonly [bigint, `0x${string}`, string, boolean, `0x${string}`, bigint];

interface CommitData {
  puzzleId:    string;
  answerHex:   `0x${string}`;
  nonce:       `0x${string}`;
  commitBlock: bigint;
}

const STORAGE_KEY      = "chain_detective_commit";
const WALLET_TIMEOUT_MS = 120_000;

function saveCommit(d: CommitData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...d, commitBlock: d.commitBlock.toString() }));
  } catch (e) {
    console.warn("[saveCommit] localStorage write failed:", e);
  }
}
function loadCommit(): CommitData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p || typeof p.puzzleId !== "string" || typeof p.answerHex !== "string" ||
        typeof p.nonce !== "string" || p.commitBlock == null) return null;
    return {
      puzzleId:    p.puzzleId,
      answerHex:   p.answerHex as `0x${string}`,
      nonce:       p.nonce as `0x${string}`,
      commitBlock: BigInt(p.commitBlock),
    };
  } catch { return null; }
}
function clearCommit() { localStorage.removeItem(STORAGE_KEY); }

function friendlyError(msg: string): string {
  if (msg.includes("WrongAnswer"))           return "Incorrect answer. Try again.";
  if (msg.includes("AlreadySolved"))         return "This puzzle has already been solved.";
  if (msg.includes("AlreadySolvedByPlayer")) return "You have already solved this puzzle.";
  if (msg.includes("NoPuzzleAvailable"))     return "No active puzzle at the moment.";
  if (msg.includes("TooEarlyToReveal"))      return `Wait ${COMMIT_BLOCKS} more blocks before revealing.`;
  if (msg.includes("NoCommitFound"))         return "No commitment found — commit your answer first.";
  if (msg.includes("AlreadyRevealed"))       return "You already revealed this commitment.";
  if (msg.includes("CommitForWrongPuzzle"))  return "Your commitment was for a different puzzle.";
  if (msg.includes("InvalidCommitment"))     return "Commitment doesn't match — re-commit your answer.";
  if (msg.includes("User rejected"))         return "Transaction cancelled.";
  if (msg.includes("insufficient funds"))    return "Not enough MON for gas.";
  return msg.split("\n")[0].slice(0, 120)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function Spinner() {
  return (
    <span
      className="inline-block w-4 h-4 rounded-full border-2 animate-spin shrink-0"
      style={{ borderColor: "rgba(110,84,255,0.3)", borderTopColor: "#6E54FF" }}
    />
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="inline-block shrink-0">
      <path d="M2 6L5 9L10 3" stroke="#85E6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    left:     `${(i * 37 + 11) % 100}%`,
    delay:    `${((i * 7) % 15) / 10}s`,
    duration: `${1.2 + ((i * 3) % 10) / 10}s`,
    color:    ["#6E54FF", "#85E6FF", "#FF8EE4", "#FFAE45", "#DDD7FE"][i % 5],
    size:     `${6 + (i % 3) * 3}px`,
    radius:   i % 3 === 0 ? "50%" : "2px",
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9000 }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute", top: 0, left: p.left,
          width: p.size, height: p.size,
          backgroundColor: p.color, borderRadius: p.radius,
          animation: `confetti-fall ${p.duration} ${p.delay} linear forwards`,
        }} />
      ))}
    </div>
  );
}

function BlockProgress({ blocksLeft, totalBlocks }: { blocksLeft: bigint; totalBlocks: bigint }) {
  const done = Number(totalBlocks - (blocksLeft < 0n ? 0n : blocksLeft));
  const pct  = Math.min(100, Math.round((done / Number(totalBlocks)) * 100));
  const ready = blocksLeft <= 0n;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.14em", color: ready ? "#85E6FF" : "#FFAE45" }}>
          {ready ? "READY TO REVEAL" : `WAITING — ${blocksLeft} BLOCK${blocksLeft !== 1n ? "S" : ""} LEFT`}
        </span>
        <span className="tabular-nums" style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", color: "var(--text-dim)" }}>
          {pct}%
        </span>
      </div>
      <div className="h-[2px] w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{
            width: `${pct}%`,
            background: ready ? "linear-gradient(90deg,#6E54FF,#85E6FF)" : "linear-gradient(90deg,#6E54FF,#FFAE45)",
            boxShadow: ready ? "0 0 10px rgba(133,230,255,0.7)" : "0 0 10px rgba(110,84,255,0.5)",
          }}
        />
      </div>
    </div>
  );
}

export default function PlayPage() {
  const [answer, setAnswer]            = useState("");
  const [commit, setCommit]            = useState<CommitData | null>(null);
  const [pendingCommit, setPending]    = useState<CommitData | null>(null);
  const [encodingError, setEncError]   = useState(false);
  const { address: userAddress, isConnected } = useAccount();

  useEffect(() => { setCommit(loadCommit()); }, []);

  const { data: currentBlock } = useBlockNumber({ watch: true });

  const { data: puzzleResults, isLoading: puzzleLoading } = useReadContracts({
    contracts: [
      { address: CONTRACT_ADDRESS, abi: puzzleChainAbi, functionName: "getCurrentPuzzle" },
      { address: CONTRACT_ADDRESS, abi: puzzleChainAbi, functionName: "puzzleCount" },
      { address: CONTRACT_ADDRESS, abi: puzzleChainAbi, functionName: "currentPuzzleId" },
    ],
    query: { refetchInterval: 30_000, staleTime: 15_000 },
  });

  const puzzleError       = puzzleResults?.[0]?.status === "failure";
  const rawPuzzle         = puzzleResults?.[0]?.result;
  const rawCount          = puzzleResults?.[1]?.result;
  const rawPuzzleId       = puzzleResults?.[2]?.result;

  const puzzle            = rawPuzzle as PuzzleResult | undefined;
  const puzzleDescription = puzzle?.[2] || null;
  const currentPuzzleId   = rawPuzzleId as bigint | undefined;
  const puzzleCount       = rawCount    as bigint | undefined;
  const puzzleLabel       = currentPuzzleId !== undefined
    ? `#${String(Number(currentPuzzleId) + 1).padStart(3, "0")}`
    : "#---";

  const { writeContract: writeCommit, data: commitTxHash, isPending: isCommitPending, error: commitWriteError, reset: resetCommit } = useWriteContract();
  const { isLoading: isCommitConfirming, isSuccess: isCommitConfirmed } = useWaitForTransactionReceipt({ hash: commitTxHash });

  const { writeContract: writeReveal, data: revealTxHash, isPending: isRevealPending, error: revealWriteError, reset: resetReveal } = useWriteContract();
  const { isLoading: isRevealConfirming, isSuccess: isRevealSuccess } = useWaitForTransactionReceipt({ hash: revealTxHash });

  /* Read on-chain commit to get the real commitBlock (tx may mine 1-2 blocks after initiation) */
  const { data: onChainCommitRaw, refetch: refetchOnChainCommit } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: puzzleChainAbi,
    functionName: "commits",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress, refetchInterval: 6_000 },
  });
  type OnChainCommitTuple = readonly [string, bigint, bigint, boolean];
  const onChainCommit     = onChainCommitRaw as OnChainCommitTuple | undefined;
  const onChainCommitBlock = onChainCommit && onChainCommit[0] !== "0x0000000000000000000000000000000000000000000000000000000000000000"
    ? onChainCommit[1] : undefined;

  useEffect(() => {
    if (commit && currentPuzzleId !== undefined) {
      if (commit.puzzleId !== currentPuzzleId.toString()) { clearCommit(); setCommit(null); }
    }
  }, [commit, currentPuzzleId]);

  /* After commit tx confirmed on-chain → persist data to localStorage */
  useEffect(() => {
    if (isCommitConfirmed && pendingCommit) {
      saveCommit(pendingCommit);
      setCommit(pendingCommit);
      setPending(null);
      refetchOnChainCommit();
    }
  }, [isCommitConfirmed, pendingCommit, refetchOnChainCommit]);

  /* Reset if wallet never responds within 2 minutes */
  useEffect(() => {
    if (!isCommitPending) return;
    const t = setTimeout(() => { resetCommit(); setPending(null); }, WALLET_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [isCommitPending, resetCommit]);

  useEffect(() => {
    if (!isRevealPending) return;
    const t = setTimeout(() => { resetReveal(); }, WALLET_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [isRevealPending, resetReveal]);

  /* Use real on-chain commitBlock when available; fall back to local estimate */
  const effectiveCommitBlock = onChainCommitBlock ?? commit?.commitBlock ?? 0n;
  const blocksUntilReveal = useMemo(() => {
    if (!commit || currentBlock === undefined) return 0n;
    const raw = effectiveCommitBlock + COMMIT_BLOCKS - currentBlock;
    return raw > 0n ? raw : 0n;
  }, [commit, currentBlock, effectiveCommitBlock]);
  const canReveal = commit !== null && blocksUntilReveal <= 0n && !isRevealSuccess;

  function encodeAnswer(raw: string): `0x${string}` | null {
    if (!raw.trim()) return null;
    try {
      /* Puzzle hashes were generated with uppercase bytes32 literals — always uppercase */
      const hex = padHex(toHex(raw.trim().toUpperCase()), { size: 32, dir: "right" });
      setEncError(false);
      return hex as `0x${string}`;
    } catch { setEncError(true); return null; }
  }

  function handleCommit(e: React.FormEvent) {
    e.preventDefault();
    if (!userAddress || !isConnected) return;
    const trimmed = answer.trim();
    if (!trimmed || !/^[A-Z0-9_-]{1,32}$/.test(trimmed)) { setEncError(true); return; }
    const answerHex = encodeAnswer(trimmed);
    if (!answerHex || currentPuzzleId === undefined) return;
    const nonceBytes = crypto.getRandomValues(new Uint8Array(32));
    const nonce = `0x${Array.from(nonceBytes).map(b => b.toString(16).padStart(2, "0")).join("")}` as `0x${string}`;
    /* Use encodePacked (mirrors Solidity abi.encodePacked) for type-safe hashing */
    const commitment = keccak256(encodePacked(["bytes32", "address", "bytes32"], [answerHex, userAddress, nonce]));
    const data: CommitData = { puzzleId: currentPuzzleId.toString(), answerHex, nonce, commitBlock: currentBlock ?? 0n };
    writeCommit({ address: CONTRACT_ADDRESS, abi: puzzleChainAbi, functionName: "commitAnswer", args: [commitment] });
    /* Do NOT persist yet — wait for on-chain confirmation to avoid stale local state */
    setPending(data);
  }

  function doReveal() {
    if (!commit) return;
    writeReveal({ address: CONTRACT_ADDRESS, abi: puzzleChainAbi, functionName: "revealAnswer", args: [commit.answerHex, commit.nonce] });
  }

  useEffect(() => {
    if (isRevealSuccess) { clearCommit(); setCommit(null); }
  }, [isRevealSuccess]);

  const evidenceRows = [
    { label: "PUZZLE",        value: puzzleLabel },
    { label: "TOTAL PUZZLES", value: puzzleCount !== undefined ? String(puzzleCount) : "—" },
    { label: "CONTRACT",      value: `${CONTRACT_ADDRESS.slice(0, 8)}…${CONTRACT_ADDRESS.slice(-6)}` },
  ];
  const activeError = revealWriteError ?? commitWriteError;

  return (
    <div style={{ minHeight: "100vh", color: "var(--text)" }}>
      {isRevealSuccess && <Confetti />}

      {/* ── CASE FILE HEADER ─────────────────────────────────────── */}
      <div
        style={{
          background: "rgba(14,9,28,0.94)",
          borderBottom: "1px solid rgba(110,84,255,0.2)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 flex items-center justify-between" style={{ height: "52px" }}>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center min-h-[44px] gap-2 transition-colors hover:text-[#6E54FF]"
              style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.18em", color: "var(--text-dim)" }}
            >
              ← BACK
            </Link>
            <span style={{ color: "rgba(110,84,255,0.3)", userSelect: "none" }}>|</span>
            <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.24em", color: "var(--text-dim)" }}>
              CASE FILE {puzzleLabel}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full neon-pulse"
              style={{ background: "#85E6FF", boxShadow: "0 0 8px #85E6FF" }}
            />
            <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", letterSpacing: "0.2em", color: "#85E6FF" }}>
              ACTIVE INVESTIGATION
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ──────────────────────────────────────────── */}
      <div
        className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8"
        style={{ display: "grid", gap: "24px" }}
      >
        <div className="lg:grid lg:grid-cols-[1fr_1.25fr] lg:gap-6">

          {/* ── LEFT ASIDE ────────────────────────────────────────── */}
          <aside className="mb-6 lg:mb-0 lg:sticky lg:top-24 lg:self-start flex flex-col gap-4">

            {/* Evidence panel */}
            <div className="rift-panel-hot rift-glow-border" style={{ borderRadius: "2px" }}>
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(110,84,255,0.18)" }}>
                <p className="rift-kicker">Evidence chamber</p>
                <span
                  className="neon-pulse flex items-center gap-2"
                  style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", letterSpacing: "0.18em", color: "#85E6FF", border: "1px solid rgba(133,230,255,0.3)", padding: "5px 12px" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#85E6FF", display: "inline-block" }} />
                  ACTIVE
                </span>
              </div>

              {/* Puzzle ID */}
              <div className="px-6 pt-6 pb-4">
                <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.62rem", letterSpacing: "0.28em", color: "var(--text-dim)", marginBottom: "8px" }}>
                  CASE IDENTIFIER
                </p>
                <h1
                  className="rift-title-3d select-none"
                  style={{ fontSize: "clamp(2.8rem, 7vw, 4.2rem)", lineHeight: 0.9, marginBottom: "20px" }}
                >
                  Puzzle
                  <span className="block" style={{ color: "#6E54FF" }}>{puzzleLabel}</span>
                </h1>
                <div className="rift-line mb-5 w-16" />

                {/* Mission briefing */}
                <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", letterSpacing: "0.22em", color: "var(--text-dim)", marginBottom: "10px" }}>
                  MISSION BRIEFING
                </p>
                {puzzleLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[1, 0.8, 0.6].map((w, i) => (
                      <div key={i} className="animate-pulse rounded" style={{ height: "12px", width: `${w * 100}%`, background: "rgba(110,84,255,0.1)" }} />
                    ))}
                  </div>
                ) : (
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.9rem", lineHeight: 1.75, color: "var(--text-muted)" }}>
                    {puzzleDescription || (
                      <span style={{ color: "var(--text-dim)" }}>
                        {puzzleError && puzzleCount === undefined
                          ? "Could not reach contract — check RPC connection."
                          : "No puzzle has been added yet. Check back soon."}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Evidence rows */}
              <div style={{ borderTop: "1px solid rgba(110,84,255,0.14)" }}>
                {evidenceRows.map(({ label, value }, i) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: i < evidenceRows.length - 1 ? "1px solid rgba(110,84,255,0.08)" : "none" }}
                  >
                    <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--text-dim)" }}>{label}</span>
                    <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.78rem", color: "#85E6FF" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocol details */}
            <details className="rift-panel" style={{ borderRadius: "2px" }}>
              <summary
                style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.18em", color: "#6E54FF", cursor: "pointer", minHeight: "44px", display: "flex", alignItems: "center", padding: "0 20px" }}
              >
                PROTOCOL DETAILS
              </summary>
              <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: "10px", fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                <p><span style={{ color: "var(--text)" }}>Step 1 — Commit:</span> Submit a hidden hash of your answer. No one in the mempool can read the answer itself.</p>
                <p><span style={{ color: "var(--text)" }}>Step 2 — Reveal</span> after {COMMIT_BLOCKS.toString()} blocks: reveal your answer on-chain so the contract can verify it against your commitment.</p>
              </div>
            </details>
          </aside>

          {/* ── RIGHT CONTENT ─────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Success banner */}
            {isRevealSuccess && (
              <div className="rift-panel-hot" style={{ borderRadius: "2px", padding: "20px" }}>
                <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.2em", color: "#85E6FF", fontWeight: 700, marginBottom: "6px" }}>
                  PUZZLE SOLVED!
                </p>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  You are on the leaderboard.{" "}
                  {revealTxHash && (
                    <a href={`${EXPLORER}/${revealTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#6E54FF" }}>
                      View transaction ↗
                    </a>
                  )}
                </p>
              </div>
            )}

            {/* Operations console */}
            <div className="rift-panel" style={{ borderRadius: "2px", overflow: "hidden" }}>

              {/* Console title bar */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ background: "rgba(110,84,255,0.07)", borderBottom: "1px solid rgba(110,84,255,0.16)" }}
              >
                <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", letterSpacing: "0.22em", color: "var(--text-dim)" }}>
                  OPERATIONS CONSOLE
                </span>
                <div className="flex gap-1.5" aria-hidden="true">
                  {["#FF8EE4", "#FFAE45", "#85E6FF"].map((c, i) => (
                    <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.55 }} />
                  ))}
                </div>
              </div>

              {!isConnected ? (
                <div style={{ padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.22em", color: "var(--text-dim)", marginBottom: "8px" }}>WALLET REQUIRED</p>
                    <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                      Connect your wallet to submit answers on-chain.
                    </p>
                  </div>
                  <ConnectKitButton />
                </div>
              ) : (
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>

                  {/* Step 1 */}
                  <div>
                    <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.18em", color: "#6E54FF", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                      STEP 1 — COMMIT {commit ? <CheckIcon /> : null}
                    </p>

                    {pendingCommit && (isCommitPending || isCommitConfirming) ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", border: "1px solid rgba(255,174,69,0.3)", background: "rgba(255,174,69,0.04)" }}>
                        <Spinner />
                        <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", color: "#FFAE45" }}>
                          {isCommitPending ? "CONFIRM IN WALLET…" : "WAITING FOR CONFIRMATION…"}
                        </span>
                      </div>
                    ) : commit ? (
                      <div
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "12px 16px", border: "1px solid rgba(110,84,255,0.22)", background: "rgba(110,84,255,0.05)" }}
                      >
                        <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          Committed at block <span style={{ color: "var(--text)" }}>{(onChainCommitBlock ?? commit.commitBlock).toString()}</span>. Proceed to Step 2.
                        </span>
                        <button
                          type="button"
                          onClick={() => { clearCommit(); setCommit(null); resetCommit(); resetReveal(); }}
                          className="inline-flex items-center min-h-[44px] px-2 hover:opacity-80 transition-opacity"
                          style={{ color: "#FF8EE4", cursor: "pointer", background: "none", border: "none", fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", flexShrink: 0 }}
                        >
                          [reset]
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleCommit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <label
                              htmlFor="answer-input"
                              style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.22em", color: "var(--text-dim)", display: "block" }}
                            >
                              ANSWER
                            </label>
                            <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.62rem", color: "var(--text-dim)", letterSpacing: "0.14em" }}>
                              ONE WORD · UPPERCASE
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(110,84,255,0.28)", background: "rgba(7,4,15,0.8)" }}>
                            <span style={{ padding: "0 12px", color: "#6E54FF", fontFamily: "var(--font-roboto-mono)", fontSize: "0.85rem", userSelect: "none" }} aria-hidden="true">›</span>
                            <input
                              id="answer-input"
                              type="text"
                              value={answer}
                              onChange={e => { setAnswer(e.target.value.toUpperCase()); resetCommit(); }}
                              placeholder="ENTER YOUR ANSWER..."
                              disabled={isCommitPending || isCommitConfirming}
                              aria-invalid={encodingError}
                              aria-describedby={encodingError ? "answer-error" : undefined}
                              style={{
                                flex: 1, background: "transparent", padding: "13px 12px 13px 0",
                                fontSize: "0.9rem", color: "var(--text)", outline: "none",
                                fontFamily: "var(--font-inter)", caretColor: "#6E54FF",
                                opacity: (isCommitPending || isCommitConfirming) ? 0.5 : 1,
                              }}
                              autoComplete="off"
                              spellCheck={false}
                            />
                          </div>
                          {encodingError && (
                            <p id="answer-error" role="alert" style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", color: "#FF8EE4" }}>
                              Answer exceeds 32 bytes — shorten it.
                            </p>
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={isCommitPending || isCommitConfirming || !answer.trim() || puzzleLoading}
                          className="rift-btn-ghost"
                          style={{ justifyContent: "center" }}
                        >
                          {isCommitPending || isCommitConfirming ? (
                            <><Spinner />{isCommitPending ? "CONFIRM IN WALLET" : "COMMITTING…"}</>
                          ) : "COMMIT ANSWER"}
                        </button>
                      </form>
                    )}
                  </div>

                  <div className="rift-line" />

                  {/* Step 2 */}
                  <div>
                    <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.18em", color: "#85E6FF", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                      STEP 2 — REVEAL {isRevealSuccess ? <CheckIcon /> : null}
                    </p>
                    {!commit ? (
                      <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", color: "var(--text-dim)" }}>Complete Step 1 first.</p>
                    ) : isRevealSuccess ? (
                      <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", color: "#85E6FF" }}>Answer revealed and verified on-chain!</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ padding: "14px 16px", border: "1px solid rgba(110,84,255,0.2)", background: "rgba(110,84,255,0.04)" }}>
                          <BlockProgress blocksLeft={blocksUntilReveal < 0n ? 0n : blocksUntilReveal} totalBlocks={COMMIT_BLOCKS} />
                          {currentBlock !== undefined && (
                            <p className="tabular-nums" style={{ marginTop: "8px", fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", color: "var(--text-dim)" }}>
                              Block #{currentBlock.toString()}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={doReveal}
                          disabled={!canReveal || isRevealPending || isRevealConfirming}
                          className="rift-btn"
                          style={{ justifyContent: "center" }}
                        >
                          {isRevealPending || isRevealConfirming ? (
                            <><Spinner />{isRevealPending ? "CONFIRM IN WALLET" : "VERIFYING…"}</>
                          ) : "REVEAL ANSWER"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* TX status */}
            {(commitTxHash || revealTxHash || activeError) && (
              <div className="rift-panel" style={{ borderRadius: "2px", padding: "20px" }}>
                <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.2em", color: "var(--text-dim)", marginBottom: "14px" }}>
                  TRANSACTION STATUS
                </p>
                {activeError && (
                  <div style={{ marginBottom: "12px" }}>
                    <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.18em", color: "#FF8EE4", display: "block", marginBottom: "4px" }}>ERROR</span>
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "var(--text-muted)" }}>{friendlyError(activeError.message)}</span>
                  </div>
                )}
                {commitTxHash && (
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "8px" }}>
                    <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--text-dim)", flexShrink: 0 }}>COMMIT TX</span>
                    <a href={`${EXPLORER}/${commitTxHash}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", color: "#6E54FF", wordBreak: "break-all", textAlign: "right" }}>
                      {commitTxHash} ↗
                    </a>
                  </div>
                )}
                {revealTxHash && (
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                    <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--text-dim)", flexShrink: 0 }}>REVEAL TX</span>
                    <a href={`${EXPLORER}/${revealTxHash}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", color: "#85E6FF", wordBreak: "break-all", textAlign: "right" }}>
                      {revealTxHash} ↗
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
