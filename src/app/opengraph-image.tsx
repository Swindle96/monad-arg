import { ImageResponse } from "next/og";

export const dynamic = "force-dynamic";
export const alt = "CHAIN_DETECTIVE — On-Chain ARG on Monad Testnet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Verified working version. Built up from a minimal baseline (PASS @ ad39f41)
// by adding only Satori-proven primitives:
//   - background-image: linear-gradient AND simple radial-gradient at X% Y% — OK
//   - explicit "Npx" for borders, sizes, letter-spacing
//   - flexbox layout with display:flex on every multi-child div
//   - NO: repeating-linear-gradient (Satori bug), text-shadow with big blur, font-family without loaded font

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
          position: "relative",
          backgroundImage:
            "radial-gradient(at 50% 50%, rgba(0,255,65,0.22) 0%, rgba(0,255,65,0) 60%), radial-gradient(at 88% 14%, rgba(131,110,249,0.32) 0%, rgba(131,110,249,0) 38%), radial-gradient(at 12% 88%, rgba(204,255,0,0.10) 0%, rgba(204,255,0,0) 32%)",
        }}
      >
        {/* HUD top-left */}
        <div
          style={{
            position: "absolute",
            top: "44px",
            left: "52px",
            display: "flex",
            flexDirection: "column",
            padding: "14px 20px",
            border: "1px solid #00FF41",
            background: "rgba(5,7,9,0.85)",
          }}
        >
          <div style={{ display: "flex", fontSize: 16, color: "#5A8C72", letterSpacing: "5px" }}>
            SESSION
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#00FF41", letterSpacing: "2px", marginTop: 4 }}>
            0xCD-DETECTIVE
          </div>
        </div>

        {/* HUD top-right */}
        <div
          style={{
            position: "absolute",
            top: "44px",
            right: "52px",
            display: "flex",
            flexDirection: "column",
            padding: "14px 20px",
            border: "1px solid #836EF9",
            background: "rgba(5,7,9,0.85)",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", fontSize: 16, color: "#5A8C72", letterSpacing: "5px" }}>
            CHAIN
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#836EF9", letterSpacing: "2px", marginTop: 4 }}>
            MONAD · 10143
          </div>
        </div>

        {/* Tagline prompt — above headline */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#00FF41",
            letterSpacing: "6px",
            marginBottom: 28,
          }}
        >
          ▮ ./decode_the_chain
        </div>

        {/* Huge headline */}
        <div
          style={{
            display: "flex",
            fontSize: 132,
            fontWeight: 800,
            color: "#00FF41",
            letterSpacing: "4px",
            lineHeight: 1,
          }}
        >
          CHAIN_DETECTIVE
        </div>

        {/* Tagline strip */}
        <div
          style={{
            display: "flex",
            fontSize: 30,
            letterSpacing: "5px",
            marginTop: 32,
          }}
        >
          <span style={{ color: "#88E5A7" }}>100 CIPHERS</span>
          <span style={{ color: "#2E5240", margin: "0 20px" }}>·</span>
          <span style={{ color: "#88E5A7" }}>COMMIT·REVEAL</span>
          <span style={{ color: "#2E5240", margin: "0 20px" }}>·</span>
          <span style={{ color: "#836EF9" }}>MONAD TESTNET</span>
        </div>

        {/* Subtagline */}
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#5A8C72",
            letterSpacing: "3px",
            marginTop: 22,
          }}
        >
          // the mempool never sees your answer.
        </div>

        {/* HUD bottom-left — REC */}
        <div
          style={{
            position: "absolute",
            bottom: "44px",
            left: "52px",
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
              borderRadius: "6px",
              background: "#00FF41",
              marginRight: 12,
            }}
          />
          REC // CYBERINTRUSION_v4
        </div>

        {/* HUD bottom-right — URL pill */}
        <div
          style={{
            position: "absolute",
            bottom: "44px",
            right: "52px",
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
