"use client";

import { useEffect, useState } from "react";
import { useChainId, useBlockNumber } from "wagmi";

/**
 * Heads-up display frame — fixed corner readouts.
 * Cyberpunk-style: session id, chain id, block height, real-time clock.
 * Renders only on client (uses wagmi hooks). Disabled on small viewports.
 */
export default function HudFrame() {
  const chainId = useChainId();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [now, setNow] = useState<string>(() => new Date().toISOString().slice(11, 19));
  const [session] = useState<string>(() => {
    const r = new Uint8Array(2);
    crypto.getRandomValues(r);
    return Array.from(r).map((b) => b.toString(16).padStart(2, "0")).join("");
  });

  useEffect(() => {
    const id = setInterval(() => setNow(new Date().toISOString().slice(11, 19)), 1000);
    return () => clearInterval(id);
  }, []);

  const blockStr = blockNumber !== undefined ? `#${blockNumber.toString()}` : "#—";

  return (
    <>
      {/* Top-left HUD */}
      <div className="hidden md:block" style={hudBase} aria-hidden="true">
        <div style={cornerTL}>
          <div style={hudRow}>
            <span style={hudLabel}>SESSION</span>
            <span style={hudValGreen}>0x{session}</span>
          </div>
          <div style={hudRow}>
            <span style={hudLabel}>CHAIN</span>
            <span style={hudValMonad}>{chainId || "—"}</span>
          </div>
        </div>
      </div>

      {/* Top-right HUD */}
      <div className="hidden md:block" style={hudBase} aria-hidden="true">
        <div style={cornerTR}>
          <div style={hudRow}>
            <span style={hudLabel}>BLOCK</span>
            <span style={hudValGreen} className="tabular-nums">
              {blockStr}
            </span>
          </div>
          <div style={hudRow}>
            <span style={hudLabel}>UTC</span>
            <span style={hudValGreen} className="tabular-nums">
              {now}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom-left tag */}
      <div className="hidden md:block" style={hudBase} aria-hidden="true">
        <div style={cornerBL}>
          <span style={{ ...hudLabel, color: "var(--green)" }}>● REC</span>
          <span style={hudSubtle}>cd@detective ~ live</span>
        </div>
      </div>

      {/* Bottom-right marker */}
      <div className="hidden md:block" style={hudBase} aria-hidden="true">
        <div style={cornerBR}>
          <span style={hudSubtle}>{"// CYBERINTRUSION_v4"}</span>
        </div>
      </div>
    </>
  );
}

const hudBase: React.CSSProperties = {
  position: "fixed",
  zIndex: 25,
  pointerEvents: "none",
  fontFamily: "var(--font-mono), monospace",
};

const cornerBase: React.CSSProperties = {
  position: "fixed",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  padding: "10px 14px",
  background: "rgba(5, 7, 9, 0.72)",
  border: "1px solid var(--green-line)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  fontSize: "0.55rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  boxShadow: "0 0 14px rgba(0, 255, 65, 0.18)",
};

const cornerTL: React.CSSProperties = { ...cornerBase, top: "12px", left: "12px" };
const cornerTR: React.CSSProperties = { ...cornerBase, top: "12px", right: "12px" };
const cornerBL: React.CSSProperties = { ...cornerBase, bottom: "12px", left: "12px", flexDirection: "row", alignItems: "center", gap: "10px" };
const cornerBR: React.CSSProperties = { ...cornerBase, bottom: "12px", right: "12px", flexDirection: "row", alignItems: "center", gap: "10px" };

const hudRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  minWidth: "150px",
};

const hudLabel: React.CSSProperties = {
  color: "var(--text-faint)",
  fontSize: "0.50rem",
};

const hudValGreen: React.CSSProperties = {
  color: "var(--green)",
  textShadow: "0 0 4px var(--green-glow)",
  fontSize: "0.60rem",
};

const hudValMonad: React.CSSProperties = {
  color: "var(--monad)",
  textShadow: "0 0 4px var(--monad-glow)",
  fontSize: "0.60rem",
};

const hudSubtle: React.CSSProperties = {
  color: "var(--text-dim)",
  fontSize: "0.55rem",
  letterSpacing: "0.18em",
};
