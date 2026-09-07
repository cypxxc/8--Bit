"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { sound } from "@/lib/sound";
import { motion, AnimatePresence } from "motion/react";
import { Zap } from "lucide-react";

interface BiosBootScreenProps {
  onComplete?: () => void;
  forceShow?: boolean;
  onClose?: () => void;
}

export default function BiosBootScreen({
  onComplete,
  forceShow = false,
  onClose,
}: BiosBootScreenProps) {
  const [dismissed, setDismissed] = useState(false);
  const [prevForceShow, setPrevForceShow] = useState(forceShow);
  const [lines, setLines] = useState<string[]>([]);
  const [ramCount, setRamCount] = useState(0);
  const [readyToStart, setReadyToStart] = useState(false);

  if (forceShow !== prevForceShow) {
    setPrevForceShow(forceShow);
    setDismissed(false);
  }

  const visible = forceShow && !dismissed;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ramTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (ramTimerRef.current) clearInterval(ramTimerRef.current);
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
  }, []);

  const startBootSequence = useCallback(() => {
    clearAllTimers();

    const bootLogs = [
      "8-BIT ENERGY V2.4 BIOS (C) 2026 CYBER WORKSHOP CO., LTD.",
      "INITIALIZING HARDWARE TEST PROTOCOL...",
      "PROCESSOR: RETRO OCTA-CORE BEAST @ 5.40 GHz [OK]",
      "BUS SPEED: 6400 MT/s • PCI-EXPRESS 5.0 SLOTS: DETECTED",
      "CHECKING SYSTEM MEMORY...",
    ];

    let step = 0;
    finishTimeoutRef.current = setTimeout(() => {
      setLines([]);
      setRamCount(0);
      setReadyToStart(false);

      timerRef.current = setInterval(() => {
      if (step < bootLogs.length) {
        const currentLine = bootLogs[step];
        if (currentLine) {
          sound.playClick();
          setLines((prev) => [...prev, currentLine]);
        }
        step++;
      } else {
        if (timerRef.current) clearInterval(timerRef.current);

        // Start RAM Count up (snappy 4-step cadence for reduced render churn)
        let currentRam = 0;
        ramTimerRef.current = setInterval(() => {
          currentRam += 16384;
          if (currentRam >= 65536) {
            currentRam = 65536;
            if (ramTimerRef.current) clearInterval(ramTimerRef.current);
            setRamCount(65536);
            sound.playCoin();

            // Finish secondary logs
            finishTimeoutRef.current = setTimeout(() => {
              setLines((prev) => [
                ...prev,
                "MEMORY TEST: 65536 KB OK (EXTENDED DUAL-CHANNEL)",
                "DISPLAY: RTX 4090 PIXEL MATRIX • SYNC: 144Hz [OK]",
                "AUDIO: WEB AUDIO 8-BIT SYNTHESIZER [ONLINE]",
                "NETWORKING: 10Gbps CYBER LINK ACTIVE",
                "---------------------------------------------------",
                "ALL SYSTEMS STABLE. PRESS START TO COMMENCE QUEST.",
              ]);
              sound.playPowerUp();
              setReadyToStart(true);
            }, 180);
          } else {
            setRamCount(currentRam);
          }
        }, 50);
      }
    }, 160);
  }, 0);
}, [clearAllTimers]);

  const handleStart = useCallback(() => {
    sound.playVictory();
    clearAllTimers();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("8bit_has_booted", "true");
    }
    setDismissed(true);
    onClose?.();
    onComplete?.();
  }, [clearAllTimers, onClose, onComplete]);

  const handleSkip = useCallback(() => {
    sound.playSelect();
    clearAllTimers();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("8bit_has_booted", "true");
    }
    setDismissed(true);
    onClose?.();
    onComplete?.();
  }, [clearAllTimers, onClose, onComplete]);

  useEffect(() => {
    if (!visible) {
      clearAllTimers();
      return;
    }

    startBootSequence();

    return () => {
      clearAllTimers();
    };
  }, [visible, clearAllTimers, startBootSequence]);

  // Listen to Enter or Space
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        if (readyToStart) {
          handleStart();
        } else {
          handleSkip();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, readyToStart, handleStart, handleSkip]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: -40,
            filter: "brightness(2) contrast(1.5)",
            transition: { duration: 0.5, ease: "easeInOut" },
          }}
          className="fixed inset-0 z-[100] bg-black text-[#cbd5e1] font-vt323 text-lg sm:text-xl p-6 sm:p-12 overflow-hidden flex flex-col justify-between select-none"
        >
          {/* CRT Scanline filter over boot screen */}
          <div className="absolute inset-0 scanlines-overlay pointer-events-none" />
          <div className="absolute inset-0 crt-vignette pointer-events-none" />

          {/* Top BIOS Header */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-start justify-between border-b-2 border-[#1e293b] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1e293b] border-2 border-[#38bdf8] flex items-center justify-center font-press-start text-xs text-[#39ff14]">
                  8B
                </div>
                <div>
                  <div className="font-press-start text-xs sm:text-sm text-white tracking-wider">
                    8-BIT RIGS & REPAIRS WORKSHOP BIOS
                  </div>
                  <div className="text-sm text-[#94a3b8]">
                    VERSION 2.4.0 (BUILD 2026-09-07)
                  </div>
                </div>
              </div>

              <button
                onClick={handleSkip}
                className="font-press-start text-[10px] text-[#94a3b8] hover:text-[#facc15] border border-[#334155] px-2.5 py-1.5 bg-[#0f172a] cursor-pointer"
              >
                [ ESC : SKIP INTRO ]
              </button>
            </div>

            {/* Boot Log Stream */}
            <div className="space-y-1 text-[#38bdf8] max-w-3xl leading-relaxed">
              {lines
                .filter((l): l is string => Boolean(l) && typeof l === "string")
                .map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line?.includes("ALL SYSTEMS")
                        ? "text-[#39ff14] font-bold text-xl sm:text-2xl mt-2 animate-pulse"
                        : line?.includes("MEMORY TEST")
                        ? "text-[#facc15]"
                        : ""
                    }
                  >
                    &gt; {line}
                  </div>
                ))}

              {ramCount > 0 && ramCount < 65536 && (
                <div className="text-[#facc15] flex items-center gap-2">
                  <span>&gt; TESTING RAM:</span>
                  <span className="font-press-start text-xs text-white">
                    {ramCount.toLocaleString()} KB
                  </span>
                  <span className="w-2 h-4 bg-[#facc15] animate-ping" />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Start Banner */}
          <div className="relative z-10 pt-6 border-t-2 border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-press-start text-[#94a3b8]">
              SYSTEM ID: 0x8B-WORKBENCH-PRO
            </div>

            {readyToStart ? (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="pixel-btn-green px-8 py-3.5 font-press-start text-xs sm:text-sm text-black cursor-pointer shadow-[0_0_20px_rgba(57,255,20,0.6)] animate-pulse flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-black" />
                <span>[ PRESS START / CLICK TO ENTER ]</span>
              </motion.button>
            ) : (
              <div className="font-press-start text-[11px] text-[#facc15] flex items-center gap-2">
                <span className="w-2 h-2 bg-[#facc15] animate-ping" />
                <span>SYSTEM DIAGNOSTIC RUNNING...</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
