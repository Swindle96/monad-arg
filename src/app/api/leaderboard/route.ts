import { createPublicClient, http, isAddress } from "viem";
import { monadTestnet } from "@/lib/wagmi";
import { playerRegistryAbi, argGameAbi, CONTRACT_ADDRESSES } from "@/lib/contracts";
import { NextResponse } from "next/server";

const rpcUrl =
  process.env.RPC_URL ??
  process.env.NEXT_PUBLIC_RPC_URL ??
  "https://testnet-rpc.monad.xyz";

const client = createPublicClient({
  chain: monadTestnet,
  transport: http(rpcUrl, { timeout: 8_000 }),
});

type LeaderboardPayload = {
  leaderboard: { addr: string; score: string; puzzlesSolved: string }[];
  playerCount: string;
  season: { name: string; isActive: boolean; prizeWei: string };
};

let cached: { data: LeaderboardPayload; ts: number } | null = null;
const CACHE_MS = 30_000;

function assertBigInt(v: unknown, label: string): bigint {
  if (typeof v !== "bigint") throw new Error(`Expected bigint for ${label}, got ${typeof v}`);
  return v;
}

function assertBigIntArray(v: unknown, label: string): readonly bigint[] {
  if (!Array.isArray(v) || v.some((x) => typeof x !== "bigint"))
    throw new Error(`Expected bigint[] for ${label}`);
  return v as bigint[];
}

function assertAddressArray(v: unknown, label: string): readonly `0x${string}`[] {
  if (!Array.isArray(v) || v.some((x) => typeof x !== "string" || !isAddress(x)))
    throw new Error(`Expected address[] for ${label}`);
  return v as `0x${string}`[];
}

export async function GET() {
  try {
    if (cached && Date.now() - cached.ts < CACHE_MS) {
      return NextResponse.json(cached.data, {
        headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
      });
    }

    const [rawLb, rawCount, rawSeason] = await Promise.all([
      client.readContract({
        address: CONTRACT_ADDRESSES.playerRegistry,
        abi: playerRegistryAbi,
        functionName: "getLeaderboard",
      }),
      client.readContract({
        address: CONTRACT_ADDRESSES.playerRegistry,
        abi: playerRegistryAbi,
        functionName: "getPlayerCount",
      }),
      client.readContract({
        address: CONTRACT_ADDRESSES.argGame,
        abi: argGameAbi,
        functionName: "getSeasonInfo",
      }),
    ]);

    if (!Array.isArray(rawLb) || rawLb.length < 3)
      throw new Error("getLeaderboard returned unexpected shape");
    const addrs = assertAddressArray(rawLb[0], "addrs");
    const scores = assertBigIntArray(rawLb[1], "scores");
    const solved = assertBigIntArray(rawLb[2], "solved");

    if (!Array.isArray(rawSeason) || rawSeason.length < 4)
      throw new Error("getSeasonInfo returned unexpected shape");
    const seasonName = typeof rawSeason[0] === "string" ? rawSeason[0] : String(rawSeason[0]);
    const isActive   = Boolean(rawSeason[2]);
    const prizeWei   = assertBigInt(rawSeason[3], "prizeWei");

    const playerCount = assertBigInt(rawCount, "playerCount");

    const payload: LeaderboardPayload = {
      leaderboard: addrs.map((addr, i) => ({
        addr,
        score:        (scores[i] ?? 0n).toString(),
        puzzlesSolved: (solved[i] ?? 0n).toString(),
      })),
      playerCount: playerCount.toString(),
      season: { name: seasonName, isActive, prizeWei: prizeWei.toString() },
    };

    cached = { data: payload, ts: Date.now() };

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.warn("[leaderboard] Contract read failed:", err);
    return NextResponse.json({ error: "Contract read failed" }, { status: 503 });
  }
}
