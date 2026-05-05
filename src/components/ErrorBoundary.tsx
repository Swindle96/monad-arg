"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}
interface State { hasError: boolean; errorMessage: string }

const ERROR_LOG_KEY = "chain_detective_error_log";
const MAX_LOG_ENTRIES = 20;

function persistError(error: Error, stack: string | null | undefined) {
  try {
    const raw = localStorage.getItem(ERROR_LOG_KEY);
    const log: unknown[] = raw ? JSON.parse(raw) : [];
    log.push({ ts: new Date().toISOString(), message: error.message, stack });
    if (log.length > MAX_LOG_ENTRIES) log.splice(0, log.length - MAX_LOG_ENTRIES);
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(log));
  } catch { /* storage unavailable */ }
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorMessage: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught render error:", error.message, info.componentStack);
    persistError(error, info.componentStack);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#07040f" }}>
          <div style={{ textAlign: "center", fontFamily: "monospace", maxWidth: "480px", padding: "0 24px" }}>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.2em", color: "#6E54FF", marginBottom: "8px" }}>SYSTEM ERROR</p>
            <p style={{ fontSize: "0.65rem", color: "rgba(110,84,255,0.6)", marginBottom: "8px" }}>Reload to reconnect</p>
            {this.state.errorMessage && (
              <p style={{ fontSize: "0.6rem", color: "rgba(110,84,255,0.4)", marginBottom: "16px", wordBreak: "break-word" }}>
                {this.state.errorMessage.slice(0, 120)}
              </p>
            )}
            <button
              onClick={() => this.setState({ hasError: false, errorMessage: "" })}
              style={{ padding: "8px 20px", border: "1px solid #6E54FF", background: "transparent", color: "#6E54FF", cursor: "pointer", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.16em" }}
            >
              RETRY
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
