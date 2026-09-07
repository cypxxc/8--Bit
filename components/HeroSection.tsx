"use client";

import React from "react";
import { sound } from "@/lib/sound";
import {
  PixelScrewdriver,
  PixelFloppy,
  PixelNetwork,
  PixelRig,
} from "@/components/PixelIcons";
import TiltCard from "@/components/motion/TiltCard";
import { motion } from "motion/react";
import { Sparkles, ShieldCheck, Zap, Wrench } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative pt-8 pb-16 md:py-20 overflow-hidden bg-gradient-to-b from-[#090b10] via-[#0d131f] to-[#090b10]">
      {/* Background Pixel Grid Accents */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Arcade Intro & Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Retro Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-[#1e293b]/90 border-2 border-[#38bdf8] text-[#38bdf8] text-xs font-press-start shadow-[3px_3px_0_#000]"
            >
              <span className="w-2 h-2 bg-[#39ff14] animate-retro-blink" />
              <span>SYSTEM READY • PLAYER 1 READY</span>
            </motion.div>

            {/* Main Headline */}
            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl sm:text-4xl md:text-5xl font-thai font-bold text-white tracking-tight leading-tight"
              >
                Windows, Software &amp; Upgrade <br />
                <span className="text-[#39ff14]">
                  ให้เหมาะกับการใช้งานของคุณ
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-base sm:text-lg md:text-xl text-[#cbd5e1] font-thai leading-relaxed font-medium"
              >
                บริการติดตั้ง Windows และ Software อัปเกรด RAM, SSD และอุปกรณ์ พร้อมทำความสะอาดและดูแลเครื่อง ประเมินความเหมาะสมและแจ้งราคาก่อนเริ่มงาน
              </motion.p>
            </div>

            {/* Core Badges Row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1"
            >
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0f172a] border border-[#334155] text-xs text-[#94a3b8] hover:border-[#38bdf8] transition-colors">
                <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
                ประเมินก่อนเริ่มงาน
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0f172a] border border-[#334155] text-xs text-[#94a3b8] hover:border-[#facc15] transition-colors">
                <Zap className="w-3.5 h-3.5 text-[#facc15]" />
                สอบถามผ่าน LINE OA
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0f172a] border border-[#334155] text-xs text-[#94a3b8] hover:border-[#39ff14] transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-[#39ff14]" />
                ยืนยันราคาก่อนดำเนินการ
              </span>
            </motion.div>

            {/* Action Buttons (Press Start) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <a
                href="#ticket-log"
                onClick={() => sound.playPowerUp()}
                className="pixel-btn-green px-6 py-3.5 text-xs sm:text-sm font-press-start text-center flex items-center justify-center gap-2 group cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              >
                <Wrench className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                <span>ขอรับบริการ</span>
              </a>

              <a
                href="#missions"
                onClick={() => sound.playLaser()}
                className="pixel-btn-cyan px-6 py-3.5 text-xs sm:text-sm font-press-start text-center flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              >
                <span>ดูบริการของร้าน</span>
              </a>
            </motion.div>

            {/* Live Stats Board */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t-2 border-[#1e293b]"
            >
              <div className="bg-[#0f172a] p-2.5 sm:p-3 border-2 border-[#1e293b] text-center hover:border-[#39ff14] transition-colors group">
                <div className="text-xs sm:text-sm font-press-start text-[#39ff14] group-hover:scale-110 transition-transform">PC</div>
                <div className="text-[11px] text-[#94a3b8] font-thai mt-0.5">คอมพิวเตอร์ตั้งโต๊ะ</div>
              </div>
              <div className="bg-[#0f172a] p-2.5 sm:p-3 border-2 border-[#1e293b] text-center hover:border-[#facc15] transition-colors group">
                <div className="text-xs sm:text-sm font-press-start text-[#facc15] group-hover:scale-110 transition-transform">Notebook</div>
                <div className="text-[11px] text-[#94a3b8] font-thai mt-0.5">โน้ตบุ๊ก</div>
              </div>
              <div className="bg-[#0f172a] p-2.5 sm:p-3 border-2 border-[#1e293b] text-center hover:border-[#00f0ff] transition-colors group">
                <div className="text-xs sm:text-sm font-press-start text-[#00f0ff] group-hover:scale-110 transition-transform">LINE OA</div>
                <div className="text-[11px] text-[#94a3b8] font-thai mt-0.5">ปรึกษาก่อนรับบริการ</div>
              </div>
            </motion.div>

          </motion.div>

          {/* Right Column: 8-Bit Interactive Pixel Workshop Scene with 3D Tilt */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-5 flex justify-center"
          >
            <TiltCard maxTilt={10} className="w-full max-w-md">
              <div className="retro-window p-1 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                {/* Window Header */}
                <div className="retro-window-header px-3 py-1.5 flex items-center justify-between text-white text-xs font-press-start">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#ef4444] border border-black inline-block" />
                    <span className="w-2.5 h-2.5 bg-[#eab308] border border-black inline-block" />
                    <span className="w-2.5 h-2.5 bg-[#22c55e] border border-black inline-block" />
                    <span className="ml-1 text-[11px]">WORKBENCH_V2.0.EXE</span>
                  </span>
                  <span className="text-[10px] text-[#bfdbfe] animate-pulse">60 FPS</span>
                </div>

                {/* Window Screen Body */}
                <div className="bg-[#06090e] p-4 sm:p-6 border-2 border-[#000] relative overflow-hidden">
                  {/* Pixel Art Scene SVG */}
                  <div className="relative mx-auto w-full aspect-[4/3] bg-[#0d1527] border-4 border-[#1e293b] flex items-center justify-center overflow-hidden">
                    
                    {/* CRT lines inside canvas */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none" />

                    {/* Pixel Workbench Art */}
                    <svg viewBox="0 0 200 150" className="w-full h-full">
                      {/* Background Wall Tiles */}
                      <rect x="0" y="0" width="200" height="110" fill="#0f172a" />
                      <line x1="0" y1="30" x2="200" y2="30" stroke="#1e293b" strokeWidth="2" />
                      <line x1="0" y1="60" x2="200" y2="60" stroke="#1e293b" strokeWidth="2" />
                      <line x1="0" y1="90" x2="200" y2="90" stroke="#1e293b" strokeWidth="2" />
                      
                      {/* Pegboard Tools */}
                      <rect x="20" y="10" width="50" height="35" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                      <rect x="28" y="15" width="4" height="15" fill="#ef4444" />
                      <rect x="29" y="30" width="2" height="10" fill="#94a3b8" />
                      <rect x="42" y="15" width="4" height="20" fill="#f59e0b" />
                      <rect x="52" y="15" width="4" height="18" fill="#3b82f6" />

                      {/* Poster on wall */}
                      <rect x="140" y="10" width="45" height="40" fill="#047857" stroke="#000" strokeWidth="2" />
                      <text x="144" y="24" fill="#39ff14" fontSize="6" fontFamily="monospace" fontWeight="bold">8-BIT</text>
                      <text x="144" y="34" fill="#ffffff" fontSize="5" fontFamily="monospace">MASTERS</text>
                      <rect x="145" y="38" width="12" height="8" fill="#fbbf24" />

                      {/* Wooden Desk Top */}
                      <rect x="0" y="105" width="200" height="45" fill="#78350f" />
                      <rect x="0" y="105" width="200" height="4" fill="#a16207" />

                      {/* Left: Custom PC Rig on Bench with Float animation */}
                      <g className="animate-pixel-float">
                        <rect x="20" y="55" width="45" height="50" fill="#020617" stroke="#38bdf8" strokeWidth="2" />
                        <rect x="24" y="59" width="37" height="42" fill="#0f172a" />
                        <circle cx="42" cy="75" r="10" fill="none" stroke="#ff0077" strokeWidth="3" strokeDasharray="4 2" />
                        <circle cx="42" cy="75" r="4" fill="#00f0ff" />
                        <rect x="26" y="90" width="33" height="7" fill="#334155" />
                        <rect x="30" y="91" width="8" height="5" fill="#39ff14" />
                        <rect x="44" y="91" width="8" height="5" fill="#39ff14" />
                      </g>

                      {/* Right: CRT Monitor on Bench */}
                      <rect x="110" y="60" width="65" height="45" fill="#cbd5e1" stroke="#000" strokeWidth="2" />
                      <rect x="116" y="65" width="53" height="34" fill="#000" />
                      <text x="120" y="74" fill="#39ff14" fontSize="5" fontFamily="monospace">&gt; DIAGNOSTIC: OK</text>
                      <text x="120" y="82" fill="#39ff14" fontSize="5" fontFamily="monospace">&gt; CPU TEMP: 38°C</text>
                      <text x="120" y="90" fill="#00f0ff" fontSize="5" fontFamily="monospace">&gt; READY TO PLAY</text>
                      <rect x="135" y="105" width="15" height="4" fill="#94a3b8" />
                      <rect x="130" y="108" width="25" height="2" fill="#64748b" />

                      {/* Solder smoke animation */}
                      <circle cx="85" cy="85" r="2" fill="#94a3b8" opacity="0.6">
                        <animate attributeName="cy" values="85;65;50" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.6;0.3;0" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="87" cy="80" r="3" fill="#cbd5e1" opacity="0.5">
                        <animate attributeName="cy" values="80;60;45" dur="2.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.5;0.2;0" dur="2.4s" repeatCount="indefinite" />
                      </circle>

                      {/* Character fixing motherboard in center */}
                      <rect x="75" y="95" width="25" height="10" fill="#047857" stroke="#fbbf24" strokeWidth="1" />
                      <rect x="80" y="88" width="5" height="7" fill="#facc15" />
                    </svg>

                    {/* Overlay Action Tag */}
                    <div className="absolute bottom-2 left-2 right-2 bg-[#090b10]/90 border border-[#38bdf8] p-1.5 flex items-center justify-between text-[10px] font-press-start">
                      <span className="text-[#39ff14] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#39ff14] animate-ping" />
                        DIAGNOSIS ACTIVE
                      </span>
                      <span className="text-[#facc15]">CPU: 100% HEALTH</span>
                    </div>
                  </div>

                  {/* Quick 4-Class Selector Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 mt-3">
                    <a
                      href="#missions"
                      onClick={() => sound.playSelect()}
                      className="p-1.5 bg-[#0f172a] hover:bg-[#1e293b] border border-[#334155] hover:border-[#facc15] text-center group cursor-pointer transition-colors"
                    >
                      <PixelScrewdriver size={18} className="mx-auto" />
                      <div className="text-[9px] font-press-start text-[#cbd5e1] group-hover:text-[#facc15] mt-1">HW</div>
                    </a>
                    <a
                      href="#missions"
                      onClick={() => sound.playSelect()}
                      className="p-1.5 bg-[#0f172a] hover:bg-[#1e293b] border border-[#334155] hover:border-[#38bdf8] text-center group cursor-pointer transition-colors"
                    >
                      <PixelFloppy size={18} className="mx-auto" />
                      <div className="text-[9px] font-press-start text-[#cbd5e1] group-hover:text-[#38bdf8] mt-1">SW</div>
                    </a>
                    <a
                      href="#missions"
                      onClick={() => sound.playSelect()}
                      className="p-1.5 bg-[#0f172a] hover:bg-[#1e293b] border border-[#334155] hover:border-[#39ff14] text-center group cursor-pointer transition-colors"
                    >
                      <PixelNetwork size={18} className="mx-auto" />
                      <div className="text-[9px] font-press-start text-[#cbd5e1] group-hover:text-[#39ff14] mt-1">NET</div>
                    </a>
                    <a
                      href="#missions"
                      onClick={() => sound.playSelect()}
                      className="p-1.5 bg-[#0f172a] hover:bg-[#1e293b] border border-[#334155] hover:border-[#ff0077] text-center group cursor-pointer transition-colors"
                    >
                      <PixelRig size={18} className="mx-auto" />
                      <div className="text-[9px] font-press-start text-[#cbd5e1] group-hover:text-[#ff0077] mt-1">RIG</div>
                    </a>
                  </div>

                </div>
              </div>
            </TiltCard>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
