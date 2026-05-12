import { STORAGE_KEYS } from "@/lib/constants";

export const FALLBACK_COMMIT_BLOCKS = 10n;
export const WALLET_TIMEOUT_MS = 120_000;

export type PuzzleData = {
  id: bigint;
  answerHash: `0x${string}`;
  description: string;
  solved: boolean;
  solver: `0x${string}`;
  solvedAtBlock: bigint;
};

export type CommitRecord = {
  commitment: `0x${string}`;
  commitBlock: bigint;
  puzzleId: bigint;
  revealed: boolean;
};

export interface CommitData {
  puzzleId:    string;
  answerHex:   `0x${string}`;
  nonce:       `0x${string}`;
  commitBlock: bigint;
}

export function saveCommit(d: CommitData) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.COMMIT, JSON.stringify({ ...d, commitBlock: d.commitBlock.toString() }));
  } catch (e) {
    console.warn("[saveCommit] sessionStorage write failed:", e);
  }
}

export function loadCommit(): CommitData | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.COMMIT);
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
  } catch (err) {
    console.warn("[loadCommit] Failed to parse stored commit:", err);
    return null;
  }
}

export function clearCommit() {
  sessionStorage.removeItem(STORAGE_KEYS.COMMIT);
}

export function downloadBackup(d: CommitData) {
  const json = JSON.stringify({ ...d, commitBlock: d.commitBlock.toString() }, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `chain-detective-commit-${d.puzzleId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function friendlyError(msg: string, commitBlocks = FALLBACK_COMMIT_BLOCKS): string {
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

export function extractAnswerFormat(description: string): string | null {
  const match = description.match(/Answer:\s*(.+?)\.?\s*$/i);
  return match ? match[1].replace(/\.$/, "").trim() : null;
}
