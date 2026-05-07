import { createPublicClient, http } from "viem";
import { monadTestnet } from "@/lib/wagmi";
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
    const block = await client.getBlock({ includeTransactions: true });
    const payload = {
      number: block.number?.toString() ?? null,
      transactions: (block.transactions as unknown[]).map((tx) => {
        const t = tx as { hash: string; from: string; to: string | null; input: string };
        return { hash: t.hash, from: t.from, to: t.to ?? null, input: t.input ?? "0x" };
      }),
    };
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=2, stale-while-revalidate=4" },
    });
  } catch {
    return NextResponse.json({ error: "RPC unavailable" }, { status: 503 });
  }
}
