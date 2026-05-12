export const mono: React.CSSProperties = { fontFamily: "var(--font-mono), monospace" };

export function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: "14px",
        height: "14px",
        borderRadius: "50%",
        border: "2px solid var(--border-2)",
        borderTopColor: "var(--purple)",
        animation: "spin-slow 0.7s linear infinite",
        flexShrink: 0,
      }}
      aria-label="Loading"
    />
  );
}

export function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ display: "inline-block", flexShrink: 0 }}>
      <path d="M2 7L6 11L12 3" stroke="var(--acid)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const CONFETTI_PIECES = Array.from({ length: 50 }, (_, i) => ({
  left:     `${(i * 37 + 11) % 100}%`,
  delay:    `${((i * 7) % 15) / 10}s`,
  duration: `${1.2 + ((i * 3) % 10) / 10}s`,
  color:    ["#9B7FFC", "#C8FF00", "#00CFFF", "#00E87A", "#FF3B30"][i % 5],
  size:     `${6 + (i % 3) * 3}px`,
  radius:   i % 3 === 0 ? "50%" : "1px",
}));

export function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9000 }} aria-hidden="true">
      {CONFETTI_PIECES.map((p, i) => (
        <div key={i} style={{
          position: "absolute", top: 0, left: p.left,
          width: p.size, height: p.size,
          backgroundColor: p.color, borderRadius: p.radius,
          animation: `confetti-fall ${p.duration} ${p.delay} linear forwards`,
        }} />
      ))}
    </div>
  );
}

export function BlockProgress({ blocksLeft, totalBlocks }: { blocksLeft: bigint; totalBlocks: bigint }) {
  const done  = Number(totalBlocks - (blocksLeft < 0n ? 0n : blocksLeft));
  const pct   = Math.min(100, Math.round((done / Number(totalBlocks)) * 100));
  const ready = blocksLeft <= 0n;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ ...mono, fontSize: "0.68rem", letterSpacing: "0.14em", color: ready ? "var(--acid)" : "var(--text-dim)" }}>
          {ready ? "SEAL READY TO BREAK" : `HOLD — ${blocksLeft} BLOCK${blocksLeft !== 1n ? "S" : ""} REMAINING`}
        </span>
        <span className="tabular-nums" style={{ ...mono, fontSize: "0.64rem", color: "var(--text-faint)" }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: "2px", width: "100%", overflow: "hidden", background: "var(--border-2)" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            transition: "width 0.5s ease",
            background: ready ? "var(--acid)" : "var(--purple)",
            boxShadow: ready ? "0 0 8px var(--acid)" : "0 0 8px var(--purple-glow)",
          }}
        />
      </div>
    </div>
  );
}
