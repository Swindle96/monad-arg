"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State { return { hasError: true }; }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#07040f" }}>
          <div style={{ textAlign: "center", fontFamily: "monospace" }}>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.2em", color: "#6E54FF", marginBottom: "8px" }}>SYSTEM ERROR</p>
            <p style={{ fontSize: "0.65rem", color: "rgba(110,84,255,0.6)", marginBottom: "16px" }}>Reload to reconnect</p>
            <button
              onClick={() => this.setState({ hasError: false })}
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
