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
  useChainId,
  useSwitchChain,
} from "wagmi";
import { ConnectKitButton } from "connectkit";
import { puzzleChainAbi, CONTRACT_ADDRESSES } from "@/lib/contracts";
import { getPuzzleMeta, CATEGORY_COLORS } from "@/lib/puzzleData";
import { monadTestnet } from "@/lib/chain";
import { ZERO_ADDR, EXPLORER_URL } from "@/lib/constants";
import DecodeText from "@/components/DecodeText";
import {
  FALLBACK_COMMIT_BLOCKS,
  WALLET_TIMEOUT_MS,
  type PuzzleData,
  type CommitRecord,
  type CommitData,
  saveCommit,
  loadCommit,
  clearCommit,
  downloadBackup,
  friendlyError,
  extractAnswerFormat,
} from "./_lib";
import { Spinner, CheckIcon, Confetti, BlockProgress } from "./_ui";

const CONTRACT_ADDRESS = CONTRACT_ADDRESSES.puzzleChain;

const mono: React.CSSProperties = { fontFamily: "var(--font-mono), monospace" };

export default function PlayPage() {
  const [answer, setAnswer]            = useState("");
  const [commit, setCommit]            = useState<CommitData | null>(null);
  const [pendingCommit, setPending]    = useState<CommitData | null>(null);
  const [encodingError, setEncError]   = useState(false);
  const pendingCommitRef               = useRef<CommitData | null>(null);
  const importRef                      = useRef<HTMLInputElement>(null);
  const { address: userAddress, isConnected } = useAccount();
  const chainId                               = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const isCorrectChain                        = chainId === monadTestnet.id;

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
      } catch (err) {
        console.warn("[importFile] Invalid commit file:", err);
      }
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

  const puzzleMeta = useMemo(
    () => currentPuzzleId !== undefined ? getPuzzleMeta(Number(currentPuzzleId)) : undefined,
    [currentPuzzleId]
  );
  const puzzleDescription = puzzle?.description?.trim() || puzzleMeta?.description || null;
  const categoryColor = useMemo(
    () => (puzzleMeta ? CATEGORY_COLORS[puzzleMeta.category] : "var(--green)"),
    [puzzleMeta]
  );
  const answerFormat = useMemo(
    () => (puzzleMeta ? extractAnswerFormat(puzzleMeta.description) : null),
    [puzzleMeta]
  );

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
      } catch (err) {
        console.warn("[commitTimeout]", err);
      }
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
  }, [commit, currentBlock, effectiveCommitBlock, COMMIT_BLOCKS]);
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
    if (!isCorrectChain) return;
    if (CONTRACT_ADDRESS === ZERO_ADDR) {
      console.error("[play] Puzzle contract not configured");
      return;
    }
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
    if (!isCorrectChain) return;
    if (CONTRACT_ADDRESS === ZERO_ADDR) return;
    writeReveal({ address: CONTRACT_ADDRESS, abi: puzzleChainAbi, functionName: "revealAnswer", args: [commit.answerHex, commit.nonce] });
  }

  useEffect(() => {
    if (isRevealSuccess) { clearCommit(); setCommit(null); }
  }, [isRevealSuccess]);

  const activeError = revealWriteError ?? commitWriteError;

  return (
    <div style={{ minHeight: "100vh" }}>
      {isRevealSuccess && <Confetti />}
      {isRevealSuccess && (
        <span
          role="status"
          aria-live="assertive"
          style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)" }}
        >
          Puzzle solved. Your answer has been verified on-chain.
        </span>
      )}

      {/* Sub-header — breadcrumb-like prompt */}
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
              /cases/<DecodeText text={puzzleLabel.replace("#", "")} duration={500} />
            </span>
          </div>
          <div className="hidden sm:flex" style={{ alignItems: "center", gap: "8px" }}>
            <span className="dot dot-green" aria-hidden="true" />
            <span style={{ ...mono, fontSize: "0.60rem", color: "var(--green)", letterSpacing: "0.18em", textShadow: "0 0 4px var(--green-glow)" }}>
              INVESTIGATION OPEN
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "28px 24px 60px",
        }}
      >
        <div className="lg:grid-cols-[1fr_1.3fr]" style={{ display: "grid", gap: "20px" }}>
          {/* ── LEFT — CASE BRIEF ──────────────────────────── */}
          <aside
            className="lg:sticky lg:top-[112px] lg:self-start"
            style={{ display: "flex", flexDirection: "column", gap: "14px", zIndex: 2 }}
          >
            <div className="terminal corners">
              <span className="corners-bl" />
              <span className="corners-br" />
              <div className="terminal-head">
                <span>── [ EVIDENCE DOSSIER ] ────</span>
                <span className="tag tag-green">
                  <span className="dot dot-green" aria-hidden="true" />
                  ACTIVE
                </span>
              </div>
              <div className="terminal-body" style={{ padding: "22px 24px" }}>
                <p className="label" style={{ marginBottom: "8px" }}>case identifier</p>
                <h1
                  className="display"
                  style={{ fontSize: "clamp(2.6rem, 6vw, 4rem)", marginBottom: "20px" }}
                >
                  CASE <span style={{ color: "var(--monad)", textShadow: "0 0 8px var(--monad-glow)" }}>
                    <DecodeText text={puzzleLabel} duration={700} />
                  </span>
                </h1>

                {puzzleMeta && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "5px 12px",
                      border: `1px solid ${categoryColor}55`,
                      background: `${categoryColor}10`,
                      marginBottom: "22px",
                    }}
                  >
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: categoryColor, boxShadow: `0 0 6px ${categoryColor}` }} aria-hidden="true" />
                    <span style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.20em", color: categoryColor }}>
                      {puzzleMeta.category.toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="divider-dashed" style={{ marginBottom: "18px" }} />

                <p className="label-green" style={{ marginBottom: "12px" }}>
                  &gt; mission_briefing
                </p>

                {puzzleLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[1, 0.85, 0.65].map((w, i) => (
                      <div key={i} style={{ height: "10px", width: `${w * 100}%`, background: "var(--green-dim)" }} className="flicker" />
                    ))}
                  </div>
                ) : (
                  <p style={{ ...mono, fontSize: "0.88rem", lineHeight: 1.85, color: "var(--text)" }}>
                    {puzzleDescription || (
                      <span style={{ color: "var(--text-faint)" }}>
                        {puzzleError && puzzleCount === undefined
                          ? "[!] could not reach contract — check rpc connection."
                          : "[ ] no puzzle staged. waiting for owner..."}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div style={{ borderTop: "1px solid var(--green-line)" }}>
                {[
                  { k: "case_no", v: puzzleLabel },
                  { k: "total_cases", v: puzzleCount !== undefined ? String(puzzleCount) : "—" },
                  { k: "contract", v: `${CONTRACT_ADDRESS.slice(0, 8)}…${CONTRACT_ADDRESS.slice(-6)}` },
                ].map(({ k, v }, i, arr) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 24px",
                      borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <span style={{ ...mono, fontSize: "0.60rem", letterSpacing: "0.20em", color: "var(--text-faint)" }}>{k}</span>
                    <span style={{ ...mono, fontSize: "0.74rem", color: "var(--green)", textShadow: "0 0 3px var(--green-glow)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <details style={{ background: "var(--surface)", border: "1px solid var(--green-line)" }}>
              <summary
                style={{
                  ...mono,
                  fontSize: "0.66rem",
                  letterSpacing: "0.22em",
                  cursor: "pointer",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 22px",
                  color: "var(--text-dim)",
                  listStyle: "none",
                  textTransform: "uppercase",
                }}
              >
                ── FIELD PROTOCOL ──
              </summary>
              <div
                style={{
                  padding: "16px 22px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  ...mono,
                  fontSize: "0.84rem",
                  color: "var(--text-soft)",
                  lineHeight: 1.75,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <p><span style={{ color: "var(--green)" }}>$ phase_01</span> — submit hash. mempool sees nothing.</p>
                <p><span style={{ color: "var(--green)" }}>$ phase_02</span> — wait {COMMIT_BLOCKS.toString()} blocks. seal matures.</p>
                <p><span style={{ color: "var(--acid)" }}>$ phase_03</span> — reveal. contract verifies. point awarded.</p>
              </div>
            </details>
          </aside>

          {/* ── RIGHT — INTERROGATION CONSOLE ──────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Success banner */}
            {isRevealSuccess && (
              <div
                className="terminal corners scan-target"
                style={{ borderColor: "var(--acid)", boxShadow: "0 0 24px var(--acid-glow)" }}
              >
                <span className="corners-bl" />
                <span className="corners-br" />
                <div style={{ padding: "20px 24px" }}>
                  <p style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.22em", color: "var(--acid)", marginBottom: "8px", textShadow: "0 0 4px var(--acid-glow)" }}>
                    [SUCCESS] CASE SOLVED — EVIDENCE VERIFIED
                  </p>
                  <p style={{ ...mono, fontSize: "0.86rem", color: "var(--text-soft)" }}>
                    record written to leaderboard.{" "}
                    {revealTxHash && (
                      <a href={`${EXPLORER_URL}/${revealTxHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--acid)" }}>
                        view tx ↗
                      </a>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Main terminal */}
            <div className="terminal corners">
              <span className="corners-bl" />
              <span className="corners-br" />
              <div className="terminal-head">
                <span>── [ INTERROGATION TERMINAL ] ────</span>
                <div style={{ display: "flex", gap: "5px" }} aria-hidden="true">
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--red)" }} />
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--amber)" }} />
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--green)" }} />
                </div>
              </div>

              {!isConnected ? (
                <div className="terminal-body" style={{ padding: "56px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "22px", textAlign: "center" }}>
                  <div>
                    <p className="label-green" style={{ marginBottom: "10px" }}>
                      &gt; agent identification required
                    </p>
                    <p style={{ ...mono, fontSize: "0.86rem", color: "var(--text-soft)" }}>
                      connect your wallet to submit answers on-chain.
                    </p>
                  </div>
                  <ConnectKitButton />
                </div>
              ) : !isCorrectChain ? (
                <div className="terminal-body" style={{ padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "22px", textAlign: "center" }}>
                  <div>
                    <p style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.22em", color: "var(--red)", marginBottom: "10px", textShadow: "0 0 4px var(--red-glow)" }}>
                      [WARN] WRONG NETWORK DETECTED
                    </p>
                    <p style={{ ...mono, fontSize: "0.86rem", color: "var(--text-soft)" }}>
                      cyberintrusion runs on{" "}
                      <span style={{ color: "var(--monad)", textShadow: "0 0 4px var(--monad-glow)" }}>monad testnet</span>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchChain({ chainId: monadTestnet.id })}
                    disabled={isSwitching}
                    className="btn"
                  >
                    {isSwitching ? "switching…" : "./switch_network →"}
                  </button>
                </div>
              ) : (
                <div className="terminal-body" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "26px" }}>

                  {/* Phase 1 */}
                  <div>
                    <p style={{ ...mono, fontSize: "0.66rem", letterSpacing: "0.18em", color: "var(--green)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px", textShadow: "0 0 4px var(--green-glow)" }}>
                      &gt; phase_01 / seal_evidence {commit ? <CheckIcon /> : null}
                    </p>

                    {pendingCommit && (isCommitPending || isCommitConfirming) ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", border: "1px solid var(--green-line)", background: "var(--green-dim)" }}>
                        <Spinner />
                        <span style={{ ...mono, fontSize: "0.74rem", color: "var(--green)", textShadow: "0 0 4px var(--green-glow)" }}>
                          {isCommitPending ? "// awaiting wallet signature…" : "// broadcasting to chain…"}
                        </span>
                      </div>
                    ) : commit ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "14px 18px", border: "1px solid rgba(204,255,0,0.3)", background: "rgba(204,255,0,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                          <span style={{ ...mono, fontSize: "0.74rem", color: "var(--text-soft)" }}>
                            sealed @ block <span style={{ color: "var(--acid)", textShadow: "0 0 4px var(--acid-glow)" }}>{(onChainCommitBlock ?? commit.commitBlock).toString()}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => { clearCommit(); setCommit(null); resetCommit(); resetReveal(); }}
                            style={{ ...mono, fontSize: "0.66rem", color: "var(--red)", background: "none", border: "none", cursor: "pointer", textShadow: "0 0 3px var(--red-glow)" }}
                          >
                            [reset]
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadBackup(commit)}
                          className="btn-outline"
                          style={{ alignSelf: "flex-start", fontSize: "0.66rem", minHeight: "32px", padding: "0 14px" }}
                        >
                          ↓ save_backup
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
                        <form onSubmit={handleCommit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                              <label htmlFor="answer-input" className="label-green">&gt; your_answer</label>
                              {answerFormat && (
                                <span style={{ ...mono, fontSize: "0.58rem", color: categoryColor, letterSpacing: "0.14em" }}>
                                  format: {answerFormat.toLowerCase()}
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                border: `1px solid ${encodingError ? "var(--red)" : "var(--green-line)"}`,
                                background: "var(--bg-deep)",
                                transition: "border-color 150ms, box-shadow 150ms",
                                boxShadow: encodingError ? "0 0 14px var(--red-glow)" : "inset 0 0 0 1px transparent",
                              }}
                              onFocusCapture={e => {
                                e.currentTarget.style.borderColor = encodingError ? "var(--red)" : "var(--green)";
                                e.currentTarget.style.boxShadow = encodingError
                                  ? "0 0 14px var(--red-glow)"
                                  : "inset 0 0 0 1px var(--green-line), 0 0 16px var(--green-glow)";
                              }}
                              onBlurCapture={e => {
                                e.currentTarget.style.borderColor = encodingError ? "var(--red)" : "var(--green-line)";
                                e.currentTarget.style.boxShadow = encodingError
                                  ? "0 0 14px var(--red-glow)"
                                  : "inset 0 0 0 1px transparent";
                              }}
                            >
                              <span style={{ padding: "0 12px", color: "var(--green)", ...mono, fontSize: "0.95rem", textShadow: "0 0 4px var(--green-glow)" }} aria-hidden="true">
                                &gt;
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
                                placeholder={answerFormat ? `e.g. ${answerFormat.toLowerCase().includes("integer") ? "42" : answerFormat.toLowerCase().includes("hex") ? "a1b2c3d4" : "..."}` : "enter answer..."}
                                disabled={isCommitPending || isCommitConfirming}
                                aria-invalid={encodingError}
                                aria-describedby={encodingError ? "answer-error" : undefined}
                                className="term-input"
                                style={{ padding: "14px 12px 14px 0", fontSize: "0.95rem", opacity: (isCommitPending || isCommitConfirming) ? 0.5 : 1 }}
                                autoComplete="off"
                                spellCheck={false}
                              />
                            </div>
                            {encodingError && (
                              <p id="answer-error" role="alert" style={{ ...mono, fontSize: "0.70rem", color: "var(--red)", textShadow: "0 0 3px var(--red-glow)" }}>
                                [!] invalid format — letters / digits / allowed symbols (max 32 chars).
                              </p>
                            )}
                          </div>
                          <button
                            type="submit"
                            disabled={isCommitPending || isCommitConfirming || !answer.trim() || puzzleLoading}
                            className="btn"
                          >
                            {isCommitPending || isCommitConfirming ? (
                              <><Spinner />{isCommitPending ? "// confirm in wallet" : "// sealing…"}</>
                            ) : "./seal_evidence →"}
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
                            fontSize: "0.66rem",
                            letterSpacing: "0.14em",
                            color: "var(--text-faint)",
                          }}
                          className="chroma"
                        >
                          ↑ restore_from_backup.json
                        </button>
                      </>
                    )}
                  </div>

                  <div className="divider-dashed" />

                  {/* Phase 2 */}
                  <div>
                    <p style={{ ...mono, fontSize: "0.66rem", letterSpacing: "0.18em", color: "var(--acid)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px", textShadow: "0 0 4px var(--acid-glow)" }}>
                      &gt; phase_02 / break_seal {isRevealSuccess ? <CheckIcon /> : null}
                    </p>

                    {!commit ? (
                      <p style={{ ...mono, fontSize: "0.78rem", color: "var(--text-faint)" }}>
                        // complete phase_01 first.
                      </p>
                    ) : isRevealSuccess ? (
                      <p style={{ ...mono, fontSize: "0.78rem", color: "var(--acid)", textShadow: "0 0 4px var(--acid-glow)" }}>
                        [✓] answer revealed and verified on-chain.
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ padding: "16px", background: "var(--bg-deep)", border: "1px solid var(--green-line)" }}>
                          <BlockProgress blocksLeft={blocksUntilReveal < 0n ? 0n : blocksUntilReveal} totalBlocks={COMMIT_BLOCKS} />
                          {currentBlock !== undefined && (
                            <p
                              className="tabular-nums"
                              aria-live="polite"
                              aria-atomic="true"
                              style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.18em", color: "var(--text-faint)", marginTop: "10px" }}
                            >
                              &gt; block_height: <span style={{ color: "var(--green)", textShadow: "0 0 3px var(--green-glow)" }}>#{currentBlock.toString()}</span>
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={doReveal}
                          disabled={!canReveal || isRevealPending || isRevealConfirming}
                          className="btn-acid"
                        >
                          {isRevealPending || isRevealConfirming ? (
                            <><Spinner />{isRevealPending ? "// confirm in wallet" : "// verifying…"}</>
                          ) : "./break_seal →"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Agent tip */}
            {puzzleMeta && (
              <details className="terminal corners">
                <span className="corners-bl" />
                <span className="corners-br" />
                <summary
                  style={{
                    ...mono,
                    fontSize: "0.66rem",
                    letterSpacing: "0.18em",
                    cursor: "pointer",
                    minHeight: "44px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 22px",
                    gap: "10px",
                    color: categoryColor,
                    listStyle: "none",
                    textTransform: "uppercase",
                  }}
                >
                  &gt; agent_tip // how_to_crack
                </summary>
                <div style={{ padding: "18px 24px 22px", display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid var(--green-line)" }}>
                  <div>
                    <p className="label-green" style={{ marginBottom: "10px" }}>$ suggested_prompt</p>
                    <div style={{ padding: "14px 16px", background: "var(--bg-deep)", border: "1px solid var(--green-line)" }}>
                      <p style={{ ...mono, fontSize: "0.78rem", color: "var(--text-soft)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                        {`"${puzzleMeta.description.replace(/Answer:.+$/, "").trim()} Final answer only, no explanation."`}
                      </p>
                    </div>
                  </div>
                  {answerFormat && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 14px", border: `1px solid ${categoryColor}33`, background: `${categoryColor}08` }}>
                      <span style={{ ...mono, fontSize: "0.62rem", color: categoryColor }}>FORMAT</span>
                      <span style={{ ...mono, fontSize: "0.70rem", color: "var(--text-soft)" }}>{answerFormat}</span>
                    </div>
                  )}
                  <p style={{ ...mono, fontSize: "0.74rem", color: "var(--text-faint)" }}>
                    // works with chatgpt, claude, gemini, grok.
                  </p>
                </div>
              </details>
            )}

            {/* TX status */}
            {(commitTxHash || revealTxHash || activeError) && (
              <div className="terminal corners">
                <span className="corners-bl" />
                <span className="corners-br" />
                <div className="terminal-head">
                  <span>── [ TX_LOG ] ────────────────</span>
                </div>
                <div style={{ padding: "18px 24px" }}>
                  {activeError && (
                    <div style={{ marginBottom: "14px" }}>
                      <span style={{ ...mono, fontSize: "0.62rem", letterSpacing: "0.18em", color: "var(--red)", display: "block", marginBottom: "6px", textShadow: "0 0 3px var(--red-glow)" }}>[ERR]</span>
                      <span style={{ ...mono, fontSize: "0.82rem", color: "var(--text-soft)" }}>
                        {friendlyError(activeError.message, COMMIT_BLOCKS)}
                      </span>
                    </div>
                  )}
                  {commitTxHash && (
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "8px" }}>
                      <span style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.18em", color: "var(--text-faint)" }}>SEAL_TX</span>
                      <a
                        href={`${EXPLORER_URL}/${commitTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...mono, fontSize: "0.70rem", color: "var(--green)", wordBreak: "break-all", textAlign: "right", textShadow: "0 0 3px var(--green-glow)" }}
                      >
                        {commitTxHash} ↗
                      </a>
                    </div>
                  )}
                  {revealTxHash && (
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                      <span style={{ ...mono, fontSize: "0.58rem", letterSpacing: "0.18em", color: "var(--text-faint)" }}>REVEAL_TX</span>
                      <a
                        href={`${EXPLORER_URL}/${revealTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...mono, fontSize: "0.70rem", color: "var(--acid)", wordBreak: "break-all", textAlign: "right", textShadow: "0 0 3px var(--acid-glow)" }}
                      >
                        {revealTxHash} ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
