import { defineChain } from "viem";

// Server-safe chain definition. Imported by API routes and the client wagmi config.
// Kept separate from src/lib/wagmi.ts because that file pulls in ConnectKit, which is
// React-only and breaks when bundled into server route handlers.
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? process.env.RPC_URL ?? "https://testnet-rpc.monad.xyz";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
  blockExplorers: {
    default: { name: "Monad Explorer", url: "https://testnet.monadexplorer.com" },
  },
});
