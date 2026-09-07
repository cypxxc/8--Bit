"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { sound } from "@/lib/sound";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, X, Skull } from "lucide-react";
import { SHOP_CONFIG } from "@/lib/config";

const TROLL_MESSAGES = [
  "เหยียดดด! จะแอบส่อง Inspect หาอะไรผู้กล้า? สูตรเงิน 999,999 ไม่มีในนี้นะจ๊ะ! 👾",
  "สูตรโกงไม่ผ่าน! กรุณากด: บน บน ล่าง ล่าง ซ้าย ขวา ซ้าย ขวา B A Start แทน 🎮",
  "🚨 ตรวจพบพฤติกรรมแฮกเกอร์! แอดมินกำลังส่งกองทัพไวรัส 8-bit ไปยังเครื่องของท่าน... ล้อเล่นน่า 5555",
  "จะขโมย CSS เหรอจ๊ะ? อย่าแอบส่องเลย แอดไลน์มาคุยกันดีๆ เดี๋ยวบอกสเปกคอมให้! 🪛",
  "ACCESS DENIED! ด่านนี้ล็อกไว้สำหรับระดับ GM เท่านั้น ผู้กล้าเวล 1 ถอยไปก่อนนะ!",
];

export default function AntiInspectTrap() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [comboCount, setComboCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerTrap = useCallback(() => {
    sound.playError();
    const randomMsg = TROLL_MESSAGES[Math.floor(Math.random() * TROLL_MESSAGES.length)];
    setCurrentMessage(randomMsg);
    setComboCount((prev) => prev + 1);
    setIsOpen(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 4500);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Funny Console Trap (Troll message inside devtools)
    const printConsoleBanner = () => {
      const banner = `
%c  ██████╗       ██████╗ ██╗████████╗    ██████╗ ██╗ ██████╗ ███████╗
%c  ██╔══██╗      ██╔══██╗██║╚══██╔══╝    ██╔══██╗██║██╔════╝ ██╔════╝
%c  ██████╔╝█████╗██████╔╝██║   ██║       ██████╔╝██║██║  ███╗███████╗
%c  ██╔══██╗╚════╝██╔══██╗██║   ██║       ██╔══██╗██║██║   ██║╚════██║
%c  ██████╔╝      ██████╔╝██║   ██║       ██║  ██║██║╚██████╔╝███████║
%c  ╚═════╝       ╚═════╝ ╚═╝   ╚═╝       ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚══════╝
      `;
      console.log(
        banner,
        "color: #39ff14;",
        "color: #00f0ff;",
        "color: #facc15;",
        "color: #ff0077;",
        "color: #38bdf8;",
        "color: #a855f7;"
      );
      console.log(
        "%c🚨 HOLD IT RIGHT THERE, HACKER! 🚨%c\n\n" +
          "จะแอบส่อง Source Code หรือหาบั๊กอะไรอยู่ผู้กล้า? 🎮\n" +
          "ที่นี่คือร้าน '8-BIT RIGS & REPAIRS' รับซ่อมและอัปเกรดคอมของจริง ไม่มีช่องโหว่ให้ฟาร์มเลเวลหรอกนะ!\n\n" +
          "👉 ติดต่อช่างตัวจริงได้ที่ LINE OA: " +
          SHOP_CONFIG.line.oaId,
        "background: #ff0055; color: #ffffff; font-size: 16px; font-weight: bold; padding: 6px 12px; border: 2px solid #000;",
        "color: #39ff14; font-size: 13px; font-family: monospace; line-height: 1.6;"
      );
    };

    printConsoleBanner();

    // 2. Block Right-Click Context Menu (Except on input/textarea so users can paste)
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return; // Allow native context menu for pasting text in forms
      }
      e.preventDefault();
      triggerTrap();
    };

    // 3. Block DevTools Shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // F12
      if (e.key === "F12") {
        e.preventDefault();
        triggerTrap();
        return;
      }

      // Ctrl+Shift+I / J / C (Inspect / Console / Element)
      if (
        isCmdOrCtrl &&
        e.shiftKey &&
        (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")
      ) {
        e.preventDefault();
        triggerTrap();
        return;
      }

      // Ctrl+U (View Source)
      if (isCmdOrCtrl && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        triggerTrap();
        return;
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [triggerTrap]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] pointer-events-none flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 450, damping: 22 }}
            className="pointer-events-auto max-w-lg w-full retro-window border-4 border-[#ff0055] shadow-[0_0_50px_rgba(255,0,85,0.7)] bg-[#0a050f]"
          >
            {/* Header */}
            <div className="bg-[#b91c1c] text-white px-3 py-2 flex items-center justify-between font-press-start text-xs border-b-2 border-black">
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#facc15] animate-pulse" />
                <span className="animate-retro-blink">ACCESS_DENIED.EXE</span>
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsOpen(false);
                }}
                className="text-white hover:text-[#fde047] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-[#450a0a] border-2 border-[#ef4444] shrink-0 text-[#facc15]">
                  <Skull className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <div className="text-[11px] font-press-start text-[#ff0077]">
                    [ ANTI-INSPECT SYSTEM ACTIVE ]
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-thai text-[#fde047] mt-1">
                    ระบบป้องกันการส่องโค้ดทำงาน!
                  </h3>
                  <p className="text-xs font-vt323 text-[#94a3b8] mt-0.5">
                    ATTEMPT #{comboCount} • IP LOGGED TO 8-BIT CYBER LAB
                  </p>
                </div>
              </div>

              {/* Trolling Message Box */}
              <div className="p-3.5 bg-[#170a1a] border-2 border-dashed border-[#ff0077] font-thai text-sm text-[#f1f5f9] leading-relaxed">
                {currentMessage}
              </div>

              {/* Konami Hint & Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#331427]">
                <span className="text-[10px] font-press-start text-[#64748b] text-center sm:text-left">
                  HINT: [ ↑ ↑ ↓ ↓ ← → ← → B A ]
                </span>
                <button
                  onClick={() => {
                    sound.playCoin();
                    setIsOpen(false);
                  }}
                  className="w-full sm:w-auto px-4 py-2 font-press-start text-xs pixel-btn-green cursor-pointer hover:scale-105 active:scale-95 transition-transform text-black"
                >
                  [ ยอมรับชะตากรรม ]
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
