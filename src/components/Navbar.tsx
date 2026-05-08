"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/play",        label: "CASE FILES",   code: "01" },
  { href: "/explore",     label: "INTEL FEED",   code: "02" },
  { href: "/leaderboard", label: "FIELD AGENTS", code: "03" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(7,7,7,0.92)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
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
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                background: "var(--purple)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="4" stroke="#fff" strokeWidth="1.5" />
                <line x1="9" y1="9" x2="13" y2="13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 700,
                fontSize: "0.92rem",
                letterSpacing: "0.06em",
                color: "var(--text)",
                textTransform: "uppercase",
              }}
            >
              CHAIN_DETECTIVE
            </span>
          </Link>

          {/* Desktop nav */}
          <div
            className="hidden sm:flex"
            style={{ alignItems: "center", gap: "2px" }}
          >
            {NAV_LINKS.map(({ href, label, code }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "0 16px",
                    height: "36px",
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "0.68rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    color: active ? "var(--text)" : "var(--text-dim)",
                    background: active ? "var(--surface)" : "transparent",
                    border: active ? "1px solid var(--border-2)" : "1px solid transparent",
                    transition: "color 150ms, background 150ms, border-color 150ms",
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.color = "var(--text)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.color = "var(--text-dim)";
                    }
                  }}
                >
                  <span style={{ color: active ? "var(--purple)" : "var(--text-faint)", fontSize: "0.56rem" }}>
                    {code}
                  </span>
                  {label}
                  {active && (
                    <span
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: "var(--acid)",
                      }}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: wallet + burger */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ConnectKitButton />
            <button
              className="sm:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
              aria-expanded={open}
              style={{
                background: "none",
                border: "1px solid var(--border-2)",
                padding: "8px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
              }}
            >
              {[1, 2, 3].map(i => (
                <span
                  key={i}
                  style={{ width: "16px", height: "1.5px", background: "var(--text-dim)", display: "block" }}
                  aria-hidden="true"
                />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div
          className="sm:hidden"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(7,7,7,0.98)",
            backdropFilter: "blur(24px)",
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
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 700,
                fontSize: "0.88rem",
                letterSpacing: "0.06em",
                color: "var(--text)",
              }}
            >
              CHAIN_DETECTIVE
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              style={{
                background: "none",
                border: "1px solid var(--border-2)",
                cursor: "pointer",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-dim)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 0" }}>
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
                    gap: "16px",
                    padding: "20px 24px",
                    borderBottom: "1px solid var(--border)",
                    borderLeft: active ? "2px solid var(--acid)" : "2px solid transparent",
                    background: active ? "var(--surface)" : "transparent",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-faint)" }}>
                    {code}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display), sans-serif",
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      letterSpacing: "0.04em",
                      color: active ? "var(--text)" : "var(--text-dim)",
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
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
