"use client";

import React, { useEffect, useRef } from "react";

interface PixelParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export default function PixelCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip on touch-only devices or if user prefers reduced motion
    const isTouchOnly = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouchOnly || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number | null = null;
    let isRunning = false;
    const particles: PixelParticle[] = [];
    const MAX_PARTICLES = 40;
    const colors = ["#39ff14", "#00f0ff", "#facc15", "#ff0077", "#ffffff"];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;

    const render = () => {
      if (particles.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        isRunning = false;
        animId = null;
        return; // Auto-sleep: pause RAF loop when idle to save CPU/GPU & battery
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        // Draw crisp pixel squares
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastTime < 16) return; // throttle to ~60fps input sampling
      lastTime = now;

      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (dist < 10) return;
      lastX = e.clientX;
      lastY = e.clientY;

      if (particles.length >= MAX_PARTICLES) {
        particles.splice(0, 2); // Drop oldest particles to prevent unbounded growth
      }

      // Spawn 1-2 pixel sparkles
      const count = dist > 40 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() > 0.6 ? 4 : 2; // 8-bit square grid sizes
        particles.push({
          x: Math.floor(e.clientX / 2) * 2 + (Math.random() * 6 - 3),
          y: Math.floor(e.clientY / 2) * 2 + (Math.random() * 6 - 3),
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 - 0.4, // float up slightly
          size,
          color,
          alpha: 1,
          decay: 0.03 + Math.random() * 0.03,
        });
      }

      // Wake up the render loop if currently sleeping
      if (!isRunning) {
        isRunning = true;
        animId = requestAnimationFrame(render);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 mix-blend-screen"
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}
