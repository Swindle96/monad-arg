"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/play",        label: "play",        code: "01" },
  { href: "/explore",     label: "explore",     code: "02" },
  { href: "/leaderboard", label: "leaderboard", code: "03" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Body scroll lock + Escape for mobile drawer
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(5, 7, 9, 0.88)",
          borderBottom: "1px solid var(--green-line)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 0 18px rgba(0,255,65,0.08), inset 0 -1px 0 rgba(0,255,65,0.15)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Brand — green ASCII logo + CD label */}
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
            aria-label="CHAIN_DETECTIVE home"
          >
            <span
              aria-hidden="true"
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--green)",
                textShadow: "0 0 6px var(--green-glow)",
                letterSpacing: "0.04em",
              }}
            >
              &gt;_
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontWeight: 700,
                fontSize: "0.86rem",
                letterSpacing: "0.18em",
                color: "var(--green)",
                textShadow: "0 0 4px var(--green-glow)",
                textTransform: "uppercase",
              }}
            >
              chain<span style={{ color: "var(--monad)", textShadow: "0 0 4px var(--monad-glow)" }}>_</span>detective
            </span>
          </Link>

          {/* Desktop nav — prompt style */}
          <div
            className="hidden sm:flex"
            style={{ alignItems: "center", gap: "6px" }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.66rem",
                color: "var(--text-faint)",
                letterSpacing: "0.16em",
                marginRight: "4px",
              }}
              aria-hidden="true"
            >
              cd@detective:~$
            </span>
            {NAV_LINKS.map(({ href, label, code }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="chroma"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "0 12px",
                    height: "34px",
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "0.72rem",
                    letterSpacing: "0.12em",
                    color: active ? "var(--green)" : "var(--text-dim)",
                    background: active ? "var(--green-dim)" : "transparent",
                    border: `1px solid ${active ? "var(--green)" : "transparent"}`,
                    textShadow: active ? "0 0 5px var(--green-glow)" : "none",
                    transition: "color 150ms, background 150ms, border-color 150ms",
                  }}
                >
                  <span style={{ color: active ? "var(--monad)" : "var(--text-ghost)", fontSize: "0.56rem" }}>
                    [{code}]
                  </span>
                  ./{label}
                </Link>
              );
            })}
          </div>

          {/* Right — wallet + burger */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ConnectKitButton />
            <button
              className="sm:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
              aria-expanded={open}
              style={{
                background: "transparent",
                border: "1px solid var(--green-line)",
                padding: "0",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                color: "var(--green)",
              }}
            >
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  style={{
                    width: "16px",
                    height: "1.5px",
                    background: "var(--green)",
                    boxShadow: "0 0 4px var(--green-glow)",
                    display: "block",
                  }}
                  aria-hidden="true"
                />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div
          className="sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(2, 5, 10, 0.96)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              height: "56px",
              borderBottom: "1px solid var(--green-line)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontWeight: 700,
                fontSize: "0.86rem",
                letterSpacing: "0.18em",
                color: "var(--green)",
                textShadow: "0 0 4px var(--green-glow)",
                textTransform: "uppercase",
              }}
            >
              chain_detective
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              style={{
                background: "transparent",
                border: "1px solid var(--green-line)",
                cursor: "pointer",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--green)",
              }}
            >
              ✕
            </button>
          </div>

          <nav style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 0" }}>
            <p
              style={{
                padding: "0 24px 12px",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.66rem",
                color: "var(--text-faint)",
                letterSpacing: "0.16em",
              }}
            >
              cd@detective:~$ ls /routes/
            </p>
            {NAV_LINKS.map(({ href, label, code }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "18px 24px",
                    borderBottom: "1px solid var(--border)",
                    borderLeft: active ? "2px solid var(--green)" : "2px solid transparent",
                    background: active ? "var(--green-dim)" : "transparent",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "0.58rem",
                      color: "var(--monad)",
                      textShadow: "0 0 4px var(--monad-glow)",
                    }}
                  >
                    [{code}]
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-crt), monospace",
                      fontSize: "1.5rem",
                      color: active ? "var(--green)" : "var(--text)",
                      textShadow: active ? "0 0 6px var(--green-glow)" : "none",
                    }}
                  >
                    ./{label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
