"use client";

import React from "react";

interface ScanlinesProps {
  enabled: boolean;
}

export default function Scanlines({ enabled }: ScanlinesProps) {
  if (!enabled) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 scanlines-overlay pointer-events-none" />
      <div className="fixed inset-0 z-50 crt-vignette pointer-events-none" />
    </>
  );
}
