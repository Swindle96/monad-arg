import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { defineChain } from "viem";

// LOW-04: RPC URL from env — no hardcoded endpoints, easy to swap for production
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "https://testnet-rpc.monad.xyz";

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
});

export const config = createConfig({
  chains: [monadTestnet, mainnet],
  transports: {
    [monadTestnet.id]: http(rpcUrl),
    // mainnet needed for ConnectKit ENS resolution; cloudflare-eth supports CORS
    [mainnet.id]: http("https://cloudflare-eth.com"),
  },
});
