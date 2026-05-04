"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/play",        label: "PLAY" },
  { href: "/explore",     label: "EXPLORE" },
  { href: "/leaderboard", label: "RANKS" },
];

export default function Navbar() {
  const pathname  = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        className="sticky top-0 z-40 backdrop-blur-2xl"
        style={{
          background: "rgba(7, 4, 15, 0.82)",
          borderBottom: "1px solid rgba(110, 84, 255, 0.18)",
          boxShadow: "0 1px 0 rgba(110, 84, 255, 0.08), 0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">

          {/* Logo */}
          <div className="flex items-center gap-6 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 group min-h-[44px]"
              aria-label="CHAIN_DETECTIVE — Home"
            >
              {/* Monad-style hexagon mark */}
              <div className="relative w-7 h-7 flex items-center justify-center">
                {/* spinning ring */}
                <div
                  className="absolute inset-0 rounded-full border border-[#6E54FF]/50 spin-slow"
                  style={{ borderStyle: "dashed" }}
                />
                <svg width="16" height="16" viewBox="0 0 18 20" fill="none" aria-hidden="true">
                  <path
                    d="M9 1L17 5.5V14.5L9 19L1 14.5V5.5L9 1Z"
                    stroke="#6E54FF"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    className="group-hover:drop-shadow-[0_0_6px_#6E54FF] transition-all duration-300"
                  />
                  <path d="M9 6L13 8.5V13.5L9 16L5 13.5V8.5L9 6Z" fill="#6E54FF" opacity="0.45" />
                </svg>
              </div>
              <span
                className="text-sm font-bold tracking-[0.2em] transition-colors duration-200"
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                  color: "#DDD7FE",
                }}
              >
                CHAIN_DETECTIVE
              </span>
            </Link>

            {/* Desktop nav */}
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
                      fontSize: "0.72rem",
                      letterSpacing: "0.16em",
                      color: active ? "#DDD7FE" : "#6B6285",
                      background: active ? "rgba(110,84,255,0.10)" : "transparent",
                    }}
                  >
                    {label}
                    {/* active underline */}
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300"
                      style={{
                        background: active
                          ? "linear-gradient(90deg, #6E54FF, #85E6FF)"
                          : "transparent",
                        boxShadow: active ? "0 0 8px #6E54FF" : "none",
                        opacity: active ? 1 : 0,
                      }}
                    />
                    {/* hover underline */}
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{
                        background: "linear-gradient(90deg, #6E54FF, #85E6FF)",
                        display: active ? "none" : undefined,
                      }}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: wallet + burger */}
          <div className="flex items-center gap-3">
            <ConnectKitButton />
            <button
              className="sm:hidden flex flex-col justify-center items-center w-[44px] h-[44px] gap-[5px] rounded transition-colors hover:bg-white/5"
              onClick={() => setOpen(o => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="block h-[1.5px] transition-all duration-200 rounded-full"
                  style={{
                    width: i === 1 ? (open ? 0 : 14) : 20,
                    background: "#A89EC9",
                    transform:
                      i === 0 ? (open ? "rotate(45deg) translate(5px, 5px)" : "none") :
                      i === 2 ? (open ? "rotate(-45deg) translate(5px,-5px)" : "none") :
                      "none",
                    opacity: i === 1 && open ? 0 : 1,
                  }}
                />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div
            className="sm:hidden border-t"
            style={{
              borderColor: "rgba(110,84,255,0.18)",
              background: "rgba(7,4,15,0.98)",
            }}
          >
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
                    borderColor: "rgba(110,84,255,0.10)",
                    color: active ? "#DDD7FE" : "#6B6285",
                    background: active ? "rgba(110,84,255,0.08)" : "transparent",
                    borderLeft: active ? "2px solid #6E54FF" : "2px solid transparent",
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

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
