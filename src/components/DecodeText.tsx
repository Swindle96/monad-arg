"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Matrix-style "decode" effect.
 * Cycles through random glyphs before settling on the target text.
 * Triggered on mount, and re-runs whenever `text` changes.
 *
 * Usage: <DecodeText text="CASE #042" duration={600} />
 */
const GLYPHS = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%*+={}[]<>/\\!?";

export default function DecodeText({
  text,
  duration = 600,
  className,
  style,
  as: Tag = "span",
}: {
  text: string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
}) {
  const [out, setOut] = useState(text);
  const rafRef = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const len = text.length;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setOut(text);
      return;
    }

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      // Reveal letters left-to-right
      const revealed = Math.floor(progress * len);
      let s = "";
      for (let i = 0; i < len; i++) {
        if (text[i] === " " || text[i] === "\n") {
          s += text[i];
        } else if (i < revealed) {
          s += text[i];
        } else {
          s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
      }
      setOut(s);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setOut(text);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [text, duration]);

  const Element = Tag as keyof JSX.IntrinsicElements;
  return <Element className={className} style={style}>{out}</Element>;
}
