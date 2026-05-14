export const mono: React.CSSProperties = { fontFamily: "var(--font-mono), monospace" };

export function Spinner() {
  return (
    <span
      aria-label="Loading"
      style={{
        display: "inline-block",
        fontFamily: "var(--font-mono), monospace",
        color: "var(--green)",
        textShadow: "0 0 4px var(--green-glow)",
        fontSize: "1rem",
      }}
      className="ascii-spinner"
    />
  );
}

export function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ display: "inline-block", flexShrink: 0, filter: "drop-shadow(0 0 4px var(--acid-glow))" }}>
      <path d="M2 7L6 11L12 3" stroke="var(--acid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const CONFETTI_PIECES = Array.from({ length: 60 }, (_, i) => ({
  left:     `${(i * 37 + 11) % 100}%`,
  delay:    `${((i * 7) % 18) / 10}s`,
  duration: `${1.4 + ((i * 3) % 12) / 10}s`,
  color:    ["#00FF41", "#CCFF00", "#00F0FF", "#FF00FF", "#836EF9"][i % 5],
  size:     `${4 + (i % 4) * 3}px`,
  isChar:   i % 3 === 0,
}));

export function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9000 }} aria-hidden="true">
      {CONFETTI_PIECES.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.isChar ? "transparent" : p.color,
            color: p.color,
            fontFamily: "var(--font-mono), monospace",
            fontSize: p.size,
            lineHeight: 1,
            textShadow: `0 0 8px ${p.color}`,
            boxShadow: p.isChar ? "none" : `0 0 8px ${p.color}`,
            animation: `confetti-fall ${p.duration} ${p.delay} linear forwards`,
          }}
        >
          {p.isChar ? "1" : ""}
        </div>
      ))}
    </div>
  );
}

export function BlockProgress({ blocksLeft, totalBlocks }: { blocksLeft: bigint; totalBlocks: bigint }) {
  const done  = Number(totalBlocks - (blocksLeft < 0n ? 0n : blocksLeft));
  const pct   = Math.min(100, Math.round((done / Number(totalBlocks)) * 100));
  const ready = blocksLeft <= 0n;
  const filledChars = Math.floor((pct / 100) * 20);
  const bar = "█".repeat(filledChars) + "░".repeat(20 - filledChars);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
        <span style={{ ...mono, fontSize: "0.72rem", letterSpacing: "0.14em", color: ready ? "var(--acid)" : "var(--green)", textShadow: ready ? "0 0 5px var(--acid-glow)" : "0 0 4px var(--green-glow)" }}>
          {ready ? "[✓] SEAL READY TO BREAK" : `// holding — ${blocksLeft} block${blocksLeft !== 1n ? "s" : ""} remaining`}
        </span>
        <span className="tabular-nums" style={{ ...mono, fontSize: "0.66rem", color: "var(--text-dim)" }}>
          {pct}%
        </span>
      </div>
      <div style={{ ...mono, fontSize: "0.84rem", color: ready ? "var(--acid)" : "var(--green)", letterSpacing: "0.02em", textShadow: ready ? "0 0 4px var(--acid-glow)" : "0 0 3px var(--green-glow)" }} className="tabular-nums">
        [{bar}]
      </div>
    </div>
  );
}
