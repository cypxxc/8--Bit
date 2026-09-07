"use client";

import React, { useState } from "react";
import { sound } from "@/lib/sound";

import { Volume2, VolumeX, Tv, Menu, X, Terminal, Sparkles, RotateCcw } from "lucide-react";

interface NavbarHudProps {
  scanlinesEnabled: boolean;
  setScanlinesEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
  particlesEnabled?: boolean;
  setParticlesEnabled?: (val: boolean | ((prev: boolean) => boolean)) => void;
  onRebootBios?: () => void;
}

export default function NavbarHud({
  scanlinesEnabled,
  setScanlinesEnabled,
  particlesEnabled = true,
  setParticlesEnabled,
  onRebootBios,
}: NavbarHudProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const toggleScanlines = () => {
    sound.playSelect();
    setScanlinesEnabled((prev) => !prev);
  };

  const toggleParticles = () => {
    sound.playSelect();
    setParticlesEnabled?.((prev) => !prev);
  };

  const navItems = [
    {label:"บริการ",href:"#missions"}, {label:"ขอรับบริการ",href:"#ticket-log"},
    {label:"ขั้นตอน",href:"#hall-of-fame"}, {label:"ติดต่อร้าน",href:"#contact"},
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090b10]/95 backdrop-blur-md border-b-4 border-[#1e293b] shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#"
          onClick={() => sound.playPowerUp()}
          className="flex items-center gap-2 group"
        >
          <div className="w-9 h-9 bg-[#1e293b] border-2 border-[#38bdf8] flex items-center justify-center pixel-border-sm group-hover:bg-[#0284c7] transition-colors">
            <Terminal className="w-5 h-5 text-[#39ff14] group-hover:text-white" />
          </div>
          <div>
            <div className="font-press-start text-xs sm:text-sm text-white tracking-wider group-hover:text-[#00f0ff] transition-colors">
              8-BIT <span className="text-[#39ff14]">COMPUTER</span>
            </div>
            <div className="text-[10px] text-[#94a3b8] font-vt323 tracking-widest uppercase">
              Windows • Upgrade • Care
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => sound.playClick()}
              className="px-3 py-1.5 text-xs font-press-start text-[#cbd5e1] hover:text-[#39ff14] hover:bg-[#1e293b]/60 border border-transparent hover:border-[#38bdf8] transition-all"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Controls & Motion Triggers */}
        <div className="flex items-center gap-2">
          {/* BIOS Reboot Button */}
          {onRebootBios && (
            <button
              onClick={() => {
                sound.playLaser();
                onRebootBios();
              }}
              className="p-2 border-2 border-[#1e293b] hover:border-[#facc15] bg-[#0f172a] text-[#facc15] hover:text-white text-xs transition-colors hidden sm:flex items-center gap-1"
              title="Reboot 8-bit BIOS Screen"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[9px] font-press-start hidden xl:inline">BIOS</span>
            </button>
          )}

          {/* Sparkles Trail Toggle */}
          {setParticlesEnabled && (
            <button
              onClick={toggleParticles}
              className={`p-2 border-2 border-[#1e293b] hover:border-[#38bdf8] text-xs transition-colors ${
                particlesEnabled
                  ? "bg-[#15803d] text-[#39ff14]"
                  : "bg-[#0f172a] text-[#64748b]"
              }`}
              title="Toggle 8-bit Particle Sparkle Trail"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          {/* CRT Scanline Toggle */}
          <button
            aria-pressed={scanlinesEnabled} onClick={toggleScanlines}
            className={`p-2 border-2 border-[#1e293b] hover:border-[#38bdf8] text-xs transition-colors ${
              scanlinesEnabled
                ? "bg-[#0369a1] text-white"
                : "bg-[#0f172a] text-[#64748b]"
            }`}
            title="Toggle CRT Scanlines"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 border-2 border-[#1e293b] hover:border-[#38bdf8] text-xs transition-colors ${
              !isMuted
                ? "bg-[#15803d] text-[#39ff14]"
                : "bg-[#0f172a] text-[#ef4444]"
            }`}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Quick Ticket CTA */}
          <a
            href="#ticket-log"
            onClick={() => sound.playPowerUp()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-press-start pixel-btn-green"
          >
            <span>+</span>
            <span>ขอรับบริการ</span>
          </a>

          {/* Mobile Menu Button */}
          <button aria-label="เมนูหลัก" aria-expanded={mobileMenuOpen}
            onClick={() => {
              sound.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="lg:hidden p-2 bg-[#1e293b] text-white border-2 border-[#334155]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0f172a] border-t-2 border-[#334155] px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => {
                sound.playClick();
                setMobileMenuOpen(false);
              }}
              className="block px-3 py-2 text-xs font-press-start text-[#e2e8f0] hover:text-[#39ff14] hover:bg-[#1e293b] border-l-4 border-transparent hover:border-[#39ff14]"
            >
              &gt; {item.label}
            </a>
          ))}
          <a
            href="#ticket-log"
            onClick={() => {
              sound.playPowerUp();
              setMobileMenuOpen(false);
            }}
            className="block text-center mt-3 py-2.5 font-press-start text-xs pixel-btn-green"
          >
            ส่งคำขอรับบริการ
          </a>
        </div>
      )}
    </header>
  );
}
