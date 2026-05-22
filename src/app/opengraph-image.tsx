import { ImageResponse } from "next/og";

// Auto-generates og:image + twitter:image meta tags via Next.js file convention.
export const dynamic = "force-dynamic";
export const alt = "CHAIN_DETECTIVE — On-Chain ARG on Monad Testnet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori (renderer behind @vercel/og) has a STRICT subset of CSS.
// Lessons learned the hard way after 500 errors:
//   - no `inset` shorthand — use top/left/right/bottom
//   - no `fontFamily: "monospace"` without loading a font via `fonts:[]`
//   - no `radial-gradient(ellipse ...)` — only `radial-gradient(circle ...)` works reliably
//   - every container with multiple children needs `display:"flex"`
//   - `letterSpacing` and `lineHeight` accept numbers but be conservative

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
          position: "relative",
        }}
      >
        {/* Green radial atmosphere */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(0,255,65,0.22) 0%, rgba(0,255,65,0) 60%)",
          }}
        />
        {/* Monad purple accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(circle at 88% 14%, rgba(131,110,249,0.30) 0%, rgba(131,110,249,0) 35%)",
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
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,255,65,0.06) 0px, rgba(0,255,65,0.06) 1px, transparent 1px, transparent 4px)",
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
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.9) 100%)",
          }}
        />

        {/* HUD top-left */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "48px",
            display: "flex",
            flexDirection: "column",
            padding: "12px 18px",
            border: "1px solid #00FF41",
            background: "rgba(5,7,9,0.85)",
          }}
        >
          <div style={{ display: "flex", fontSize: 14, color: "#5A8C72", letterSpacing: "4px" }}>
            SESSION
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#00FF41", letterSpacing: "2px", marginTop: 4 }}>
            0xCD-DETECTIVE
          </div>
        </div>

        {/* HUD top-right */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "48px",
            display: "flex",
            flexDirection: "column",
            padding: "12px 18px",
            border: "1px solid #836EF9",
            background: "rgba(5,7,9,0.85)",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", fontSize: 14, color: "#5A8C72", letterSpacing: "4px" }}>
            CHAIN
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#836EF9", letterSpacing: "2px", marginTop: 4 }}>
            MONAD · 10143
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
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#00FF41",
              letterSpacing: "6px",
              marginBottom: 30,
            }}
          >
            ▮ ./decode_the_chain
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 140,
              fontWeight: 900,
              color: "#00FF41",
              letterSpacing: "4px",
              lineHeight: 1,
            }}
          >
            CHAIN_DETECTIVE
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 30,
              letterSpacing: "5px",
              marginTop: 32,
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
              letterSpacing: "3px",
              marginTop: 24,
            }}
          >
            // the mempool never sees your answer.
          </div>
        </div>

        {/* HUD bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "48px",
            display: "flex",
            alignItems: "center",
            fontSize: 18,
            letterSpacing: "4px",
            color: "#5A8C72",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 12,
              height: 12,
              borderRadius: 6,
              background: "#00FF41",
              marginRight: 12,
            }}
          />
          REC // CYBERINTRUSION_v4
        </div>

        {/* HUD bottom-right URL pill */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "48px",
            display: "flex",
            padding: "10px 20px",
            border: "1px solid #CCFF00",
            background: "rgba(204,255,0,0.10)",
            color: "#CCFF00",
            fontSize: 22,
            letterSpacing: "3px",
          }}
        >
          monad-arg.vercel.app ↗
        </div>
      </div>
    ),
    { ...size },
  );
}
