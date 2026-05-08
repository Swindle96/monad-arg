"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { getPuzzleMeta, CATEGORY_COLORS } from "@/lib/puzzleData";

const CONTRACT_ADDRESS       = CONTRACT_ADDRESSES.puzzleChain;
const EXPLORER               = "https://testnet.monadexplorer.com/tx";
const FALLBACK_COMMIT_BLOCKS = 10n;

type PuzzleData = {
  id: bigint;
  answerHash: `0x${string}`;
  description: string;
  solved: boolean;
  solver: `0x${string}`;
  solvedAtBlock: bigint;
};

type CommitRecord = {
  commitment: `0x${string}`;
  commitBlock: bigint;
  puzzleId: bigint;
  revealed: boolean;
};

interface CommitData {
  puzzleId:    string;
  answerHex:   `0x${string}`;
  nonce:       `0x${string}`;
  commitBlock: bigint;
}

const STORAGE_KEY       = "chain_detective_commit";
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

function downloadBackup(d: CommitData) {
  const json = JSON.stringify({ ...d, commitBlock: d.commitBlock.toString() }, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `chain-detective-commit-${d.puzzleId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function friendlyError(msg: string, commitBlocks = FALLBACK_COMMIT_BLOCKS): string {
  if (msg.includes("WrongAnswer"))           return "Incorrect answer. Try again.";
  if (msg.includes("AlreadySolved"))         return "This puzzle has already been solved.";
  if (msg.includes("AlreadySolvedByPlayer")) return "You have already solved this puzzle.";
  if (msg.includes("NoPuzzleAvailable"))     return "No active puzzle at the moment.";
  if (msg.includes("TooEarlyToReveal"))      return `Wait ${commitBlocks} more blocks before revealing.`;
  if (msg.includes("NoCommitFound"))         return "No commitment found — commit your answer first.";
  if (msg.includes("AlreadyRevealed"))       return "You already revealed this commitment.";
  if (msg.includes("CommitForWrongPuzzle"))  return "Your commitment was for a different puzzle.";
  if (msg.includes("InvalidCommitment"))     return "Commitment doesn't match — re-commit your answer.";
  if (msg.includes("User rejected"))         return "Transaction cancelled.";
  if (msg.includes("insufficient funds"))    return "Not enough MON for gas.";
  return msg.split("\n")[0].slice(0, 120);
}

function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: "14px",
        height: "14px",
        borderRadius: "50%",
        border: "2px solid var(--border-2)",
        borderTopColor: "var(--purple)",
        animation: "spin-slow 0.7s linear infinite",
        flexShrink: 0,
      }}
      aria-label="Loading"
    />
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ display: "inline-block", flexShrink: 0 }}>
      <path d="M2 7L6 11L12 3" stroke="var(--acid)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CONFETTI_PIECES = Array.from({ length: 50 }, (_, i) => ({
  left:     `${(i * 37 + 11) % 100}%`,
  delay:    `${((i * 7) % 15) / 10}s`,
  duration: `${1.2 + ((i * 3) % 10) / 10}s`,
  color:    ["#9B7FFC", "#C8FF00", "#00CFFF", "#00E87A", "#FF3B30"][i % 5],
  size:     `${6 + (i % 3) * 3}px`,
  radius:   i % 3 === 0 ? "50%" : "1px",
}));

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9000 }} aria-hidden="true">
      {CONFETTI_PIECES.map((p, i) => (
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

function extractAnswerFormat(description: string): string | null {
  const match = description.match(/Answer:\s*(.+?)\.?\s*$/i);
  return match ? match[1].replace(/\.$/, "").trim() : null;
}

const mono: React.CSSProperties = { fontFamily: "var(--font-mono), monospace" };

function BlockProgress({ blocksLeft, totalBlocks }: { blocksLeft: bigint; totalBlocks: bigint }) {
  const done  = Number(totalBlocks - (blocksLeft < 0n ? 0n : blocksLeft));
  const pct   = Math.min(100, Math.round((done / Number(totalBlocks)) * 100));
  const ready = blocksLeft <= 0n;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.14em", color: ready ? "var(--acid)" : "var(--text-dim)" }}>
          {ready ? "SEAL READY TO BREAK" : `HOLD — ${blocksLeft} BLOCK${blocksLeft !== 1n ? "S" : ""} REMAINING`}
        </span>
        <span className="tabular-nums" style={{ ...mono, fontSize: "0.64rem", color: "var(--text-faint)" }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: "2px", width: "100%", overflow: "hidden", background: "var(--border-2)" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            transition: "width 0.5s ease",
            background: ready ? "var(--acid)" : "var(--purple)",
            boxShadow: ready ? "0 0 8px var(--acid)" : "0 0 8px var(--purple-glow)",
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
  const pendingCommitRef               = useRef<CommitData | null>(null);
  const importRef                      = useRef<HTMLInputElement>(null);
  const { address: userAddress, isConnected } = useAccount();

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!parsed.puzzleId || !parsed.answerHex || !parsed.nonce || parsed.commitBlock == null) return;
        const data: CommitData = {
          puzzleId:    String(parsed.puzzleId),
          answerHex:   parsed.answerHex as `0x${string}`,
          nonce:       parsed.nonce as `0x${string}`,
          commitBlock: BigInt(parsed.commitBlock),
        };
        saveCommit(data);
        setCommit(data);
      } catch { /* invalid file */ }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  useEffect(() => { pendingCommitRef.current = pendingCommit; }, [pendingCommit]);
  useEffect(() => { setCommit(loadCommit()); }, []);

  const { data: currentBlock } = useBlockNumber({ watch: true });

  const { data: commitBlocksData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: puzzleChainAbi,
    functionName: "COMMIT_BLOCKS",
    query: { staleTime: Infinity },
  });
  const COMMIT_BLOCKS = (commitBlocksData as bigint | undefined) ?? FALLBACK_COMMIT_BLOCKS;

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

  const puzzle          = rawPuzzle as PuzzleData | undefined;
  const currentPuzzleId = rawPuzzleId as bigint | undefined;
  const puzzleCount     = rawCount    as bigint | undefined;
  const puzzleLabel     = currentPuzzleId !== undefined
    ? `#${String(Number(currentPuzzleId) + 1).padStart(3, "0")}`
    : "#---";

  const puzzleMeta        = currentPuzzleId !== undefined ? getPuzzleMeta(Number(currentPuzzleId)) : undefined;
  const puzzleDescription = puzzle?.description?.trim() || puzzleMeta?.description || null;
  const categoryColor     = puzzleMeta ? CATEGORY_COLORS[puzzleMeta.category] : "var(--purple)";
  const answerFormat      = puzzleMeta ? extractAnswerFormat(puzzleMeta.description) : null;

  const { writeContract: writeCommit, data: commitTxHash, isPending: isCommitPending, error: commitWriteError, reset: resetCommit } = useWriteContract();
  const { isLoading: isCommitConfirming, isSuccess: isCommitConfirmed } = useWaitForTransactionReceipt({ hash: commitTxHash });
  const { writeContract: writeReveal, data: revealTxHash, isPending: isRevealPending, error: revealWriteError, reset: resetReveal } = useWriteContract();
  const { isLoading: isRevealConfirming, isSuccess: isRevealSuccess } = useWaitForTransactionReceipt({ hash: revealTxHash });

  const { data: onChainCommitRaw, refetch: refetchOnChainCommit } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: puzzleChainAbi,
    functionName: "commits",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress, refetchInterval: 6_000 },
  });
  const onChainCommit      = onChainCommitRaw as CommitRecord | undefined;
  const onChainCommitBlock = onChainCommit && onChainCommit.commitment !== "0x0000000000000000000000000000000000000000000000000000000000000000"
    ? onChainCommit.commitBlock : undefined;

  useEffect(() => {
    if (commit && currentPuzzleId !== undefined) {
      if (commit.puzzleId !== currentPuzzleId.toString()) { clearCommit(); setCommit(null); }
    }
  }, [commit, currentPuzzleId]);

  useEffect(() => {
    if (isCommitConfirmed && pendingCommit) {
      saveCommit(pendingCommit);
      setCommit(pendingCommit);
      setPending(null);
      refetchOnChainCommit();
    }
  }, [isCommitConfirmed, pendingCommit, refetchOnChainCommit]);

  useEffect(() => {
    if (!isCommitPending) return;
    const t = setTimeout(async () => {
      const pending = pendingCommitRef.current;
      resetCommit();
      if (!pending) return;
      try {
        const result = await refetchOnChainCommit();
        const onChain = result.data as CommitRecord | undefined;
        const hasOnChain = onChain?.commitment !== "0x0000000000000000000000000000000000000000000000000000000000000000";
        if (hasOnChain) { saveCommit(pending); setCommit(pending); }
      } catch { /* refetch failed */ }
      setPending(null);
    }, WALLET_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [isCommitPending, resetCommit, refetchOnChainCommit]);

  useEffect(() => {
    if (!isRevealPending) return;
    const t = setTimeout(() => { resetReveal(); }, WALLET_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [isRevealPending, resetReveal]);

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
      const hex = padHex(toHex(raw.trim()), { size: 32, dir: "right" });
      setEncError(false);
      return hex as `0x${string}`;
    } catch { setEncError(true); return null; }
  }

  function handleCommit(e: React.FormEvent) {
    e.preventDefault();
    if (!userAddress || !isConnected) return;
    if (currentBlock === undefined) return;
    const trimmed = answer.trim();
    if (!trimmed || !/^[A-Za-z0-9_.+/=-]{1,32}$/.test(trimmed)) { setEncError(true); return; }
    const answerHex = encodeAnswer(trimmed);
    if (!answerHex || currentPuzzleId === undefined) return;
    const nonceBytes = crypto.getRandomValues(new Uint8Array(32));
    const nonce = `0x${Array.from(nonceBytes).map(b => b.toString(16).padStart(2, "0")).join("")}` as `0x${string}`;
    const commitment = keccak256(encodePacked(["bytes32", "address", "bytes32"], [answerHex, userAddress, nonce]));
    const data: CommitData = { puzzleId: currentPuzzleId.toString(), answerHex, nonce, commitBlock: currentBlock };
    writeCommit({ address: CONTRACT_ADDRESS, abi: puzzleChainAbi, functionName: "commitAnswer", args: [commitment] });
    setPending(data);
  }

  function doReveal() {
    if (!commit) return;
    writeReveal({ address: CONTRACT_ADDRESS, abi: puzzleChainAbi, functionName: "revealAnswer", args: [commit.answerHex, commit.nonce] });
  }

  useEffect(() => {
    if (isRevealSuccess) { clearCommit(); setCommit(null); }
  }, [isRevealSuccess]);

  const evidenceRows = useMemo(() => [
    { label: "CASE NO.",    value: puzzleLabel },
    { label: "TOTAL CASES", value: puzzleCount !== undefined ? String(puzzleCount) : "—" },
    { label: "CONTRACT",    value: `${CONTRACT_ADDRESS.slice(0, 8)}…${CONTRACT_ADDRESS.slice(-6)}` },
  ], [puzzleLabel, puzzleCount]);

  const activeError = revealWriteError ?? commitWriteError;

  return (
    <div style={{ minHeight: "100vh" }}>
      {isRevealSuccess && <Confetti />}
      {isRevealSuccess && (
        <span
          role="status"
          aria-live="assertive"
          style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
        >
          Puzzle solved. Your answer has been verified on-chain.
        </span>
      )}

      {/* ── STICKY SUB-HEADER ─────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: "56px",
          zIndex: 30,
          background: "rgba(7,7,7,0.95)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
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
              CASE FILE {puzzleLabel}
            </span>
          </div>
          <div className="hidden sm:flex" style={{ alignItems: "center", gap: "8px" }}>
            <span className="dot dot-green" style={{ width: "6px", height: "6px" }} aria-hidden="true" />
            <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.20em", color: "var(--green)" }}>
              INVESTIGATION OPEN
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ───────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "32px 24px",
          display: "grid",
          gap: "24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "20px",
          }}
          className="lg:grid-cols-[1fr_1.3fr]"
        >
          {/* ── LEFT — CASE BRIEF ─────────────────────────────── */}
          <aside
            className="lg:sticky lg:top-[104px] lg:self-start"
            style={{ display: "flex", flexDirection: "column", gap: "12px", zIndex: 2 }}
          >
            {/* Case panel */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Accent top */}
              <div
                style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, var(--purple), var(--acid))" }}
                aria-hidden="true"
              />

              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 24px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.22em", color: "var(--text-faint)" }}>
                  EVIDENCE DOSSIER
                </span>
                <span className="tag tag-green" style={{ fontSize: "0.56rem" }}>
                  <span className="dot dot-green" style={{ width: "4px", height: "4px" }} aria-hidden="true" />
                  ACTIVE
                </span>
              </div>

              {/* Case number */}
              <div style={{ padding: "24px" }}>
                <p style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.22em", color: "var(--text-faint)", marginBottom: "8px" }}>
                  CASE IDENTIFIER
                </p>
                <h1
                  className="display"
                  style={{
                    fontSize: "clamp(2.4rem, 6vw, 3.8rem)",
                    marginBottom: "20px",
                    color: "var(--text)",
                  }}
                >
                  CASE{" "}
                  <span style={{ color: "var(--purple)" }}>{puzzleLabel}</span>
                </h1>

                {/* Category badge */}
                {puzzleMeta && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      border: `1px solid ${categoryColor}44`,
                      background: `${categoryColor}0D`,
                      marginBottom: "20px",
                    }}
                  >
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: categoryColor, display: "inline-block" }} aria-hidden="true" />
                    <span style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.20em", color: categoryColor }}>
                      {puzzleMeta.category.toUpperCase()}
                    </span>
                  </div>
                )}

                <div style={{ width: "40px", height: "1px", background: "var(--border-2)", marginBottom: "20px" }} />

                <p style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.22em", color: "var(--text-faint)", marginBottom: "12px" }}>
                  MISSION BRIEFING
                </p>

                {puzzleLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[1, 0.85, 0.65].map((w, i) => (
                      <div key={i} className="animate-pulse" style={{ height: "12px", width: `${w * 100}%`, background: "var(--raised)" }} />
                    ))}
                  </div>
                ) : (
                  <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "0.9rem", lineHeight: 1.75, color: "var(--text-dim)" }}>
                    {puzzleDescription || (
                      <span style={{ color: "var(--text-faint)" }}>
                        {puzzleError && puzzleCount === undefined
                          ? "Could not reach contract — check RPC connection."
                          : "No puzzle has been added yet. Check back soon."}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Evidence rows */}
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {evidenceRows.map(({ label, value }, i) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 24px",
                      borderBottom: i < evidenceRows.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.20em", color: "var(--text-faint)" }}>{label}</span>
                    <span style={{ ...mono, fontSize: "0.78rem", color: "var(--text-dim)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocol accordion */}
            <details
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <summary
                style={{
                  ...mono,
                  fontSize: "0.62rem",
                  letterSpacing: "0.22em",
                  cursor: "pointer",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 24px",
                  color: "var(--text-faint)",
                  listStyle: "none",
                  userSelect: "none",
                }}
              >
                FIELD PROTOCOL
              </summary>
              <div
                style={{
                  padding: "0 24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "0.875rem",
                  color: "var(--text-dim)",
                  lineHeight: 1.7,
                  borderTop: "1px solid var(--border)",
                  paddingTop: "16px",
                }}
              >
                <p><span style={{ color: "var(--text)" }}>Phase 1 — Seal:</span> Submit a hash of your answer. The mempool never sees the actual answer.</p>
                <p><span style={{ color: "var(--text)" }}>Phase 2 — Break</span> after {COMMIT_BLOCKS.toString()} blocks: reveal on-chain. Contract verifies against your commitment.</p>
              </div>
            </details>
          </aside>

          {/* ── RIGHT — INTERROGATION CONSOLE ─────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", isolation: "isolate" }}>

            {/* Success banner */}
            {isRevealSuccess && (
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid rgba(0,232,122,0.3)",
                  padding: "20px 24px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "var(--acid)" }} aria-hidden="true" />
                <p style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.22em", color: "var(--acid)", marginBottom: "6px" }}>CASE SOLVED — EVIDENCE VERIFIED</p>
                <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "0.875rem", color: "var(--text-dim)" }}>
                  Record written to leaderboard.{" "}
                  {revealTxHash && (
                    <a href={`${EXPLORER}/${revealTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--acid)" }}>
                      View transaction ↗
                    </a>
                  )}
                </p>
              </div>
            )}

            {/* Main terminal */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>

              {/* Terminal title bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  background: "var(--raised)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.22em", color: "var(--text-faint)" }}>
                  INTERROGATION TERMINAL
                </span>
                <div style={{ display: "flex", gap: "6px" }} aria-hidden="true">
                  {["var(--red)", "var(--orange)", "var(--acid)"].map((c, i) => (
                    <span key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c, opacity: 0.5 }} />
                  ))}
                </div>
              </div>

              {!isConnected ? (
                <div style={{ padding: "56px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center" }}>
                  <div>
                    <p style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.22em", color: "var(--text-faint)", marginBottom: "8px" }}>
                      AGENT IDENTIFICATION REQUIRED
                    </p>
                    <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "0.875rem", color: "var(--text-dim)" }}>
                      Connect your wallet to submit answers on-chain.
                    </p>
                  </div>
                  <ConnectKitButton />
                </div>
              ) : (
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>

                  {/* Phase 1 */}
                  <div>
                    <p style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.18em", color: "var(--purple)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                      PHASE 01 — SEAL EVIDENCE {commit ? <CheckIcon /> : null}
                    </p>

                    {pendingCommit && (isCommitPending || isCommitConfirming) ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", border: "1px solid var(--purple-border)", background: "var(--purple-dim)" }}>
                        <Spinner />
                        <span style={{ ...mono, fontSize: "0.68rem", color: "var(--purple)" }}>
                          {isCommitPending ? "CONFIRM IN WALLET…" : "SEALING EVIDENCE…"}
                        </span>
                      </div>
                    ) : commit ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "14px 16px", border: "1px solid rgba(200,255,0,0.2)", background: "rgba(200,255,0,0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                          <span style={{ ...mono, fontSize: "0.68rem", color: "var(--text-dim)" }}>
                            Sealed at block <span style={{ color: "var(--acid)" }}>{(onChainCommitBlock ?? commit.commitBlock).toString()}</span>. Proceed to Phase 2.
                          </span>
                          <button
                            type="button"
                            onClick={() => { clearCommit(); setCommit(null); resetCommit(); resetReveal(); }}
                            style={{ ...mono, fontSize: "0.64rem", color: "var(--red)", background: "none", border: "none", cursor: "pointer", flexShrink: 0, minHeight: "36px", padding: "0 4px", opacity: 0.8, transition: "opacity 150ms" }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={e => (e.currentTarget.style.opacity = "0.8")}
                          >
                            [reset]
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadBackup(commit)}
                          style={{
                            alignSelf: "flex-start",
                            background: "none",
                            border: "1px solid var(--border-2)",
                            padding: "4px 12px",
                            cursor: "pointer",
                            ...mono,
                            fontSize: "0.62rem",
                            letterSpacing: "0.14em",
                            color: "var(--text-dim)",
                            transition: "border-color 150ms, color 150ms",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--acid)"; e.currentTarget.style.color = "var(--acid)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.color = "var(--text-dim)"; }}
                        >
                          ↓ SAVE BACKUP
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          ref={importRef}
                          type="file"
                          accept="application/json,.json"
                          onChange={handleImportFile}
                          style={{ display: "none" }}
                          aria-hidden="true"
                        />
                        <form onSubmit={handleCommit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                              <label htmlFor="answer-input" style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.22em", color: "var(--text-faint)" }}>
                                YOUR ANSWER
                              </label>
                              {answerFormat && (
                                <span style={{ ...mono, fontSize: "0.58rem", color: categoryColor, letterSpacing: "0.12em", opacity: 0.85 }}>
                                  {answerFormat.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                border: `1px solid ${encodingError ? "var(--red)" : "var(--border-2)"}`,
                                background: "var(--raised)",
                                transition: "border-color 150ms",
                              }}
                              onFocusCapture={e => (e.currentTarget.style.borderColor = encodingError ? "var(--red)" : "var(--purple)")}
                              onBlurCapture={e => (e.currentTarget.style.borderColor = encodingError ? "var(--red)" : "var(--border-2)")}
                            >
                              <span style={{ padding: "0 12px", color: "var(--purple)", ...mono, fontSize: "0.9rem", userSelect: "none" }} aria-hidden="true">
                                ›
                              </span>
                              <input
                                id="answer-input"
                                type="text"
                                value={answer}
                                onChange={e => {
                                  const fmt = answerFormat?.toLowerCase() ?? "";
                                  const raw = e.target.value;
                                  const val = fmt.includes("uppercase") && fmt.includes("hex")
                                    ? raw.toUpperCase()
                                    : fmt.includes("lowercase") && fmt.includes("hex")
                                    ? raw.toLowerCase()
                                    : raw;
                                  setAnswer(val);
                                  resetCommit();
                                }}
                                placeholder={answerFormat ? `e.g. ${answerFormat.toLowerCase().includes("integer") ? "42" : answerFormat.toLowerCase().includes("hex") ? "a1b2c3d4" : "..."}` : "ENTER YOUR ANSWER..."}
                                disabled={isCommitPending || isCommitConfirming}
                                aria-invalid={encodingError}
                                aria-describedby={encodingError ? "answer-error" : undefined}
                                style={{
                                  flex: 1,
                                  background: "transparent",
                                  padding: "13px 12px 13px 0",
                                  fontSize: "0.9rem",
                                  color: "var(--text)",
                                  outline: "none",
                                  fontFamily: "var(--font-inter), sans-serif",
                                  caretColor: "var(--purple)",
                                  opacity: (isCommitPending || isCommitConfirming) ? 0.5 : 1,
                                }}
                                autoComplete="off"
                                spellCheck={false}
                              />
                            </div>
                            {encodingError && (
                              <p id="answer-error" role="alert" style={{ ...mono, fontSize: "0.68rem", color: "var(--red)" }}>
                                Invalid format — use only letters, digits, or allowed symbols (max 32 chars).
                              </p>
                            )}
                          </div>
                          <button
                            type="submit"
                            disabled={isCommitPending || isCommitConfirming || !answer.trim() || puzzleLoading}
                            className="btn"
                            style={{ justifyContent: "center" }}
                          >
                            {isCommitPending || isCommitConfirming ? (
                              <><Spinner />{isCommitPending ? "CONFIRM IN WALLET" : "SEALING…"}</>
                            ) : "SEAL EVIDENCE →"}
                          </button>
                        </form>
                        <button
                          type="button"
                          onClick={() => importRef.current?.click()}
                          style={{
                            alignSelf: "flex-start",
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            ...mono,
                            fontSize: "0.62rem",
                            letterSpacing: "0.14em",
                            color: "var(--text-faint)",
                            transition: "color 150ms",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-dim)")}
                          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-faint)")}
                        >
                          ↑ restore from backup
                        </button>
                      </>
                    )}
                  </div>

                  <div className="divider" />

                  {/* Phase 2 */}
                  <div>
                    <p style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.18em", color: "var(--acid)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                      PHASE 02 — BREAK THE SEAL {isRevealSuccess ? <CheckIcon /> : null}
                    </p>

                    {!commit ? (
                      <p style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.14em", color: "var(--text-faint)" }}>
                        Complete Phase 1 first.
                      </p>
                    ) : isRevealSuccess ? (
                      <p style={{ ...mono, fontSize: "0.68rem", color: "var(--acid)" }}>Answer revealed and verified on-chain!</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ padding: "16px", background: "var(--raised)", border: "1px solid var(--border)" }}>
                          <BlockProgress blocksLeft={blocksUntilReveal < 0n ? 0n : blocksUntilReveal} totalBlocks={COMMIT_BLOCKS} />
                          {currentBlock !== undefined && (
                            <p
                              className="tabular-nums"
                              aria-live="polite"
                              aria-atomic="true"
                              style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.18em", color: "var(--text-faint)", marginTop: "8px" }}
                            >
                              BLOCK #{currentBlock.toString()}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={doReveal}
                          disabled={!canReveal || isRevealPending || isRevealConfirming}
                          className="btn-acid"
                          style={{ justifyContent: "center" }}
                        >
                          {isRevealPending || isRevealConfirming ? (
                            <><Spinner />{isRevealPending ? "CONFIRM IN WALLET" : "VERIFYING…"}</>
                          ) : "BREAK THE SEAL →"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Agent tip */}
            {puzzleMeta && (
              <details style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <summary
                  style={{
                    ...mono,
                    fontSize: "0.62rem",
                    letterSpacing: "0.18em",
                    cursor: "pointer",
                    minHeight: "44px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 20px",
                    gap: "8px",
                    color: categoryColor,
                    listStyle: "none",
                    userSelect: "none",
                  }}
                >
                  ↗ AGENT TIP — HOW TO CRACK THIS
                </summary>
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid var(--border)" }}>
                  <div>
                    <p style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.22em", color: "var(--text-faint)", marginBottom: "10px" }}>SUGGESTED PROMPT</p>
                    <div style={{ padding: "14px 16px", background: "var(--raised)", border: "1px solid var(--border)" }}>
                      <p style={{ ...mono, fontSize: "0.78rem", color: "var(--text-dim)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                        {`"${puzzleMeta.description.replace(/Answer:.+$/, "").trim()} Show only the final answer, no explanation."`}
                      </p>
                    </div>
                  </div>
                  {answerFormat && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px", border: `1px solid ${categoryColor}33`, background: `${categoryColor}08` }}>
                      <span style={{ ...mono, fontSize: "0.62rem", color: categoryColor, flexShrink: 0 }}>FORMAT</span>
                      <span style={{ ...mono, fontSize: "0.68rem", color: "var(--text-dim)", lineHeight: 1.6 }}>{answerFormat}</span>
                    </div>
                  )}
                  <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "0.8rem", color: "var(--text-faint)", lineHeight: 1.6 }}>
                    Works with{" "}
                    {["ChatGPT", "Claude", "Gemini", "Grok"].map((name, i, arr) => (
                      <span key={name}><span style={{ color: "var(--text-dim)" }}>{name}</span>{i < arr.length - 1 ? ", " : "."}</span>
                    ))}
                  </p>
                </div>
              </details>
            )}

            {/* TX status */}
            {(commitTxHash || revealTxHash || activeError) && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "20px 24px" }}>
                <p style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.22em", color: "var(--text-faint)", marginBottom: "14px" }}>
                  TRANSACTION STATUS
                </p>
                {activeError && (
                  <div style={{ marginBottom: "12px" }}>
                    <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.18em", color: "var(--red)", display: "block", marginBottom: "4px" }}>ERROR</span>
                    <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "0.875rem", color: "var(--text-dim)" }}>
                      {friendlyError(activeError.message, COMMIT_BLOCKS)}
                    </span>
                  </div>
                )}
                {commitTxHash && (
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "8px" }}>
                    <span style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.18em", color: "var(--text-faint)", flexShrink: 0 }}>SEAL TX</span>
                    <a
                      href={`${EXPLORER}/${commitTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...mono, fontSize: "0.68rem", color: "var(--purple)", wordBreak: "break-all", textAlign: "right" }}
                    >
                      {commitTxHash} ↗
                    </a>
                  </div>
                )}
                {revealTxHash && (
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                    <span style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.18em", color: "var(--text-faint)", flexShrink: 0 }}>BREAK TX</span>
                    <a
                      href={`${EXPLORER}/${revealTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...mono, fontSize: "0.68rem", color: "var(--acid)", wordBreak: "break-all", textAlign: "right" }}
                    >
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
