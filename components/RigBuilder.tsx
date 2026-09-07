"use client";

import React, { useState } from "react";
import { sound } from "@/lib/sound";
import LineModal from "./LineModal";
import TiltCard from "@/components/motion/TiltCard";
import { triggerRetroConfetti } from "@/components/motion/ConfettiTrigger";
import { PixelGpu } from "@/components/PixelIcons";
import { motion } from "motion/react";
import { Cpu, HardDrive, Fan, Zap, Copy, Check, MessageCircle } from "lucide-react";

interface ComponentOption {
  id: string;
  name: string;
  price: number;
  power: number;
  wattage: number;
}

const CPU_OPTIONS: ComponentOption[] = [
  { id: "cpu_r5", name: "AMD Ryzen 5 7600X (6C/12T)", price: 7490, power: 1200, wattage: 105 },
  { id: "cpu_i5", name: "Intel Core i5-14600KF (14C/20T)", price: 9900, power: 1550, wattage: 125 },
  { id: "cpu_r7", name: "AMD Ryzen 7 7800X3D (3D V-Cache)", price: 15900, power: 2200, wattage: 120 },
  { id: "cpu_i9", name: "Intel Core i9-14900KS (24C/32T Ultimate)", price: 23500, power: 2800, wattage: 250 },
];

const GPU_OPTIONS: ComponentOption[] = [
  { id: "gpu_4060", name: "NVIDIA GeForce RTX 4060 8GB GDDR6", price: 10900, power: 1800, wattage: 115 },
  { id: "gpu_4070s", name: "NVIDIA GeForce RTX 4070 Super 12GB", price: 22900, power: 3400, wattage: 220 },
  { id: "gpu_4080s", name: "NVIDIA GeForce RTX 4080 Super 16GB", price: 37900, power: 4600, wattage: 320 },
  { id: "gpu_4090", name: "NVIDIA GeForce RTX 4090 24GB Boss Rig", price: 69900, power: 6500, wattage: 450 },
];

const RAM_OPTIONS: ComponentOption[] = [
  { id: "ram_16", name: "16GB (8x2) DDR5 6000MHz RGB", price: 2490, power: 400, wattage: 15 },
  { id: "ram_32", name: "32GB (16x2) DDR5 6000MHz CL30", price: 4390, power: 800, wattage: 25 },
  { id: "ram_64", name: "64GB (32x2) DDR5 6400MHz High-Speed", price: 8900, power: 1400, wattage: 40 },
];

const SSD_OPTIONS: ComponentOption[] = [
  { id: "ssd_1tb", name: "1TB M.2 NVMe PCIe 4.0 (5000MB/s)", price: 2690, power: 300, wattage: 10 },
  { id: "ssd_2tb", name: "2TB M.2 NVMe Gen4 (7400MB/s Turbo)", price: 5490, power: 600, wattage: 15 },
  { id: "ssd_4tb", name: "4TB M.2 NVMe Gen4 Extreme Gamer", price: 11900, power: 1000, wattage: 20 },
];

const COOLER_OPTIONS: ComponentOption[] = [
  { id: "cool_air", name: "Dual Tower 6-Heatpipe Air Cooler", price: 1490, power: 250, wattage: 10 },
  { id: "cool_240", name: "240mm ARGB Liquid AIO Cooler", price: 2990, power: 500, wattage: 25 },
  { id: "cool_360", name: "360mm LCD Display Premium Water Cooler", price: 5990, power: 900, wattage: 35 },
];

const PSU_OPTIONS: ComponentOption[] = [
  { id: "psu_650", name: "650W 80+ Bronze Certified", price: 1990, power: 100, wattage: 0 },
  { id: "psu_850", name: "850W 80+ Gold PCIe 5.0 ATX 3.0", price: 4290, power: 300, wattage: 0 },
  { id: "psu_1000", name: "1000W 80+ Platinum Fully Modular", price: 6890, power: 500, wattage: 0 },
];

