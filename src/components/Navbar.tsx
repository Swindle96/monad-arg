"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/play",        label: "CASE FILES" },
  { href: "/explore",     label: "INTEL FEED" },
  { href: "/leaderboard", label: "FIELD AGENTS" },
];

/* Detective badge / shield SVG icon */
function DetectiveBadge({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="22"
      viewBox="0 0 20 22"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Shield outline */}
      <path
        d="M10 1L18 4.5V11C18 15.5 14.5 19 10 20.5C5.5 19 2 15.5 2 11V4.5L10 1Z"
        stroke="#6E54FF"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="rgba(110,84,255,0.08)"
      />
      {/* Inner shield glow fill */}
      <path
        d="M10 3.5L16 6V11C16 14.5 13.5 17.2 10 18.5C6.5 17.2 4 14.5 4 11V6L10 3.5Z"
        fill="rgba(110,84,255,0.06)"
        stroke="rgba(110,84,255,0.25)"
        strokeWidth="0.8"
      />
      {/* Magnifying glass circle */}
      <circle cx="9.5" cy="10.5" r="3" stroke="#6E54FF" strokeWidth="1.2" />
      {/* Magnifying glass handle */}
      <line
        x1="11.7" y1="12.7" x2="14" y2="15"
        stroke="#D4A574"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        className="sticky top-0 z-40 backdrop-blur-2xl"
        style={{
          background: "rgba(7, 4, 15, 0.88)",
          borderBottom: "1px solid rgba(212,165,116,0.14)",
          boxShadow: "0 1px 0 rgba(110,84,255,0.07), 0 8px 32px rgba(0,0,0,0.45)",
        }}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">

          {/* ── Logo ── */}
          <div className="flex items-center gap-6 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 group min-h-[44px]"
              aria-label="CHAIN_DETECTIVE — Return to Home"
            >
              {/* Spinning ring around badge */}
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <div
                  className="absolute inset-0 rounded-full spin-slow"
                  style={{
                    border: "1px dashed rgba(212,165,116,0.3)",
                  }}
                  aria-hidden="true"
                />
                <DetectiveBadge className="group-hover:drop-shadow-[0_0_8px_#6E54FF] transition-all duration-300" />
              </div>
              {/* Brand text */}
              <div className="flex flex-col leading-none">
                <span
                  style={{
                    fontFamily: "var(--font-special-elite), monospace",
                    fontSize: "0.72rem",
                    letterSpacing: "0.3em",
                    color: "rgba(212,165,116,0.6)",
                    textTransform: "uppercase",
                    lineHeight: 1,
                    marginBottom: "2px",
                  }}
                >
                  CASE FILE
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-syne), sans-serif",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    letterSpacing: "0.18em",
                    color: "#DDD7FE",
                    textTransform: "uppercase",
                    lineHeight: 1,
                    transition: "color 0.2s",
                  }}
                  className="group-hover:text-white"
                >
                  CHAIN_DETECTIVE
                </span>
              </div>
            </Link>

            {/* ── Desktop nav ── */}
            <div className="hidden sm:flex items-center gap-0.5">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative min-h-[44px] px-4 flex items-center transition-colors duration-200 group"
                    style={{
                      fontFamily: "var(--font-roboto-mono), monospace",
                      fontSize: "0.68rem",
                      letterSpacing: "0.16em",
                      color: active ? "#DDD7FE" : "var(--text-dim)",
                      background: active ? "rgba(110,84,255,0.09)" : "transparent",
                    }}
                  >
                    {label}
                    {/* Active — amber underline */}
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300"
                      style={{
                        background: active
                          ? "linear-gradient(90deg, var(--amber), var(--purple))"
                          : "transparent",
                        boxShadow: active ? "0 0 8px rgba(212,165,116,0.5)" : "none",
                        opacity: active ? 1 : 0,
                      }}
                      aria-hidden="true"
                    />
                    {/* Hover underline */}
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-60 transition-opacity duration-200"
                      style={{
                        background: "linear-gradient(90deg, var(--amber), transparent)",
                        display: active ? "none" : undefined,
                      }}
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Right: status + wallet + burger ── */}
          <div className="flex items-center gap-3">
            {/* Case status indicator — desktop */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5" style={{ border: "1px solid rgba(212,165,116,0.18)", background: "rgba(212,165,116,0.04)" }}>
              <span
                className="w-1.5 h-1.5 rounded-full amber-pulse shrink-0"
                style={{ background: "var(--amber)", boxShadow: "0 0 6px var(--amber)" }}
                aria-hidden="true"
              />
              <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.6rem", letterSpacing: "0.22em", color: "var(--amber)" }}>
                CASE OPEN
              </span>
            </div>

            <ConnectKitButton />

            {/* Hamburger — mobile */}
            <button
              className="sm:hidden flex flex-col justify-center items-center w-[44px] h-[44px] gap-[5px] rounded transition-colors hover:bg-white/5"
              onClick={() => setOpen(o => !o)}
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
            >
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="block h-[1.5px] transition-all duration-200 rounded-full"
                  style={{
                    width: i === 1 ? (open ? 0 : 14) : 20,
                    background: open ? "var(--amber)" : "#A89EC9",
                    transform:
                      i === 0 ? (open ? "rotate(45deg) translate(5px, 5px)" : "none") :
                      i === 2 ? (open ? "rotate(-45deg) translate(5px,-5px)" : "none") :
                      "none",
                    opacity: i === 1 && open ? 0 : 1,
                  }}
                  aria-hidden="true"
                />
              ))}
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown ── */}
        {open && (
          <div
            className="sm:hidden border-t"
            style={{
              borderColor: "rgba(212,165,116,0.12)",
              background: "rgba(7,4,15,0.99)",
            }}
          >
            {/* Case file header in dropdown */}
            <div
              className="px-6 py-2 flex items-center gap-2"
              style={{ borderBottom: "1px solid rgba(212,165,116,0.08)", background: "rgba(212,165,116,0.03)" }}
            >
              <span style={{ fontFamily: "var(--font-special-elite), monospace", fontSize: "0.6rem", letterSpacing: "0.28em", color: "rgba(212,165,116,0.5)", textTransform: "uppercase" }}>
                Investigation Menu
              </span>
            </div>

            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center min-h-[52px] px-6 border-b transition-colors duration-150"
                  style={{
                    fontFamily: "var(--font-roboto-mono), monospace",
                    fontSize: "0.72rem",
                    letterSpacing: "0.16em",
                    borderColor: "rgba(110,84,255,0.08)",
                    color: active ? "#DDD7FE" : "var(--text-dim)",
                    background: active ? "rgba(110,84,255,0.07)" : "transparent",
                    borderLeft: active ? "2px solid var(--amber)" : "2px solid transparent",
                  }}
                >
                  {label}
                </Link>
              );
            })}

            {/* Status in mobile menu */}
            <div className="flex items-center gap-2 px-6 py-3" style={{ borderTop: "1px solid rgba(212,165,116,0.08)" }}>
              <span className="w-1.5 h-1.5 rounded-full amber-pulse" style={{ background: "var(--amber)" }} aria-hidden="true" />
              <span style={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.62rem", letterSpacing: "0.22em", color: "rgba(212,165,116,0.55)" }}>
                CASE OPEN · MONAD TESTNET
              </span>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
