#!/usr/bin/env node
/**
 * Beta test: simulate 10 wallets solving 20 puzzles sequentially on Monad Testnet.
 * Run from monad-arg/: node scripts/beta-test.mjs
 *
 * Prerequisites:
 *   - monad-arg-contracts/.env must contain PRIVATE_KEY with funded deployer wallet
 *   - PuzzleChain must have puzzles added (run AddPuzzles.s.sol first)
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  encodePacked,
  toHex,
  padHex,
  parseEther,
  formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "fs";
import { randomBytes } from "crypto";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));

// ── Chain ────────────────────────────────────────────────────────────────────
const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
};

// ── Contract ─────────────────────────────────────────────────────────────────
const PUZZLE_CONTRACT = "0xAfB78b808dE6c11217F68eA53e6452ffbcf41620";

const PUZZLE_ABI = [
  {
    name: "currentPuzzleId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "puzzleCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "commitAnswer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "commitment", type: "bytes32" }],
    outputs: [],
  },
  {
    name: "revealAnswer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "answer", type: "bytes32" },
      { name: "nonce", type: "bytes32" },
    ],
    outputs: [],
  },
];

// ── All 100 puzzle answers (index = on-chain puzzle ID) ───────────────────────
// Sourced from monad-arg-contracts/script/AddPuzzles.s.sol
const ANSWERS = [
  // ── Monad Architecture (0-14)
  "9",         "33",        "279F",      "172800",    "5000",
  "67",        "101",       "367",       "10",        "24",
  "159",       "100",       "449",       "27",        "14",
  // ── Monad Math (15-34)
  "7353675",   "483",       "34101",     "23637",     "1",
  "5071500",   "9",         "25720112",  "7200",      "13335",
  "18",        "1449",      "17710",     "338350",    "100",
  "111220200", "21",        "1060",      "51445296",  "125250",
  // ── Monad Cryptography (35-49)
  "f1de9861",  "8c4e12cf",  "d8e06627",  "c7170bb4",  "ea024b1c",
  "4D4F4E4144","225",       "af61fd0d",  "TU9O",      "c6f5a473",
  "227",       "cdc43f70",  "9362eb26",  "184",       "f49b6050",
  // ── Monad Economics (50-59)
  "655200000000", "500000", "18144000000000", "36000000", "84375",
  "35946000",  "8",         "666",       "50",        "3000",
  // ── EVM & Solidity (60-74)
  "255",       "65535",     "40",        "64",        "256",
  "32768",     "4",         "a9059cbb",  "32",        "96",
  "8500",      "1",         "21180",     "197",       "32",
  // ── Bitcoin & Ethereum (75-84)
  "312500000", "7200",      "21",        "2100000000000000", "42",
  "256",       "336",       "15",        "210000000", "11155112",
  // ── Pure Algorithms (85-99)
  "76127",     "25",        "4",         "2",         "3",
  "3",         "25",        "832040",    "1307674368000", "120",
  "1023",      "2",         "6",         "19",        "89",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a UTF-8 string to bytes32 (right-padded with zeros, matching Solidity bytes32("str")) */
function toBytes32(str) {
  return padHex(toHex(str), { size: 32, dir: "right" });
}

/** Compute commit commitment: keccak256(abi.encodePacked(answer, msg.sender, nonce)) */
function makeCommitment(answerBytes32, playerAddress, nonceHex) {
  return keccak256(
    encodePacked(
      ["bytes32", "address", "bytes32"],
      [answerBytes32, playerAddress, nonceHex]
    )
  );
}

