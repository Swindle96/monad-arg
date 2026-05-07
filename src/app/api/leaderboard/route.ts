import { createPublicClient, http } from "viem";
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

export async function GET() {
  try {
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

    const [addrs, scores, solved] = rawLb as [
      readonly `0x${string}`[],
      readonly bigint[],
      readonly bigint[]
    ];
    const [seasonName, , isActive, prizeWei] = rawSeason as [
      string, bigint, boolean, bigint, `0x${string}`
    ];

    return NextResponse.json({
      leaderboard: addrs.map((addr, i) => ({
        addr,
        score: (scores[i] ?? 0n).toString(),
        puzzlesSolved: (solved[i] ?? 0n).toString(),
      })),
      playerCount: (rawCount as bigint).toString(),
      season: { name: seasonName, isActive, prizeWei: prizeWei.toString() },
    }, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json({ error: "Contract read failed" }, { status: 503 });
  }
}
