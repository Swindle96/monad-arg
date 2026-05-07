"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/play",        label: "CASE FILES",  code: "01" },
  { href: "/explore",     label: "INTEL FEED",  code: "02" },
  { href: "/leaderboard", label: "FIELD AGENTS", code: "03" },
];

/* ── Shield + magnifier badge ─────────────────────────────────── */
function Badge() {
  return (
    <svg width="24" height="27" viewBox="0 0 24 27" fill="none" aria-hidden="true">
      <path
        d="M12 1L22 5.5V13C22 18.5 17.5 23 12 24.5C6.5 23 2 18.5 2 13V5.5L12 1Z"
        stroke="#6E54FF"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="rgba(110,84,255,0.07)"
      />
      <path
        d="M12 4L19 7.5V13C19 17 16.5 20.5 12 21.8C7.5 20.5 5 17 5 13V7.5L12 4Z"
        fill="rgba(110,84,255,0.05)"
        stroke="rgba(110,84,255,0.22)"
        strokeWidth="0.7"
      />
      {/* Magnifying glass */}
      <circle cx="11" cy="12.5" r="3.8" stroke="#6E54FF" strokeWidth="1.2" />
      <line x1="13.8" y1="15.3" x2="16.5" y2="18" stroke="#D4A574" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Mobile full-screen menu ──────────────────────────────────── */
function MobileMenu({ open, onClose, pathname }: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 sm:hidden flex flex-col"
      style={{ background: "rgba(3,1,8,0.98)", backdropFilter: "blur(24px)" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 h-14 shrink-0"
        style={{ borderBottom: "1px solid rgba(212,165,116,0.14)" }}
      >
        <div className="flex items-center gap-2.5">
          <Badge />
          <span
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 800,
              fontSize: "0.80rem",
              letterSpacing: "0.18em",
              color: "#DDD7FE",
              textTransform: "uppercase",
            }}
          >
            CHAIN_DETECTIVE
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-[44px] h-[44px]"
          aria-label="Close navigation"
          style={{ color: "var(--ink-low)" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Header label */}
      <div className="px-6 pt-8 pb-4">
        <p
          style={{
            fontFamily: "var(--font-special-elite), monospace",
            fontSize: "0.62rem",
            letterSpacing: "0.3em",
            color: "rgba(212,165,116,0.45)",
            textTransform: "uppercase",
          }}
        >
          Investigation Index
        </p>
      </div>

      {/* Links */}
      <nav className="flex-1 flex flex-col">
        {NAV_LINKS.map(({ href, label, code }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-4 min-h-[64px] px-6"
              style={{
                borderBottom: "1px solid rgba(110,84,255,0.09)",
                borderLeft: active ? "2px solid var(--amber)" : "2px solid transparent",
                background: active ? "rgba(110,84,255,0.06)" : "transparent",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-roboto-mono), monospace",
                  fontSize: "0.60rem",
                  letterSpacing: "0.2em",
                  color: active ? "var(--amber)" : "var(--ink-trace)",
                  minWidth: "24px",
                }}
              >
                {code}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  letterSpacing: "0.06em",
                  color: active ? "var(--ink)" : "var(--ink-mid)",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
              {active && (
                <span
                  className="ml-auto dot dot-amber"
                  aria-hidden="true"
                  style={{ width: "6px", height: "6px" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-6 py-5 flex items-center gap-3 shrink-0"
        style={{ borderTop: "1px solid rgba(212,165,116,0.10)" }}
      >
        <span className="dot dot-amber" style={{ width: "6px", height: "6px" }} aria-hidden="true" />
        <span
          style={{
            fontFamily: "var(--font-roboto-mono), monospace",
            fontSize: "0.60rem",
            letterSpacing: "0.22em",
            color: "rgba(212,165,116,0.50)",
          }}
        >
          CASE OPEN · MONAD TESTNET
        </span>
      </div>
    </div>
  );
}

/* ── Main Navbar ──────────────────────────────────────────────── */
export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        className="sticky top-0 z-40"
        style={{
          background: "rgba(3,1,8,0.90)",
          borderBottom: "1px solid rgba(212,165,116,0.12)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 1px 0 rgba(110,84,255,0.06), 0 6px 28px rgba(0,0,0,0.5)",
        }}
      >
        {/* Accent line top */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(110,84,255,0.55) 30%, rgba(212,165,116,0.35) 70%, transparent)",
          }}
          aria-hidden="true"
        />

        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14">

          {/* ── LEFT: Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-3 group min-h-[44px] shrink-0"
            aria-label="CHAIN_DETECTIVE — Home"
          >
            {/* Spinning orbit ring + badge */}
            <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
              <div
                className="absolute inset-0 rounded-full spin-slow"
                style={{ border: "1px dashed rgba(212,165,116,0.28)" }}
                aria-hidden="true"
              />
              <div
                className="group-hover:drop-shadow-[0_0_10px_#6E54FF] transition-all duration-300"
              >
                <Badge />
              </div>
            </div>

            {/* Brand text */}
            <div className="flex flex-col leading-none">
              <span
                style={{
                  fontFamily: "var(--font-special-elite), monospace",
                  fontSize: "0.60rem",
                  letterSpacing: "0.28em",
                  color: "rgba(212,165,116,0.55)",
                  textTransform: "uppercase",
                  lineHeight: 1,
                  marginBottom: "3px",
                }}
              >
                CASE FILE
              </span>
              <span
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                  fontWeight: 800,
                  fontSize: "0.84rem",
                  letterSpacing: "0.16em",
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

          {/* ── CENTER: Desktop nav ── */}
          <div className="hidden sm:flex items-center">
            {NAV_LINKS.map(({ href, label, code }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative group flex items-center gap-2 min-h-[44px] px-5"
                  style={{
                    fontFamily: "var(--font-roboto-mono), monospace",
                    fontSize: "0.68rem",
                    letterSpacing: "0.16em",
                    color: active ? "var(--ink)" : "var(--ink-low)",
                    background: active ? "rgba(110,84,255,0.07)" : "transparent",
                    transition: "color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.color = "var(--ink-mid)";
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.color = "var(--ink-low)";
                  }}
                >
                  {/* Code number */}
                  <span
                    style={{
                      fontSize: "0.56rem",
                      letterSpacing: "0.18em",
                      color: active ? "var(--amber)" : "var(--ink-trace)",
                      transition: "color 0.2s",
                    }}
                  >
                    {code}
                  </span>
                  {label}

                  {/* Active underline */}
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300"
                    style={{
                      background: active
                        ? "linear-gradient(90deg, var(--amber), var(--mono))"
                        : "transparent",
                      boxShadow: active ? "0 0 8px rgba(212,165,116,0.45)" : "none",
                      opacity: active ? 1 : 0,
                    }}
                    aria-hidden="true"
                  />
                  {/* Hover underline */}
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-40 transition-opacity duration-200"
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

          {/* ── RIGHT: Status + Wallet + Burger ── */}
          <div className="flex items-center gap-3">
            {/* Case open indicator — desktop only */}
            <div
              className="hidden lg:flex items-center gap-2 px-3 py-1.5"
              style={{
                border: "1px solid rgba(212,165,116,0.18)",
                background: "rgba(212,165,116,0.04)",
              }}
            >
              <span className="dot dot-amber" style={{ width: "6px", height: "6px" }} aria-hidden="true" />
              <span
                style={{
                  fontFamily: "var(--font-roboto-mono), monospace",
                  fontSize: "0.58rem",
                  letterSpacing: "0.22em",
                  color: "var(--amber)",
                }}
              >
                CASE OPEN
              </span>
            </div>

            <ConnectKitButton />

            {/* Burger — mobile */}
            <button
              className="sm:hidden flex flex-col justify-center items-center w-[44px] h-[44px] gap-[5px]"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
              aria-expanded={open}
              style={{ background: "none", border: "none" }}
            >
              {[20, 14, 20].map((w, i) => (
                <span
                  key={i}
                  className="block rounded-full"
                  style={{
                    width: `${w}px`,
                    height: "1.5px",
                    background: "#A89EC9",
                  }}
                  aria-hidden="true"
                />
              ))}
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </>
  );
}
