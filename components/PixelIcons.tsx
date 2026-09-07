"use strict";
import React from "react";

export interface PixelIconProps {
  className?: string;
  size?: number;
}

export function PixelScrewdriver({ className = "", size = 24 }: PixelIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={`inline-block ${className}`}>
      {/* 16x16 Pixel Screwdriver & Wrench */}
      <rect x="12" y="2" width="2" height="2" fill="#facc15" />
      <rect x="10" y="4" width="2" height="2" fill="#facc15" />
      <rect x="8" y="6" width="2" height="2" fill="#e2e8f0" />
      <rect x="6" y="8" width="2" height="2" fill="#94a3b8" />
      <rect x="4" y="10" width="2" height="2" fill="#ef4444" />
      <rect x="2" y="12" width="2" height="2" fill="#b91c1c" />
      <rect x="1" y="13" width="2" height="2" fill="#7f1d1d" />
      <rect x="13" y="1" width="2" height="1" fill="#ca8a04" />
      <rect x="14" y="2" width="1" height="2" fill="#ca8a04" />
    </svg>
  );
}

export function PixelChip({ className = "", size = 24 }: PixelIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={`inline-block ${className}`}>
      {/* 16x16 Motherboard / CPU Chip */}
      <rect x="3" y="3" width="10" height="10" fill="#047857" />
      <rect x="5" y="5" width="6" height="6" fill="#0f172a" />
      <rect x="6" y="6" width="4" height="4" fill="#fbbf24" />
      {/* Pins */}
      <rect x="5" y="1" width="2" height="2" fill="#cbd5e1" />
      <rect x="9" y="1" width="2" height="2" fill="#cbd5e1" />
      <rect x="5" y="13" width="2" height="2" fill="#cbd5e1" />
      <rect x="9" y="13" width="2" height="2" fill="#cbd5e1" />
      <rect x="1" y="5" width="2" height="2" fill="#cbd5e1" />
      <rect x="1" y="9" width="2" height="2" fill="#cbd5e1" />
      <rect x="13" y="5" width="2" height="2" fill="#cbd5e1" />
      <rect x="13" y="9" width="2" height="2" fill="#cbd5e1" />
    </svg>
  );
}

export function PixelFloppy({ className = "", size = 24 }: PixelIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={`inline-block ${className}`}>
      {/* 16x16 Retro Floppy Disk / Software */}
      <rect x="2" y="2" width="12" height="12" fill="#2563eb" />
      <rect x="4" y="2" width="7" height="5" fill="#f8fafc" />
      <rect x="8" y="3" width="2" height="3" fill="#3b82f6" />
      <rect x="4" y="9" width="8" height="5" fill="#0f172a" />
      <rect x="5" y="10" width="6" height="3" fill="#38bdf8" />
    </svg>
  );
}

export function PixelNetwork({ className = "", size = 24 }: PixelIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={`inline-block ${className}`}>
      {/* 16x16 Pixel RJ45 / WiFi Radar */}
      <rect x="1" y="2" width="14" height="2" fill="#00f0ff" />
      <rect x="3" y="5" width="10" height="2" fill="#00f0ff" />
      <rect x="5" y="8" width="6" height="2" fill="#00f0ff" />
      <rect x="7" y="11" width="2" height="4" fill="#39ff14" />
      <rect x="4" y="14" width="8" height="2" fill="#39ff14" />
    </svg>
  );
}

export function PixelRig({ className = "", size = 24 }: PixelIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={`inline-block ${className}`}>
      {/* 16x16 Pixel PC Case */}
      <rect x="3" y="1" width="10" height="14" fill="#1e293b" />
      <rect x="4" y="2" width="8" height="6" fill="#0f172a" />
      {/* Glass & RGB internal */}
      <rect x="5" y="3" width="2" height="4" fill="#ff0077" />
      <rect x="8" y="3" width="3" height="2" fill="#00f0ff" />
      <rect x="8" y="6" width="3" height="1" fill="#39ff14" />
      {/* Power Button & Front Mesh */}
      <rect x="11" y="9" width="1" height="1" fill="#38bdf8" />
      <rect x="5" y="10" width="6" height="1" fill="#475569" />
      <rect x="5" y="12" width="6" height="1" fill="#475569" />
    </svg>
  );
}

