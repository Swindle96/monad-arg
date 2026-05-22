import { ImageResponse } from "next/og";

// Route segment config — Next.js auto-generates og:image + twitter:image meta tags.
// `force-dynamic` skips prerender at build time (which breaks on Windows with
// @vercel/og's fileURLToPath); image is generated per-request and CDN-cached.
export const dynamic = "force-dynamic";
export const alt = "CHAIN_DETECTIVE — On-Chain ARG on Monad Testnet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// IMPORTANT: Satori (the renderer @vercel/og uses) has a strict CSS subset.
// Rules that bite hard:
//   - `inset` shorthand NOT supported — use top/left/right/bottom individually
//   - every div with multiple children MUST have `display: "flex"`
//   - `undefined` in style values crashes — only pass defined keys
//   - `textShadow` works but expensive; box-shadow ignored
//   - keep the JSX shallow; 100+ absolute-positioned siblings can OOM the worker

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#050709",
          color: "#00FF41",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Background — green radial + Monad purple accent via stacked gradients */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,255,65,0.20) 0%, rgba(0,255,65,0) 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            background:
              "radial-gradient(circle at 88% 14%, rgba(131,110,249,0.28) 0%, rgba(131,110,249,0) 35%)",
          }}
        />
        {/* Scanlines */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            background:
              "repeating-linear-gradient(0deg, rgba(0,255,65,0.05) 0px, rgba(0,255,65,0.05) 1px, transparent 1px, transparent 4px)",
          }}
        />
        {/* Vignette */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        {/* HUD top bar */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 48,
            right: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "10px 16px",
              border: "1px solid #00FF41",
              background: "rgba(5,7,9,0.8)",
            }}
          >
            <span style={{ fontSize: 14, color: "#5A8C72", letterSpacing: 4 }}>
              SESSION
            </span>
            <span style={{ fontSize: 20, color: "#00FF41", letterSpacing: 2 }}>
              0xCD-DETECTIVE
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "10px 16px",
              border: "1px solid #836EF9",
              background: "rgba(5,7,9,0.8)",
              alignItems: "flex-end",
            }}
          >
            <span style={{ fontSize: 14, color: "#5A8C72", letterSpacing: 4 }}>
              CHAIN
            </span>
            <span style={{ fontSize: 20, color: "#836EF9", letterSpacing: 2 }}>
              MONAD · 10143
            </span>
          </div>
        </div>

        {/* Center stack */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#00FF41",
              letterSpacing: 6,
              marginBottom: 30,
            }}
          >
            ▮ ./decode_the_chain
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 144,
              fontWeight: 900,
              color: "#00FF41",
              letterSpacing: 4,
              lineHeight: 1,
              textShadow: "0 0 24px rgba(0,255,65,0.7)",
            }}
          >
            CHAIN_DETECTIVE
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 30,
              letterSpacing: 5,
              marginTop: 30,
            }}
          >
            <span style={{ color: "#88E5A7" }}>100 CIPHERS</span>
            <span style={{ color: "#2E5240", margin: "0 18px" }}>·</span>
            <span style={{ color: "#88E5A7" }}>COMMIT·REVEAL</span>
            <span style={{ color: "#2E5240", margin: "0 18px" }}>·</span>
            <span style={{ color: "#836EF9" }}>MONAD TESTNET</span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#5A8C72",
              letterSpacing: 3,
              marginTop: 22,
            }}
          >
            // the mempool never sees your answer.
          </div>
        </div>

        {/* HUD bottom-left tag */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 48,
            display: "flex",
            alignItems: "center",
            fontSize: 18,
            letterSpacing: 4,
            color: "#5A8C72",
          }}
        >
          <span
            style={{
              display: "flex",
              width: 10,
              height: 10,
              borderRadius: 5,
              background: "#00FF41",
              marginRight: 12,
            }}
          />
          ● REC // CYBERINTRUSION_v4
        </div>

        {/* HUD bottom-right URL pill */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 48,
            display: "flex",
            padding: "10px 18px",
            border: "1px solid #CCFF00",
            background: "rgba(204,255,0,0.08)",
            color: "#CCFF00",
            fontSize: 20,
            letterSpacing: 3,
          }}
        >
          monad-arg.vercel.app ↗
        </div>
      </div>
    ),
    { ...size },
  );
}
