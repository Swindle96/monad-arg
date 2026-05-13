import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";
import { monadTestnet } from "./chain";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "https://testnet-rpc.monad.xyz";
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://monad-arg.vercel.app";

if (!walletConnectProjectId) {
  // Loud at module load — mobile wallets (Rainbow, Trust, MetaMask Mobile via QR)
  // silently break without a project ID. Injected wallets still work.
  // eslint-disable-next-line no-console
  console.warn(
    "[wagmi] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set — WalletConnect is disabled. " +
      "Get one at https://cloud.walletconnect.com and set the env var.",
  );
}

// Re-export so existing callers (play page chain guard) keep working.
export { monadTestnet };

export const config = createConfig(
  getDefaultConfig({
    chains: [monadTestnet, mainnet],
    // Monad blocks are 500ms; wagmi default polling is 4s — too slow for live block UI.
    pollingInterval: 1_000,
    transports: {
      [monadTestnet.id]: http(rpcUrl),
      // mainnet needed for ConnectKit ENS resolution; cloudflare-eth supports CORS
      [mainnet.id]: http("https://cloudflare-eth.com"),
    },
    walletConnectProjectId: walletConnectProjectId ?? "",
    appName: "CHAIN_DETECTIVE",
    appDescription: "On-Chain ARG on Monad Testnet — 100 cryptographic puzzles, commit-reveal, prize pool.",
    appUrl: siteUrl,
    appIcon: `${siteUrl}/favicon.ico`,
  }),
);
