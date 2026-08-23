"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
};

const COLORS = ["#ffb627", "#ff8a1f", "#27d3c5", "#2fd48f", "#ffffff", "#ff3b5c"];

/**
 * A tiny, dependency-free canvas confetti burst. Runs once for ~2s, then
 * unmounts its own animation. Skipped entirely under reduced motion.
 */
export function Confetti({ count = 90, durationMs = 2200 }: { count?: number; durationMs?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();

    const W = () => canvas.width / dpr;
    const H = () => canvas.height / dpr;
    const particles: Particle[] = Array.from({ length: count }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      const speed = 7 + Math.random() * 9;
      return {
        x: W() / 2 + (Math.random() - 0.5) * W() * 0.3,
        y: H() * 0.35,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 1,
      };
    });

    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      const t = (now - start) / durationMs;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W(), H());
      for (const p of particles) {
        p.vy += 0.35;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life = Math.max(0, 1 - Math.max(0, t - 0.6) / 0.4);
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (t < 1) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W(), H());
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count, durationMs, reduced]);

  if (reduced) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40"
    />
  );
}