/** Poll block number until target is reached, printing progress dots */
async function waitForBlocks(publicClient, startBlock, count) {
  const target = startBlock + BigInt(count);
  process.stdout.write(`    Waiting ${count} blocks (target=${target})...`);
  while (true) {
    const current = await publicClient.getBlockNumber();
    if (current >= target) {
      console.log(` reached block ${current}`);
      return current;
    }
    await new Promise((r) => setTimeout(r, 500));
    process.stdout.write(".");
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // Load deployer key from contracts .env
  const envPath = resolve(__dir, "../../monad-arg-contracts/.env");
  const envFile = readFileSync(envPath, "utf-8");
  const deployerKey = envFile.match(/PRIVATE_KEY=(.+)/)?.[1]?.trim();
  if (!deployerKey) throw new Error("PRIVATE_KEY not found in monad-arg-contracts/.env");

  const deployerAccount = privateKeyToAccount(/** @type {`0x${string}`} */ (deployerKey));
  const RPC = "https://testnet-rpc.monad.xyz";

  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(RPC, { timeout: 15_000 }),
  });

  const deployerWallet = createWalletClient({
    account: deployerAccount,
    chain: monadTestnet,
    transport: http(RPC, { timeout: 15_000 }),
  });

  console.log("\n══════════════════════════════════════════════════");
  console.log("         CHAIN DETECTIVE — BETA TEST");
  console.log("══════════════════════════════════════════════════\n");
  console.log(`Deployer : ${deployerAccount.address}`);

  const deployerBalance = await publicClient.getBalance({ address: deployerAccount.address });
  console.log(`Balance  : ${formatEther(deployerBalance)} MON`);

  if (deployerBalance < parseEther("0.6")) {
    console.warn("⚠  Deployer has < 0.6 MON — may not cover funding + gas for 10 wallets");
  }

  // ── On-chain state ──────────────────────────────────────────────────────────
  const [currentPuzzleId, puzzleCount] = await Promise.all([
    publicClient.readContract({ address: PUZZLE_CONTRACT, abi: PUZZLE_ABI, functionName: "currentPuzzleId" }),
    publicClient.readContract({ address: PUZZLE_CONTRACT, abi: PUZZLE_ABI, functionName: "puzzleCount" }),
  ]);

  console.log(`Puzzle   : ${currentPuzzleId} / ${puzzleCount} (on-chain current / total)`);

  if (puzzleCount === 0n) {
    console.error("\n✗ No puzzles on-chain. Run AddPuzzles.s.sol first.");
    process.exit(1);
  }

  const remaining = Number(puzzleCount) - Number(currentPuzzleId);
  const puzzlesToSolve = Math.min(20, remaining);

  if (puzzlesToSolve <= 0) {
    console.log("\n✅ All puzzles already solved!");
    return;
  }

  console.log(`Will solve: ${puzzlesToSolve} puzzles (IDs ${currentPuzzleId}–${BigInt(currentPuzzleId) + BigInt(puzzlesToSolve) - 1n})\n`);

  // ── Generate 10 test wallets deterministically from deployer key ──────────
  console.log("── Generating test wallets ─────────────────────────────────────");
  const wallets = [];
  for (let i = 0; i < 10; i++) {
    const seed = keccak256(
      encodePacked(["bytes32", "uint256"], [/** @type {`0x${string}`} */ (deployerKey), BigInt(i)])
    );
    const account = privateKeyToAccount(seed);
    wallets.push({
      account,
      client: createWalletClient({
        account,
        chain: monadTestnet,
        transport: http(RPC, { timeout: 15_000 }),
      }),
    });
    console.log(`  Wallet ${i}: ${account.address}`);
  }

  // ── Fund wallets ────────────────────────────────────────────────────────────
  const FUND_AMOUNT = parseEther("0.05");
  const MIN_BALANCE = parseEther("0.02");

  console.log("\n── Funding wallets ─────────────────────────────────────────────");
  const fundHashes = await Promise.all(
    wallets.map(async (w, i) => {
      const bal = await publicClient.getBalance({ address: w.account.address });
      if (bal >= MIN_BALANCE) {
        console.log(`  Wallet ${i}: ${formatEther(bal)} MON (skip)`);
        return null;
      }
      const hash = await deployerWallet.sendTransaction({
        to: w.account.address,
        value: FUND_AMOUNT,
      });
      console.log(`  Wallet ${i}: funded ${formatEther(FUND_AMOUNT)} MON — ${hash}`);
      return hash;
    })
  );

  const pending = fundHashes.filter(Boolean);
  if (pending.length > 0) {
    process.stdout.write("  Waiting for confirmations...");
    await Promise.all(pending.map((h) => publicClient.waitForTransactionReceipt({ hash: h })));
    console.log(" confirmed ✓");
  }

  // ── Solve puzzles sequentially ──────────────────────────────────────────────
  console.log("\n── Solving puzzles ─────────────────────────────────────────────");

  const results = [];

  for (let i = 0; i < puzzlesToSolve; i++) {
    const puzzleId = Number(currentPuzzleId) + i;
    const walletIdx = i % 10;
    const { account, client } = wallets[walletIdx];
    const answerStr = ANSWERS[puzzleId];

    console.log(`\n[Puzzle ${puzzleId}] Wallet ${walletIdx} (${account.address.slice(0, 10)}...)`);

    if (answerStr === undefined) {
      console.log(`  ✗ No answer in ANSWERS array for ID ${puzzleId}`);
      results.push({ puzzleId, walletIdx, status: "no_answer" });
      continue;
    }

    console.log(`  Answer: "${answerStr}"`);

    const answerBytes32 = toBytes32(answerStr);
    const nonce = /** @type {`0x${string}`} */ (`0x${randomBytes(32).toString("hex")}`);
    const commitment = makeCommitment(answerBytes32, account.address, nonce);

    // Phase 1: Commit
    let commitHash;
    try {
      commitHash = await client.writeContract({
        address: PUZZLE_CONTRACT,
        abi: PUZZLE_ABI,
        functionName: "commitAnswer",
        args: [commitment],
      });
    } catch (err) {
      const msg = err.shortMessage ?? err.message ?? String(err);
      console.log(`  ✗ Commit failed: ${msg}`);
      results.push({ puzzleId, walletIdx, status: "commit_failed", error: msg });
      continue;
    }

    const commitReceipt = await publicClient.waitForTransactionReceipt({ hash: commitHash });
    const commitBlock = commitReceipt.blockNumber;
    console.log(`  ✓ Commit at block ${commitBlock} (tx: ${commitHash.slice(0, 12)}...)`);

    // Wait COMMIT_BLOCKS (10) + 1 safety block
    await waitForBlocks(publicClient, commitBlock, 11);

    // Phase 2: Reveal
    let revealHash;
    try {
      revealHash = await client.writeContract({
        address: PUZZLE_CONTRACT,
        abi: PUZZLE_ABI,
        functionName: "revealAnswer",
        args: [answerBytes32, nonce],
      });
    } catch (err) {
      const msg = err.shortMessage ?? err.message ?? String(err);
      console.log(`  ✗ Reveal failed: ${msg}`);
      results.push({ puzzleId, walletIdx, status: "reveal_failed", error: msg });
      continue;
    }

    const revealReceipt = await publicClient.waitForTransactionReceipt({ hash: revealHash });
    console.log(`  ✅ SOLVED at block ${revealReceipt.blockNumber} (tx: ${revealHash.slice(0, 12)}...)`);
    results.push({ puzzleId, walletIdx, solver: account.address, status: "solved" });
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  const finalPuzzleId = await publicClient.readContract({
    address: PUZZLE_CONTRACT,
    abi: PUZZLE_ABI,
    functionName: "currentPuzzleId",
  });

  const solved = results.filter((r) => r.status === "solved");

  console.log("\n\n══════════════════════════════════════════════════");
  console.log("                  RESULTS");
  console.log("══════════════════════════════════════════════════");
  console.log(`Solved    : ${solved.length} / ${puzzlesToSolve}`);
  console.log(`Puzzle ID : ${currentPuzzleId} → ${finalPuzzleId} (on-chain)\n`);

  for (const r of results) {
    const icon = r.status === "solved" ? "✅" : "❌";
    const extra = r.error ? ` (${r.error})` : r.status === "solved" ? ` — wallet ${r.walletIdx}` : "";
    console.log(`  ${icon} Puzzle ${String(r.puzzleId).padStart(3, " ")} ${r.status}${extra}`);
  }

  // Score per wallet
  console.log("\nWallet scores:");
  for (let i = 0; i < 10; i++) {
    const count = solved.filter((r) => r.walletIdx === i).length;
    if (count > 0) {
      console.log(`  Wallet ${i} (${wallets[i].account.address.slice(0, 10)}...): ${count} puzzle(s) solved`);
    }
  }

  console.log("\n══════════════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("\nFatal:", err.message ?? err);
  process.exit(1);
});
