import { createPublicClient, http } from "viem";
import { monadTestnet } from "@/lib/chain";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { NextResponse } from "next/server";

const rpcUrl =
  process.env.RPC_URL ??
  process.env.NEXT_PUBLIC_RPC_URL ??
  "https://testnet-rpc.monad.xyz";

const client = createPublicClient({
  chain: monadTestnet,
  transport: http(rpcUrl, { timeout: 8_000 }),
});

// Addresses of game contracts — used to tag game-related transactions in the feed.
// input (calldata) is intentionally excluded from responses to avoid leaking
// puzzle answers embedded in revealAnswer() transactions.
const GAME_ADDRS = new Set([
  CONTRACT_ADDRESSES.puzzleChain.toLowerCase(),
  CONTRACT_ADDRESSES.argGame.toLowerCase(),
  CONTRACT_ADDRESSES.playerRegistry.toLowerCase(),
]);

type TxEntry = { hash: string; from: string; to: string | null; isGame: boolean };
type BlockPayload = { number: string | null; transactions: TxEntry[] };

let cached: { data: BlockPayload; ts: number } | null = null;
const CACHE_MS = 2_000;

export async function GET() {
  try {
    if (cached && Date.now() - cached.ts < CACHE_MS) {
      return NextResponse.json(cached.data, {
        headers: { "Cache-Control": "public, s-maxage=2, stale-while-revalidate=4" },
      });
    }

    const block = await client.getBlock({ includeTransactions: true });
    const payload: BlockPayload = {
      number: block.number?.toString() ?? null,
      transactions: (block.transactions as unknown[]).map((tx) => {
        const t = tx as { hash: string; from: string; to: string | null };
        return {
          hash: t.hash,
          from: t.from,
          to: t.to ?? null,
          isGame: GAME_ADDRS.has((t.to ?? "").toLowerCase()),
        };
      }),
    };

    cached = { data: payload, ts: Date.now() };

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=2, stale-while-revalidate=4" },
    });
  } catch {
    return NextResponse.json({ error: "RPC unavailable" }, { status: 503 });
  }
}
