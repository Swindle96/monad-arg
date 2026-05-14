import type { ReactNode } from "react";

/**
 * Standard terminal-styled bordered box with optional title header.
 * Use anywhere a card-like region would go. Server-Component safe.
 */
export default function TerminalBox({
  title,
  status,
  statusTone = "green",
  children,
  bodyClass,
  bodyStyle,
  className,
}: {
  title?: string;
  status?: string;
  statusTone?: "green" | "acid" | "red" | "monad";
  children: ReactNode;
  bodyClass?: string;
  bodyStyle?: React.CSSProperties;
  className?: string;
}) {
  const tagClass =
    statusTone === "acid"
      ? "tag tag-acid"
      : statusTone === "red"
        ? "tag tag-red"
        : statusTone === "monad"
          ? "tag tag-monad"
          : "tag tag-green";

  return (
    <div className={`terminal corners ${className ?? ""}`}>
      <span className="corners-bl" />
      <span className="corners-br" />
      {title && (
        <div className="terminal-head">
          <span>── [ {title} ]{"".padEnd(2, "─")}</span>
          {status && <span className={tagClass}>{status}</span>}
        </div>
      )}
      <div className={`terminal-body ${bodyClass ?? ""}`} style={bodyStyle}>
        {children}
      </div>
    </div>
  );
}
