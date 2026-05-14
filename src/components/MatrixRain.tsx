"use client";

import { useEffect, useRef } from "react";

/**
 * Canvas-based Matrix digital rain.
 * - Fixed-position background, behind everything (z-index 0)
 * - Auto-resizes with window
 * - Pauses on prefers-reduced-motion (renders one static frame)
 * - Sparse Monad-purple accents (~3% of glyphs) for brand thread
 * - Total: ~5KB minified, single canvas, no extra deps
 */
export default function MatrixRain({ opacity = 0.42 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const FONT_SIZE = 16;
    // Mostly katakana + hex digits + selected ASCII — classic Matrix mix
    const GLYPHS =
      "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ" +
      "0123456789ABCDEF" +
      "⁂※¤§◊∆∇∂≡∞≠≈" +
      "{}[]()<>/\\|+=*-_:;!?@#";

    let cols = 0;
    let drops: number[] = [];
    let intensities: number[] = [];
    let dpr = 1;
    let raf = 0;

    function resize() {
      if (!canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(window.innerWidth / FONT_SIZE);
      drops = new Array(cols);
      intensities = new Array(cols);
      for (let i = 0; i < cols; i++) {
        drops[i] = Math.random() * -200;
        intensities[i] = 0.6 + Math.random() * 0.4;
      }
      // Solid fill the first time so we don't see partial draw
      ctx.fillStyle = "#050709";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    function draw() {
      if (!canvas || !ctx) return;
      // Trail: semi-transparent black overlay
      ctx.fillStyle = "rgba(5, 7, 9, 0.075)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
      ctx.textBaseline = "top";

      for (let i = 0; i < cols; i++) {
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];

        // Sparse Monad-purple accents (~3%) for brand thread
        const accent = Math.random() < 0.03;

        // Head of stream is bright, body fades
        if (Math.random() < 0.018) {
          ctx.fillStyle = accent ? "#B5A6FF" : "#E8FFE8";
          ctx.shadowColor = accent ? "#836EF9" : "#00FF41";
          ctx.shadowBlur = 12;
        } else {
          const i01 = intensities[i];
          ctx.fillStyle = accent
            ? `rgba(131, 110, 249, ${i01})`
            : `rgba(0, 255, 65, ${i01 * 0.85})`;
          ctx.shadowBlur = 0;
        }

        if (y > 0 && y < window.innerHeight) {
          ctx.fillText(ch, x, y);
        }

        // Random reset chance scales with how far down it is
        if (y > window.innerHeight && Math.random() < 0.97) {
          drops[i] = Math.random() * -40;
          intensities[i] = 0.5 + Math.random() * 0.5;
        }

        drops[i] += 0.55 + Math.random() * 0.45;
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    if (reduced) {
      // Render one frame for static atmosphere
      ctx.fillStyle = "#050709";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
      ctx.fillStyle = "rgba(0, 255, 65, 0.4)";
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < Math.random() * 12; j++) {
          ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], i * FONT_SIZE, j * FONT_SIZE * 1.4);
        }
      }
    } else {
      raf = requestAnimationFrame(draw);
    }

    // Pause when tab hidden — saves battery on mobile
    function onVis() {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduced) raf = requestAnimationFrame(draw);
    }
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity,
        mixBlendMode: "screen",
      }}
    />
  );
}