export default function RigBuilder() {
  const [selectedCpu, setSelectedCpu] = useState(CPU_OPTIONS[1]);
  const [selectedGpu, setSelectedGpu] = useState(GPU_OPTIONS[1]);
  const [selectedRam, setSelectedRam] = useState(RAM_OPTIONS[1]);
  const [selectedSsd, setSelectedSsd] = useState(SSD_OPTIONS[0]);
  const [selectedCooler, setSelectedCooler] = useState(COOLER_OPTIONS[1]);
  const [selectedPsu, setSelectedPsu] = useState(PSU_OPTIONS[1]);
  const [copied, setCopied] = useState(false);
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [partSnapKey, setPartSnapKey] = useState(0);

  // Base assembly fee & chassis
  const BASE_PRICE = 4500;
  const totalPrice =
    BASE_PRICE +
    selectedCpu.price +
    selectedGpu.price +
    selectedRam.price +
    selectedSsd.price +
    selectedCooler.price +
    selectedPsu.price;

  const totalPowerScore =
    selectedCpu.power +
    selectedGpu.power +
    selectedRam.power +
    selectedSsd.power +
    selectedCooler.power +
    selectedPsu.power;

  const totalWattage =
    selectedCpu.wattage +
    selectedGpu.wattage +
    selectedRam.wattage +
    selectedSsd.wattage +
    selectedCooler.wattage +
    50;

  const getTierBadge = () => {
    if (totalPowerScore > 9000) return { label: "GODLIKE 4K BOSS", color: "text-[#ff0077] border-[#ff0077]" };
    if (totalPowerScore > 6500) return { label: "ULTRA 1440P PRO", color: "text-[#00f0ff] border-[#00f0ff]" };
    return { label: "1080P ESPORTS HERO", color: "text-[#39ff14] border-[#39ff14]" };
  };

  const triggerSnap = () => {
    sound.playSelect();
    setPartSnapKey((prev) => prev + 1);
  };

  const applyPreset = (presetName: string) => {
    sound.playPowerUp();
    setPartSnapKey((prev) => prev + 1);
    if (presetName === "budget") {
      setSelectedCpu(CPU_OPTIONS[0]);
      setSelectedGpu(GPU_OPTIONS[0]);
      setSelectedRam(RAM_OPTIONS[0]);
      setSelectedSsd(SSD_OPTIONS[0]);
      setSelectedCooler(COOLER_OPTIONS[0]);
      setSelectedPsu(PSU_OPTIONS[0]);
    } else if (presetName === "streamer") {
      setSelectedCpu(CPU_OPTIONS[1]);
      setSelectedGpu(GPU_OPTIONS[1]);
      setSelectedRam(RAM_OPTIONS[1]);
      setSelectedSsd(SSD_OPTIONS[1]);
      setSelectedCooler(COOLER_OPTIONS[1]);
      setSelectedPsu(PSU_OPTIONS[1]);
    } else if (presetName === "overkill") {
      setSelectedCpu(CPU_OPTIONS[3]);
      setSelectedGpu(GPU_OPTIONS[3]);
      setSelectedRam(RAM_OPTIONS[2]);
      setSelectedSsd(SSD_OPTIONS[2]);
      setSelectedCooler(COOLER_OPTIONS[2]);
      setSelectedPsu(PSU_OPTIONS[2]);
    }
  };

  const getSpecText = () => {
    return `🎮 [สเปกคอมพิวเตอร์สั่งประกอบจาก 8-BIT RIGS] 🎮
----------------------------------------
⚡ CPU: ${selectedCpu.name}
👾 GPU: ${selectedGpu.name}
💾 RAM: ${selectedRam.name}
🚀 SSD: ${selectedSsd.name}
❄️ COOLER: ${selectedCooler.name}
🔌 PSU: ${selectedPsu.name}
📦 CASE: 8-Bit Custom Tempered Glass + ARGB Fans
----------------------------------------
🏆 POWER SCORE: ${totalPowerScore.toLocaleString()} PTS
⚡ LOAD: ~${totalWattage}W
💰 TOTAL ESTIMATED: ฿${totalPrice.toLocaleString()}
----------------------------------------
สนใจสั่งประกอบสเปกนี้ หรือขอปรับแต่งเพิ่มเติมครับ 🙏`;
  };

  const copySpec = () => {
    sound.playCoin();
    triggerRetroConfetti();
    navigator.clipboard.writeText(getSpecText());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOrderViaLine = () => {
    sound.playVictory();
    triggerRetroConfetti();
    setLineModalOpen(true);
  };

  const tier = getTierBadge();

  return (
    <section id="rig-builder" className="py-16 md:py-24 bg-[#090c13] relative border-t-4 border-[#1e293b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1e293b] border border-[#ff0077] text-[#ff0077] text-xs font-press-start">
            <span>[ MISSION 04: RIG CRAFT FORGE ]</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-press-start text-white tracking-wide">
            RETRO <span className="text-[#00f0ff]">PC PART</span> PICKER
          </h2>
          <p className="text-sm sm:text-base text-[#94a3b8] font-thai max-w-2xl mx-auto">
            จัดสเปกคอมในแบบของคุณ พร้อมอนิเมชันประกอบจำลองและระบบคำนวณ DPS แบบเรียลไทม์
          </p>

          {/* Quick Presets Bar with Stagger Animation */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs font-press-start text-[#64748b] mr-1">QUICK LOOT:</span>
            <button
              onClick={() => applyPreset("budget")}
              className="px-3 py-1 text-[10px] font-press-start pixel-btn-dark hover:text-[#39ff14] border border-[#334155] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              👾 BUDGET ESPORTS (฿27K)
            </button>
            <button
              onClick={() => applyPreset("streamer")}
              className="px-3 py-1 text-[10px] font-press-start pixel-btn-dark hover:text-[#00f0ff] border border-[#334155] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              🚀 STREAMER CHAMPION (฿48K)
            </button>
            <button
              onClick={() => applyPreset("overkill")}
              className="px-3 py-1 text-[10px] font-press-start pixel-btn-dark hover:text-[#ff0077] border border-[#334155] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              🏆 CYBER GOD OVERKILL (฿120K)
            </button>
          </div>
        </motion.div>

        {/* Builder Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 Cols): Component Selectors */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* CPU Selection */}
            <div className="retro-window p-4 bg-[#0d131f] hover:border-[#38bdf8] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-press-start text-[#38bdf8] flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#38bdf8]" />
                  <span>PROCESSOR (CPU)</span>
                </label>
                <span className="text-xs font-thai text-[#facc15]">
                  +฿{selectedCpu.price.toLocaleString()}
                </span>
              </div>
              <select
                value={selectedCpu.id}
                onChange={(e) => {
                  const opt = CPU_OPTIONS.find((c) => c.id === e.target.value);
                  if (opt) {
                    triggerSnap();
                    setSelectedCpu(opt);
                  }
                }}
                className="w-full bg-[#05080e] text-[#cbd5e1] border-2 border-[#1e293b] p-2.5 text-sm font-thai focus:border-[#38bdf8] focus:outline-none"
              >
                {CPU_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — ฿{c.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* GPU Selection */}
            <div className="retro-window p-4 bg-[#0d131f] hover:border-[#ff0077] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-press-start text-[#ff0077] flex items-center gap-2">
                  <PixelGpu size={16} />
                  <span>GRAPHICS CARD (GPU)</span>
                </label>
                <span className="text-xs font-thai text-[#facc15]">
                  +฿{selectedGpu.price.toLocaleString()}
                </span>
              </div>
              <select
                value={selectedGpu.id}
                onChange={(e) => {
                  const opt = GPU_OPTIONS.find((c) => c.id === e.target.value);
                  if (opt) {
                    triggerSnap();
                    setSelectedGpu(opt);
                  }
                }}
                className="w-full bg-[#05080e] text-[#cbd5e1] border-2 border-[#1e293b] p-2.5 text-sm font-thai focus:border-[#ff0077] focus:outline-none"
              >
                {GPU_OPTIONS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} — ฿{g.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* RAM Selection */}
            <div className="retro-window p-4 bg-[#0d131f] hover:border-[#39ff14] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-press-start text-[#39ff14] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#39ff14]" />
                  <span>MEMORY (RAM)</span>
                </label>
                <span className="text-xs font-thai text-[#facc15]">
                  +฿{selectedRam.price.toLocaleString()}
                </span>
              </div>
              <select
                value={selectedRam.id}
                onChange={(e) => {
                  const opt = RAM_OPTIONS.find((c) => c.id === e.target.value);
                  if (opt) {
                    triggerSnap();
                    setSelectedRam(opt);
                  }
                }}
                className="w-full bg-[#05080e] text-[#cbd5e1] border-2 border-[#1e293b] p-2.5 text-sm font-thai focus:border-[#39ff14] focus:outline-none"
              >
                {RAM_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — ฿{r.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Storage Selection */}
            <div className="retro-window p-4 bg-[#0d131f] hover:border-[#facc15] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-press-start text-[#facc15] flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#facc15]" />
                  <span>STORAGE (M.2 NVMe SSD)</span>
                </label>
                <span className="text-xs font-thai text-[#facc15]">
                  +฿{selectedSsd.price.toLocaleString()}
                </span>
              </div>
              <select
                value={selectedSsd.id}
                onChange={(e) => {
                  const opt = SSD_OPTIONS.find((c) => c.id === e.target.value);
                  if (opt) {
                    triggerSnap();
                    setSelectedSsd(opt);
                  }
                }}
                className="w-full bg-[#05080e] text-[#cbd5e1] border-2 border-[#1e293b] p-2.5 text-sm font-thai focus:border-[#facc15] focus:outline-none"
              >
                {SSD_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — ฿{s.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Cooling & PSU Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cooler */}
              <div className="retro-window p-4 bg-[#0d131f]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-press-start text-[#38bdf8] flex items-center gap-1.5">
                    <Fan className="w-3.5 h-3.5" />
                    <span>COOLER</span>
                  </label>
                </div>
                <select
                  value={selectedCooler.id}
                  onChange={(e) => {
                    const opt = COOLER_OPTIONS.find((c) => c.id === e.target.value);
                    if (opt) {
                      triggerSnap();
                      setSelectedCooler(opt);
                    }
                  }}
                  className="w-full bg-[#05080e] text-[#cbd5e1] border border-[#1e293b] p-2 text-xs font-thai focus:border-[#38bdf8] focus:outline-none"
                >
                  {COOLER_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (+฿{c.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* PSU */}
              <div className="retro-window p-4 bg-[#0d131f]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-press-start text-[#eab308] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>POWER SUPPLY</span>
                  </label>
                </div>
                <select
                  value={selectedPsu.id}
                  onChange={(e) => {
                    const opt = PSU_OPTIONS.find((c) => c.id === e.target.value);
                    if (opt) {
                      triggerSnap();
                      setSelectedPsu(opt);
                    }
                  }}
                  className="w-full bg-[#05080e] text-[#cbd5e1] border border-[#1e293b] p-2 text-xs font-thai focus:border-[#eab308] focus:outline-none"
                >
                  {PSU_OPTIONS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (+฿{p.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Right Column (5 Cols): Real-time 8-Bit Rig Preview & Summary Card with 3D Tilt */}
          <div className="lg:col-span-5 space-y-5 sticky top-24">
            
            {/* Visual 8-Bit Rig Schematic Box with 3D Tilt */}
            <TiltCard maxTilt={8}>
              <div className="retro-window p-1 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                <div className="retro-window-header px-3 py-1.5 flex items-center justify-between text-xs font-press-start text-white">
                  <span>RIG_SCHEMATIC_VIEW.SYS</span>
                  <span className="text-[#39ff14] animate-retro-blink">● LIVE</span>
                </div>

                <div className="bg-[#05070c] p-4 text-center border-2 border-black relative overflow-hidden">
                  {/* SVG 8-Bit PC Dynamic Drawing with Component Snapping Motion */}
                  <motion.div
                    key={partSnapKey}
                    initial={{ scale: 0.96, filter: "brightness(1.5)" }}
                    animate={{ scale: 1, filter: "brightness(1)" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-48 h-56 mx-auto relative bg-[#0a101d] border-4 border-[#334155] p-2 flex flex-col justify-between shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                  >
                    {/* Top Exhaust Fans */}
                    <div className="flex justify-between px-2">
                      <div className="w-8 h-2 bg-[#38bdf8] animate-pulse" />
                      <div className="w-8 h-2 bg-[#38bdf8] animate-pulse" />
                      <div className="w-8 h-2 bg-[#38bdf8] animate-pulse" />
                    </div>

                    {/* Motherboard & CPU Cooler Center */}
                    <div className="my-auto relative flex items-center justify-center">
                      <div className="w-36 h-28 bg-[#047857]/40 border border-[#047857] p-2 relative">
                        {/* CPU / Cooler Graphic with Spring Snapping */}
                        <motion.div
                          key={`cooler-${selectedCooler.id}`}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className="w-14 h-14 mx-auto rounded-none border-2 border-[#ff0077] flex items-center justify-center bg-[#090d16] shadow-[0_0_12px_rgba(255,0,119,0.5)]"
                        >
                          <div className="w-8 h-8 bg-[#00f0ff]/30 flex items-center justify-center text-[8px] font-press-start text-white">
                            ❄️
                          </div>
                        </motion.div>

                        {/* RAM Sticks with Glowing Animation */}
                        <motion.div
                          key={`ram-${selectedRam.id}`}
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.25 }}
                          className="absolute right-3 top-4 flex gap-1"
                        >
                          <div className="w-1.5 h-12 bg-[#39ff14] animate-pulse shadow-[0_0_6px_#39ff14]" />
                          <div className="w-1.5 h-12 bg-[#39ff14] animate-pulse shadow-[0_0_6px_#39ff14]" />
                        </motion.div>
                      </div>
                    </div>

                    {/* GPU Graphic with Snapping Motion */}
                    <motion.div
                      key={`gpu-${selectedGpu.id}`}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="w-full bg-[#1e293b] border-2 border-[#38bdf8] py-1 px-2 flex items-center justify-around shadow-[0_0_12px_rgba(56,189,248,0.6)]"
                    >
                      <div className="w-6 h-6 border border-[#39ff14] rounded-full flex items-center justify-center animate-spin">
                        <span className="text-[7px]">✦</span>
                      </div>
                      <span className="text-[8px] font-press-start text-[#38bdf8]">
                        {selectedGpu.id.includes("4090") ? "4090 BOSS" : "RTX GPU"}
                      </span>
                      <div className="w-6 h-6 border border-[#39ff14] rounded-full flex items-center justify-center animate-spin">
                        <span className="text-[7px]">✦</span>
                      </div>
                    </motion.div>

                    {/* PSU Basement */}
                    <div className="bg-[#020617] border-t-2 border-[#334155] p-1 flex justify-between items-center text-[8px] font-press-start text-[#94a3b8]">
                      <span>PSU SHROUD</span>
                      <span className="text-[#facc15]">{totalWattage}W / {selectedPsu.name.split(" ")[0]}</span>
                    </div>
                  </motion.div>

                  {/* Live Stats Indicators */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-left font-press-start text-xs">
                    <div className="bg-[#0b1220] p-2 border border-[#1e293b]">
                      <div className="text-[10px] text-[#94a3b8]">POWER LEVEL</div>
                      <motion.div
                        key={totalPowerScore}
                        initial={{ scale: 1.2, color: "#ffffff" }}
                        animate={{ scale: 1, color: "#39ff14" }}
                        className="text-sm mt-0.5"
                      >
                        {totalPowerScore.toLocaleString()} PTS
                      </motion.div>
                    </div>
                    <div className="bg-[#0b1220] p-2 border border-[#1e293b]">
                      <div className="text-[10px] text-[#94a3b8]">EST. LOAD</div>
                      <motion.div
                        key={totalWattage}
                        initial={{ scale: 1.2, color: "#ffffff" }}
                        animate={{ scale: 1, color: "#facc15" }}
                        className="text-sm mt-0.5"
                      >
                        ~{totalWattage} WATTS
                      </motion.div>
                    </div>
                  </div>

                  <div className="mt-2 text-center">
                    <span className={`inline-block px-3 py-1 text-[11px] font-press-start border ${tier.color}`}>
                      TIER: {tier.label}
                    </span>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Summary Price & Order Card */}
            <div className="retro-window p-5 bg-[#0f172a] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#1e293b] pb-3">
                <span className="text-xs font-press-start text-[#cbd5e1]">TOTAL ESTIMATED:</span>
                <motion.span
                  key={totalPrice}
                  initial={{ scale: 1.15, color: "#00f0ff" }}
                  animate={{ scale: 1, color: "#39ff14" }}
                  transition={{ duration: 0.3 }}
                  className="text-xl sm:text-2xl font-press-start drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]"
                >
                  ฿{totalPrice.toLocaleString()}
                </motion.span>
              </div>

              <div className="text-xs font-thai text-[#94a3b8] space-y-1">
                <div>✓ รวมค่าเคส กระจกนิรภัย พัดลม ARGB และค่าประกอบระดับโปร</div>
                <div>✓ ฟรี! เดินสายไฟด้านหลังเนี๊ยบ + อัปเดต BIOS ล่าสุด + เทสต์ 24H</div>
                <div>✓ ประกันอุปกรณ์ศูนย์ไทยแท้ 3 ปีเต็ม ทุกชิ้น</div>
              </div>

              {/* Action Buttons with Particle Confetti */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={copySpec}
                  className="w-full py-2.5 font-press-start text-xs pixel-btn-amber flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                  <span>{copied ? "[ SPEC COPIED! ]" : "[ COPY SPEC / SHARE ]"}</span>
                </button>

                <button
                  onClick={handleOrderViaLine}
                  className="w-full py-3.5 bg-[#06c755] hover:bg-[#05b34c] text-black font-press-start text-xs flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0_#fff] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>[ 📲 สั่งประกอบสเปกนี้ผ่าน LINE OA ]</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* LINE OA Modal */}
      <LineModal
        isOpen={lineModalOpen}
        onClose={() => setLineModalOpen(false)}
        prefilledMessage={getSpecText()}
        title="ORDER RIG VIA LINE OA"
      />
    </section>
  );
}
