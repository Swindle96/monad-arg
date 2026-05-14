/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

// Route segment config — Next.js auto-generates og:image + twitter:image meta tags.
// `force-dynamic` skips prerender at build time (which breaks on Windows with
// @vercel/og's fileURLToPath); image is generated per-request and CDN-cached.
export const dynamic = "force-dynamic";
export const alt = "CHAIN_DETECTIVE — On-Chain ARG on Monad Testnet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Decorative Matrix-style glyphs scattered as background (no real animation; static frame)
const GLYPHS = "01ｱｲｳｴｵｶｷｸｹｺABCDEF◊§◢#@/\\|+=*-_:;!?<>";

function makeGlyphGrid() {
  const items: { x: number; y: number; ch: string; opacity: number }[] = [];
  // Deterministic pseudo-random (no Math.random in edge SSR for reproducibility)
  let seed = 1337;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 110; i++) {
    items.push({
      x: rnd() * 1200,
      y: rnd() * 630,
      ch: GLYPHS[Math.floor(rnd() * GLYPHS.length)],
      opacity: 0.05 + rnd() * 0.22,
    });
  }
  return items;
}

export default function OGImage() {
  const glyphs = makeGlyphGrid();

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          background: "#050709",
          fontFamily: "monospace",
          overflow: "hidden",
        }}
      >
        {/* Radial green glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,255,65,0.16) 0%, rgba(0,255,65,0) 60%), radial-gradient(circle at 80% 20%, rgba(131,110,249,0.18) 0%, rgba(131,110,249,0) 40%)",
            display: "flex",
          }}
        />

        {/* Scanlines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, rgba(0,255,65,0.06) 0px, rgba(0,255,65,0.06) 1px, transparent 1px, transparent 4px)",
            display: "flex",
          }}
        />

        {/* Background glyph layer */}
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          {glyphs.map((g, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${g.x}px`,
                top: `${g.y}px`,
                color: i % 18 === 0 ? "rgba(131,110,249," + g.opacity + ")" : "rgba(0,255,65," + g.opacity + ")",
                fontSize: 22,
                fontFamily: "monospace",
                display: "flex",
              }}
            >
              {g.ch}
            </span>
          ))}
        </div>

        {/* Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
            display: "flex",
          }}
        />

        {/* HUD top-left */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 44,
            display: "flex",
            flexDirection: "column",
            padding: "10px 14px",
            border: "1px solid rgba(0,255,65,0.45)",
            background: "rgba(5,7,9,0.7)",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 14, color: "#5A8C72", letterSpacing: 4 }}>
            SESSION
          </span>
          <span style={{ fontSize: 18, color: "#00FF41", letterSpacing: 2 }}>
            0xCD-DETECTIVE
          </span>
        </div>

        {/* HUD top-right */}
        <div
          style={{
            position: "absolute",
            top: 36,
            right: 44,
            display: "flex",
            flexDirection: "column",
            padding: "10px 14px",
            border: "1px solid rgba(0,255,65,0.45)",
            background: "rgba(5,7,9,0.7)",
            gap: 4,
            alignItems: "flex-end",
          }}
        >
          <span style={{ fontSize: 14, color: "#5A8C72", letterSpacing: 4 }}>
            CHAIN
          </span>
          <span style={{ fontSize: 18, color: "#836EF9", letterSpacing: 2 }}>
            MONAD · 10143
          </span>
        </div>

        {/* HUD corner ticks */}
        {[
          { top: 12, left: 12, b: "right" },
          { top: 12, right: 12, b: "left" },
          { bottom: 12, left: 12, b: "right" },
          { bottom: 12, right: 12, b: "left" },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: c.top as number | undefined,
              bottom: c.bottom as number | undefined,
              left: c.left as number | undefined,
              right: c.right as number | undefined,
              width: 28,
              height: 28,
              border: "2px solid #00FF41",
              display: "flex",
            }}
          />
        ))}

        {/* Center stack */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          {/* Prompt line */}
          <div
            style={{
              fontSize: 24,
              color: "#00FF41",
              letterSpacing: 6,
              marginBottom: 24,
              display: "flex",
            }}
          >
            ▮ ./decode_the_chain
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 140,
              fontWeight: 900,
              color: "#00FF41",
              letterSpacing: 4,
              lineHeight: 1,
              display: "flex",
              textShadow: "0 0 20px rgba(0,255,65,0.6)",
            }}
          >
            CHAIN_DETECTIVE
          </div>

          {/* Subline with Monad purple accent */}
          <div
            style={{
              fontSize: 30,
              color: "#88E5A7",
              letterSpacing: 6,
              marginTop: 28,
              display: "flex",
              gap: 16,
            }}
          >
            <span>100 CIPHERS</span>
            <span style={{ color: "#2E5240" }}>·</span>
            <span>COMMIT·REVEAL</span>
            <span style={{ color: "#2E5240" }}>·</span>
            <span style={{ color: "#836EF9" }}>MONAD TESTNET</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 22,
              color: "#5A8C72",
              letterSpacing: 3,
              marginTop: 18,
              display: "flex",
            }}
          >
            // the mempool never sees your answer.
          </div>
        </div>

        {/* Bottom-left tag */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: 44,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 16,
            letterSpacing: 4,
            color: "#5A8C72",
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#00FF41", boxShadow: "0 0 8px #00FF41", display: "flex" }} />
          <span>● REC // CYBERINTRUSION_v4</span>
        </div>

        {/* Bottom-right URL */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            right: 44,
            display: "flex",
            padding: "8px 14px",
            border: "1px solid rgba(204,255,0,0.5)",
            background: "rgba(204,255,0,0.06)",
            color: "#CCFF00",
            fontSize: 18,
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
