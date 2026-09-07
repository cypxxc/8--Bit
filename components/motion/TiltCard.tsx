"use client";

import React, { useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}

export default function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  glare = true,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Normalized mouse offset from center: [-0.5, 0.5]
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glareOpacity = useMotionValue(0);

  const springConfig = { stiffness: 350, damping: 25, mass: 0.5 };
  const rawRotateX = useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rawRotateY = useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const springRotateX = useSpring(rawRotateX, springConfig);
  const springRotateY = useSpring(rawRotateY, springConfig);

  // Glare position in percent: [0, 100]
  const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.35) 0%, transparent 65%)`;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
    if (glare) {
      glareOpacity.set(0.15);
    }
  }, [shouldReduceMotion, glare, mouseX, mouseY, glareOpacity]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    if (glare) {
      glareOpacity.set(0);
    }
  }, [glare, mouseX, mouseY, glareOpacity]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
        willChange: "transform",
      }}
      className={`relative ${className}`}
    >
      {children}

      {glare && (
        <motion.div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200 rounded-none"
          style={{
            opacity: glareOpacity,
            background: glareBg,
          }}
        />
      )}
    </motion.div>
  );
}
