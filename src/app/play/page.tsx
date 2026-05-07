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
      className="inline-block w-4 h-4 rounded-full border-2 animate-spin shrink-0"
      style={{ borderColor: "var(--mono-wire)", borderTopColor: "var(--mono)" }}
      aria-label="Loading"
    />
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="inline-block shrink-0">
      <path d="M2 6L5 9L10 3" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CONFETTI_PIECES = Array.from({ length: 50 }, (_, i) => ({
  left:     `${(i * 37 + 11) % 100}%`,
  delay:    `${((i * 7) % 15) / 10}s`,
  duration: `${1.2 + ((i * 3) % 10) / 10}s`,
  color:    ["#6E54FF", "#85E6FF", "#D4A574", "#FF8EE4", "#FFAE45"][i % 5],
  size:     `${6 + (i % 3) * 3}px`,
  radius:   i % 3 === 0 ? "50%" : "2px",
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

function BlockProgress({ blocksLeft, totalBlocks }: { blocksLeft: bigint; totalBlocks: bigint }) {
  const done  = Number(totalBlocks - (blocksLeft < 0n ? 0n : blocksLeft));
  const pct   = Math.min(100, Math.round((done / Number(totalBlocks)) * 100));
  const ready = blocksLeft <= 0n;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: "var(--font-roboto-mono)",
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            color: ready ? "var(--amber)" : "var(--orange)",
          }}
        >
          {ready ? "SEAL READY TO BREAK" : `HOLD — ${blocksLeft} BLOCK${blocksLeft !== 1n ? "S" : ""} REMAINING`}
        </span>
        <span className="tabular-nums" style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.68rem", color: "var(--ink-low)" }}>
          {pct}%
        </span>
      </div>
      <div className="h-[2px] w-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: ready
              ? "linear-gradient(90deg, var(--amber), var(--cyan))"
              : "linear-gradient(90deg, var(--mono), var(--orange))",
            boxShadow: ready
              ? "0 0 10px rgba(212,165,116,0.6)"
              : "0 0 10px rgba(110,84,255,0.5)",
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
        if (!parsed.puzzleId || !parsed.answerHex || !parsed.nonce || parsed.commitBlock == null) {
          return;
        }
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

  const puzzle            = rawPuzzle as PuzzleData | undefined;
  const puzzleDescription = puzzle?.description?.trim() || puzzleMeta?.description || null;
  const currentPuzzleId   = rawPuzzleId as bigint | undefined;
  const puzzleCount       = rawCount    as bigint | undefined;
  const puzzleLabel       = currentPuzzleId !== undefined
    ? `#${String(Number(currentPuzzleId) + 1).padStart(3, "0")}`
    : "#---";

  const puzzleMeta    = currentPuzzleId !== undefined ? getPuzzleMeta(Number(currentPuzzleId)) : undefined;
  const categoryColor = puzzleMeta ? CATEGORY_COLORS[puzzleMeta.category] : "var(--mono)";
  const answerFormat  = puzzleMeta ? extractAnswerFormat(puzzleMeta.description) : null;

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

      {/* ── CASE FILE HEADER ─────────────────────────────────────── */}
      <div
        style={{
          background: "rgba(3,1,8,0.96)",
          borderBottom: "1px solid var(--wire-amber)",
          backdropFilter: "blur(18px)",
          position: "sticky",
          top: "56px",
          zIndex: 30,
        }}
      >
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, var(--amber) 30%, var(--mono) 70%, transparent)",
          }}
          aria-hidden="true"
        />
        <div
          className="mx-auto max-w-[1280px] px-4 sm:px-6 flex items-center justify-between"
          style={{ height: "52px" }}
        >
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center min-h-[44px] gap-2 transition-colors"
              style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.18em", color: "var(--ink-low)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--amber)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-low)")}
            >
              ← BACK
            </Link>
            <span style={{ color: "var(--wire-amber)", userSelect: "none" }}>|</span>
            <span className="label-case">Case File {puzzleLabel}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="dot dot-amber" style={{ width: "6px", height: "6px" }} aria-hidden="true" />
            <span className="label-mono" style={{ color: "var(--amber)", letterSpacing: "0.20em" }}>
              ACTIVE INVESTIGATION
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8" style={{ display: "grid", gap: "24px" }}>
        <div className="lg:grid lg:grid-cols-[1fr_1.25fr] lg:gap-6">

          {/* ── LEFT ASIDE — EVIDENCE DOSSIER ────────────────────── */}
          <aside className="mb-6 lg:mb-0 lg:sticky lg:top-28 lg:self-start flex flex-col gap-4">

            {/* Dossier panel */}
            <div className="p-evidence" style={{ position: "relative" }}>

              {/* Panel header */}
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: "1px solid var(--wire-amber)" }}
              >
                <p className="label-case">Evidence Dossier</p>
                <span
                  className="active-tag"
                  style={{ border: "1px solid rgba(212,165,116,0.35)", color: "var(--amber)", background: "rgba(212,165,116,0.05)" }}
                >
                  <span className="dot dot-amber" style={{ width: "5px", height: "5px" }} aria-hidden="true" />
                  ACTIVE
                </span>
              </div>

              {/* Case identifier */}
              <div className="px-6 pt-6 pb-4">
                <p className="label-mono" style={{ marginBottom: "10px" }}>Case Identifier</p>
                <h1
                  className="display-3d select-none"
                  style={{ fontSize: "clamp(2.8rem, 7vw, 4.2rem)", lineHeight: 0.9, marginBottom: "20px" }}
                >
                  Case
                  <span className="block" style={{ color: "var(--amber)" }}>{puzzleLabel}</span>
                </h1>

                {puzzleMeta && (
                  <div
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "3px 10px", marginBottom: "16px",
                      border: `1px solid ${categoryColor}44`,
                      background: `${categoryColor}10`,
                    }}
                  >
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: categoryColor, display: "inline-block", flexShrink: 0 }} aria-hidden="true" />
                    <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.62rem", letterSpacing: "0.2em", color: categoryColor }}>
                      {puzzleMeta.category.toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="wire-amber mb-5" style={{ width: "56px" }} />

                <p className="label-mono" style={{ marginBottom: "10px" }}>Mission Briefing</p>

                {puzzleLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[1, 0.8, 0.6].map((w, i) => (
                      <div key={i} className="animate-pulse rounded" style={{ height: "12px", width: `${w * 100}%`, background: "rgba(212,165,116,0.07)" }} />
                    ))}
                  </div>
                ) : (
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.9rem", lineHeight: 1.75, color: "var(--ink-mid)" }}>
                    {puzzleDescription || (
                      <span style={{ color: "var(--ink-low)" }}>
                        {puzzleError && puzzleCount === undefined
                          ? "Could not reach contract — check RPC connection."
                          : "No puzzle has been added yet. Check back soon."}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Evidence rows */}
              <div style={{ borderTop: "1px solid var(--wire-amber)" }}>
                {evidenceRows.map(({ label, value }, i) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: i < evidenceRows.length - 1 ? "1px solid rgba(212,165,116,0.06)" : "none" }}
                  >
                    <span className="label-mono">{label}</span>
                    <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.78rem", color: "var(--amber)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocol details */}
            <details className="p-panel">
              <summary
                className="label-case"
                style={{
                  cursor: "pointer",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 20px",
                }}
              >
                Field Protocol
              </summary>
              <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: "10px", fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "var(--ink-mid)", lineHeight: 1.7 }}>
                <p><span style={{ color: "var(--ink)" }}>Phase 1 — Seal:</span> Submit a hidden hash of your answer. No one in the mempool can read the answer itself.</p>
                <p><span style={{ color: "var(--ink)" }}>Phase 2 — Break</span> after {COMMIT_BLOCKS.toString()} blocks: reveal your answer on-chain so the contract can verify it against your commitment.</p>
              </div>
            </details>
          </aside>

          {/* ── RIGHT — INTERROGATION CONSOLE ───────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Success banner */}
            {isRevealSuccess && (
              <div className="p-evidence" style={{ padding: "20px", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, var(--amber), var(--cyan))" }} aria-hidden="true" />
                <p className="label-case" style={{ marginBottom: "6px" }}>Case Solved — Evidence Verified</p>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "var(--ink-mid)" }}>
                  Record written to leaderboard.{" "}
                  {revealTxHash && (
                    <a href={`${EXPLORER}/${revealTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--amber)" }}>
                      View transaction ↗
                    </a>
                  )}
                </p>
              </div>
            )}

            {/* Interrogation terminal */}
            <div className="p-panel" style={{ overflow: "hidden" }}>

              {/* Terminal title bar */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{
                  background: "rgba(212,165,116,0.04)",
                  borderBottom: "1px solid var(--wire-amber)",
                }}
              >
                <div className="flex items-center gap-3">
                  <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
                    <path d="M6 0.5L11 2.8V7C11 9.8 8.8 12.2 6 13C3.2 12.2 1 9.8 1 7V2.8L6 0.5Z" stroke="rgba(212,165,116,0.5)" strokeWidth="1" fill="rgba(212,165,116,0.06)" />
                  </svg>
                  <span className="label-case">Interrogation Terminal</span>
                </div>
                <div className="flex gap-1.5" aria-hidden="true">
                  {["var(--pink)", "var(--orange)", "var(--amber)"].map((c, i) => (
                    <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.45 }} />
                  ))}
                </div>
              </div>

              {!isConnected ? (
                <div style={{ padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                  <div style={{ textAlign: "center" }}>
                    <p className="label-case" style={{ marginBottom: "8px" }}>Agent Identification Required</p>
                    <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "var(--ink-mid)" }}>
                      Connect your wallet to submit answers on-chain.
                    </p>
                  </div>
                  <ConnectKitButton />
                </div>
              ) : (
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>

                  {/* Phase 1 — Seal */}
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-roboto-mono)",
                        fontSize: "0.72rem",
                        letterSpacing: "0.18em",
                        color: "var(--amber)",
                        marginBottom: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      PHASE 01 — SEAL EVIDENCE {commit ? <CheckIcon /> : null}
                    </p>

                    {pendingCommit && (isCommitPending || isCommitConfirming) ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", border: "1px solid rgba(255,174,69,0.3)", background: "rgba(255,174,69,0.04)" }}>
                        <Spinner />
                        <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", color: "var(--orange)" }}>
                          {isCommitPending ? "CONFIRM IN WALLET…" : "SEALING EVIDENCE…"}
                        </span>
                      </div>
                    ) : commit ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px 16px", border: "1px solid var(--wire-amber)", background: "var(--amber-fog)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                          <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", color: "var(--ink-mid)" }}>
                            Sealed at block <span style={{ color: "var(--amber)" }}>{(onChainCommitBlock ?? commit.commitBlock).toString()}</span>. Proceed to Phase 2.
                          </span>
                          <button
                            type="button"
                            onClick={() => { clearCommit(); setCommit(null); resetCommit(); resetReveal(); }}
                            className="inline-flex items-center min-h-[44px] px-2 hover:opacity-80 transition-opacity"
                            style={{ color: "var(--pink)", cursor: "pointer", background: "none", border: "none", fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", flexShrink: 0 }}
                          >
                            [reset]
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadBackup(commit)}
                          style={{
                            alignSelf: "flex-start",
                            background: "none", border: "1px solid rgba(212,165,116,0.3)",
                            padding: "4px 10px", cursor: "pointer",
                            fontFamily: "var(--font-roboto-mono)", fontSize: "0.65rem",
                            letterSpacing: "0.14em", color: "var(--amber)", opacity: 0.8,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                          onMouseLeave={e => (e.currentTarget.style.opacity = "0.8")}
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
                            <label
                              htmlFor="answer-input"
                              className="label-mono"
                            >
                              YOUR ANSWER
                            </label>
                            {answerFormat && (
                              <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.62rem", color: categoryColor, letterSpacing: "0.12em", opacity: 0.85 }}>
                                {answerFormat.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--wire-amber)", background: "rgba(3,1,8,0.85)" }}>
                            <span style={{ padding: "0 12px", color: "var(--amber)", fontFamily: "var(--font-roboto-mono)", fontSize: "0.85rem", userSelect: "none" }} aria-hidden="true">›</span>
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
                                flex: 1, background: "transparent", padding: "13px 12px 13px 0",
                                fontSize: "0.9rem", color: "var(--ink)", outline: "none",
                                fontFamily: "var(--font-inter)", caretColor: "var(--amber)",
                                opacity: (isCommitPending || isCommitConfirming) ? 0.5 : 1,
                              }}
                              autoComplete="off"
                              spellCheck={false}
                            />
                          </div>
                          {encodingError && (
                            <p id="answer-error" role="alert" style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", color: "var(--crimson)" }}>
                              Invalid format — use only letters, digits, or allowed symbols (max 32 chars).
                            </p>
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={isCommitPending || isCommitConfirming || !answer.trim() || puzzleLoading}
                          className="btn-ghost"
                          style={{ justifyContent: "center" }}
                        >
                          {isCommitPending || isCommitConfirming ? (
                            <><Spinner />{isCommitPending ? "CONFIRM IN WALLET" : "SEALING…"}</>
                          ) : "SEAL EVIDENCE"}
                        </button>
                      </form>
                      <button
                        type="button"
                        onClick={() => importRef.current?.click()}
                        style={{
                          alignSelf: "flex-start",
                          background: "none", border: "none",
                          padding: 0, cursor: "pointer",
                          fontFamily: "var(--font-roboto-mono)", fontSize: "0.65rem",
                          letterSpacing: "0.14em", color: "var(--ink-low)",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--amber)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-low)")}
                      >
                        ↑ restore from backup
                      </button>
                      </>
                    )}
                  </div>

                  <div className="wire-h" />

                  {/* Phase 2 — Break the seal */}
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-roboto-mono)",
                        fontSize: "0.72rem",
                        letterSpacing: "0.18em",
                        color: "var(--cyan)",
                        marginBottom: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      PHASE 02 — BREAK THE SEAL {isRevealSuccess ? <CheckIcon /> : null}
                    </p>

                    {!commit ? (
                      <p className="label-mono">Complete Phase 1 first.</p>
                    ) : isRevealSuccess ? (
                      <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", color: "var(--amber)" }}>Answer revealed and verified on-chain!</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ padding: "14px 16px", border: "1px solid var(--wire)", background: "var(--mono-fog)" }}>
                          <BlockProgress blocksLeft={blocksUntilReveal < 0n ? 0n : blocksUntilReveal} totalBlocks={COMMIT_BLOCKS} />
                          {currentBlock !== undefined && (
                            <p
                              className="tabular-nums label-mono"
                              aria-live="polite"
                              aria-atomic="true"
                              style={{ marginTop: "8px" }}
                            >
                              Block #{currentBlock.toString()}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={doReveal}
                          disabled={!canReveal || isRevealPending || isRevealConfirming}
                          className="btn"
                          style={{ justifyContent: "center" }}
                        >
                          {isRevealPending || isRevealConfirming ? (
                            <><Spinner />{isRevealPending ? "CONFIRM IN WALLET" : "VERIFYING…"}</>
                          ) : "BREAK THE SEAL"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Agent tip */}
            {puzzleMeta && (
              <details className="p-panel">
                <summary
                  style={{
                    fontFamily: "var(--font-roboto-mono)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.18em",
                    cursor: "pointer",
                    minHeight: "44px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 20px",
                    gap: "8px",
                    color: categoryColor,
                  }}
                >
                  <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
                    <path d="M6 1C3.79 1 2 2.79 2 5C2 6.5 2.8 7.8 4 8.6V10H8V8.6C9.2 7.8 10 6.5 10 5C10 2.79 8.21 1 6 1Z" stroke="currentColor" strokeWidth="1" fill="none"/>
                    <rect x="4" y="10.5" width="4" height="1" rx="0.5" fill="currentColor"/>
                    <rect x="4.5" y="11.8" width="3" height="1" rx="0.5" fill="currentColor"/>
                  </svg>
                  AGENT TIP — HOW TO CRACK THIS
                </summary>
                <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <p className="label-mono" style={{ marginBottom: "8px" }}>SUGGESTED PROMPT</p>
                    <div className="p-terminal" style={{ padding: "14px 16px" }}>
                      <p style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.78rem", color: "var(--ink-mid)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                        {`"${puzzleMeta.description.replace(/Answer:.+$/, "").trim()} Show only the final answer, no explanation."`}
                      </p>
                    </div>
                  </div>
                  {answerFormat && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px", border: `1px solid ${categoryColor}33`, background: `${categoryColor}08` }}>
                      <span style={{ color: categoryColor, fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", flexShrink: 0 }}>FORMAT</span>
                      <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", color: "var(--ink-mid)", lineHeight: 1.6 }}>{answerFormat}</span>
                    </div>
                  )}
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.8rem", color: "var(--ink-low)", lineHeight: 1.6 }}>
                    Works with <span style={{ color: "var(--ink)" }}>ChatGPT</span>, <span style={{ color: "var(--ink)" }}>Claude</span>, <span style={{ color: "var(--ink)" }}>Gemini</span>, <span style={{ color: "var(--ink)" }}>Grok</span>, or any AI assistant.
                  </p>
                </div>
              </details>
            )}

            {/* TX status */}
            {(commitTxHash || revealTxHash || activeError) && (
              <div className="p-panel" style={{ padding: "20px" }}>
                <p className="label-mono" style={{ marginBottom: "14px" }}>TRANSACTION STATUS</p>
                {activeError && (
                  <div style={{ marginBottom: "12px" }}>
                    <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", letterSpacing: "0.18em", color: "var(--crimson)", display: "block", marginBottom: "4px" }}>ERROR</span>
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "var(--ink-mid)" }}>{friendlyError(activeError.message, COMMIT_BLOCKS)}</span>
                  </div>
                )}
                {commitTxHash && (
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "8px" }}>
                    <span className="label-mono" style={{ flexShrink: 0 }}>SEAL TX</span>
                    <a href={`${EXPLORER}/${commitTxHash}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", color: "var(--amber)", wordBreak: "break-all", textAlign: "right" }}>
                      {commitTxHash} ↗
                    </a>
                  </div>
                )}
                {revealTxHash && (
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                    <span className="label-mono" style={{ flexShrink: 0 }}>BREAK TX</span>
                    <a href={`${EXPLORER}/${revealTxHash}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.72rem", color: "var(--cyan)", wordBreak: "break-all", textAlign: "right" }}>
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
