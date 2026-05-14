"use client";

import { Component, ReactNode } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}
interface State { hasError: boolean; errorMessage: string }

const MAX_LOG_ENTRIES = 20;

function persistError(error: Error, stack: string | null | undefined) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ERROR_LOG);
    const log: unknown[] = raw ? JSON.parse(raw) : [];
    log.push({ ts: new Date().toISOString(), message: error.message, stack });
    if (log.length > MAX_LOG_ENTRIES) log.splice(0, log.length - MAX_LOG_ENTRIES);
    localStorage.setItem(STORAGE_KEYS.ERROR_LOG, JSON.stringify(log));
  } catch { /* storage unavailable */ }
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorMessage: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error.message, info.componentStack);
    persistError(error, info.componentStack);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg)",
            padding: "0 24px",
            position: "relative",
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: "640px",
              width: "100%",
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            {/* Glitch banner */}
            <div
              className="terminal corners"
              style={{
                borderColor: "var(--red)",
                boxShadow: "0 0 28px var(--red-glow), 0 0 60px rgba(255,0,60,0.25)",
              }}
            >
              <span className="corners-bl" />
              <span className="corners-br" />
              <div
                style={{
                  padding: "10px 16px",
                  background: "rgba(255, 0, 60, 0.08)",
                  borderBottom: "1px solid var(--red)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.62rem",
                  letterSpacing: "0.22em",
                  color: "var(--red)",
                  textShadow: "0 0 4px var(--red-glow)",
                  textTransform: "uppercase",
                }}
              >
                <span>── [ KERNEL PANIC ] ──────────</span>
                <span className="dot dot-red" aria-hidden="true" />
              </div>

              <div style={{ padding: "32px 28px" }}>
                <h1
                  className="glitch"
                  data-text="SYSTEM PANIC"
                  style={{
                    fontFamily: "var(--font-crt), monospace",
                    fontSize: "clamp(2.6rem, 6vw, 4rem)",
                    color: "var(--red)",
                    textShadow: "0 0 12px var(--red-glow), 0 0 30px rgba(255,0,60,0.45)",
                    marginBottom: "20px",
                    letterSpacing: "0.04em",
                    lineHeight: 0.95,
                  }}
                >
                  SYSTEM PANIC
                </h1>

                <div
                  style={{
                    padding: "16px",
                    background: "var(--bg-deep)",
                    border: "1px solid rgba(255, 0, 60, 0.3)",
                    marginBottom: "24px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.62rem",
                      letterSpacing: "0.18em",
                      color: "var(--red)",
                      marginBottom: "8px",
                      textShadow: "0 0 3px var(--red-glow)",
                    }}
                  >
                    &gt; segfault @ 0x{Math.random().toString(16).slice(2, 10)}
                  </p>
                  {this.state.errorMessage && (
                    <p
                      style={{
                        fontSize: "0.74rem",
                        color: "var(--text-soft)",
                        wordBreak: "break-word",
                        lineHeight: 1.65,
                      }}
                    >
                      {this.state.errorMessage.slice(0, 240)}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => this.setState({ hasError: false, errorMessage: "" })}
                    className="btn"
                  >
                    ./retry →
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="btn-outline"
                  >
                    ./reboot
                  </button>
                </div>

                <p
                  style={{
                    fontSize: "0.60rem",
                    letterSpacing: "0.14em",
                    color: "var(--text-faint)",
                    marginTop: "24px",
                  }}
                >
                  {`// crash dump persisted to localStorage:${STORAGE_KEYS.ERROR_LOG}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