export function PixelHeart({ className = "", size = 24, filled = true }: PixelIconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={`inline-block ${className}`}>
      <path
        d="M2 4h4v2H2zM10 4h4v2h-4zM1 6h6v2H1zM9 6h6v2H9zM1 8h14v2H1zM2 10h12v2H2zM4 12h8v2H4zM6 14h4v2H6z"
        fill={filled ? "#ff0055" : "#475569"}
      />
      {filled && <rect x="3" y="6" width="2" height="2" fill="#ff80aa" />}
    </svg>
  );
}

export function PixelCoin({ className = "", size = 24 }: PixelIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={`inline-block ${className}`}>
      <rect x="4" y="1" width="8" height="1" fill="#facc15" />
      <rect x="2" y="2" width="12" height="1" fill="#facc15" />
      <rect x="1" y="4" width="14" height="8" fill="#eab308" />
      <rect x="2" y="13" width="12" height="1" fill="#ca8a04" />
      <rect x="4" y="14" width="8" height="1" fill="#a16207" />
      {/* Inner $ icon */}
      <rect x="5" y="4" width="6" height="8" fill="#fef08a" />
      <rect x="7" y="5" width="2" height="6" fill="#854d0e" />
      <rect x="6" y="6" width="4" height="1" fill="#854d0e" />
      <rect x="6" y="9" width="4" height="1" fill="#854d0e" />
    </svg>
  );
}

export function PixelGpu({ className = "", size = 24 }: PixelIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={`inline-block ${className}`}>
      <rect x="1" y="4" width="14" height="8" fill="#334155" />
      <rect x="2" y="5" width="4" height="6" fill="#0f172a" />
      <rect x="7" y="5" width="4" height="6" fill="#0f172a" />
      {/* Dual Fans */}
      <rect x="3" y="6" width="2" height="4" fill="#38bdf8" />
      <rect x="8" y="6" width="2" height="4" fill="#38bdf8" />
      <rect x="12" y="5" width="2" height="6" fill="#64748b" />
      {/* PCIe Gold Fingers */}
      <rect x="3" y="12" width="7" height="2" fill="#fbbf24" />
      <rect x="11" y="12" width="2" height="2" fill="#fbbf24" />
    </svg>
  );
}

export function PixelShield({ className = "", size = 24 }: PixelIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={`inline-block ${className}`}>
      <rect x="2" y="2" width="12" height="2" fill="#3b82f6" />
      <rect x="2" y="4" width="12" height="4" fill="#2563eb" />
      <rect x="3" y="8" width="10" height="3" fill="#1d4ed8" />
      <rect x="5" y="11" width="6" height="2" fill="#1e40af" />
      <rect x="7" y="13" width="2" height="2" fill="#1e3a8a" />
      {/* Cross */}
      <rect x="7" y="4" width="2" height="6" fill="#f8fafc" />
      <rect x="5" y="6" width="6" height="2" fill="#f8fafc" />
    </svg>
  );
}

export function PixelSkull({ className = "", size = 24 }: PixelIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={`inline-block ${className}`}>
      <rect x="4" y="2" width="8" height="2" fill="#cbd5e1" />
      <rect x="2" y="4" width="12" height="6" fill="#e2e8f0" />
      <rect x="4" y="5" width="2" height="3" fill="#0f172a" />
      <rect x="10" y="5" width="2" height="3" fill="#0f172a" />
      <rect x="7" y="9" width="2" height="1" fill="#0f172a" />
      <rect x="4" y="10" width="8" height="4" fill="#cbd5e1" />
      <rect x="5" y="12" width="1" height="2" fill="#0f172a" />
      <rect x="7" y="12" width="1" height="2" fill="#0f172a" />
      <rect x="9" y="12" width="1" height="2" fill="#0f172a" />
    </svg>
  );
}
