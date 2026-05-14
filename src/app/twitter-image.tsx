// Re-use the Open Graph image for Twitter cards.
// Next.js detects this file convention and auto-emits the `twitter:image` meta tag.
import OGImage from "./opengraph-image";

export const dynamic = "force-dynamic";
export const alt = "CHAIN_DETECTIVE — On-Chain ARG on Monad Testnet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return OGImage();
}
