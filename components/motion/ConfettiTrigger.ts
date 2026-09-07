"use client";

import confetti from "canvas-confetti";

export function triggerRetroConfetti() {
  if (typeof window !== "undefined") {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;
  }

  // Blast 8-bit style square confetti with neon palette
  const count = 80;
  const defaults = {
    origin: { y: 0.7 },
    colors: ["#39ff14", "#00f0ff", "#facc15", "#ff0077", "#ffffff"],
    shapes: ["square"] as confetti.Shape[],
    scalar: 1.1,
    disableForReducedMotion: true,
  };

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.6),
    spread: 60,
    startVelocity: 40,
  });

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.4),
    spread: 90,
    startVelocity: 50,
  });
}
