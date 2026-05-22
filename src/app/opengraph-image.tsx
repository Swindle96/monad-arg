import { ImageResponse } from "next/og";

export const dynamic = "force-dynamic";
export const alt = "CHAIN_DETECTIVE — On-Chain ARG on Monad Testnet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Minimal version for debugging — if even THIS returns 500, the problem is
// the @vercel/og runtime itself on Vercel (font loading, etc.), not our JSX.
export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050709",
          color: "#00FF41",
          fontSize: 96,
          fontWeight: 700,
        }}
      >
        CHAIN_DETECTIVE
      </div>
    ),
    { ...size },
  );
}
