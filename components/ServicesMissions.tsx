"use client";

import React, { useState } from "react";
import { useCatalog, CatalogStatus } from "./ServiceCatalog";
import { createLineShareUrl } from "@/lib/config";
import PublicDialog from "./PublicDialog";
import { sound } from "@/lib/sound";
import {
  PixelScrewdriver,
  PixelFloppy,
  PixelNetwork,
  PixelRig,
} from "@/components/PixelIcons";
import TiltCard from "@/components/motion/TiltCard";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowRight, X, Sparkles, Clock, AlertTriangle } from "lucide-react";

interface MissionDetail {
  id: string;
  rank: string;
  badgeColor: string;
  titleEn: string;
  titleTh: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  borderColor: string;
  turnaround: string;
  warranty: string;
  startingPrice: string;
  symptoms: string[];
  features: string[];
  descriptionTh: string;
}

export default function ServicesMissions() {
  const [selectedMission, setSelectedMission] = useState<MissionDetail | null>(null);

  const { groups } = useCatalog();
  const icons = [<PixelFloppy key="sw" size={36}/>, <PixelRig key="up" size={36}/>, <PixelScrewdriver key="care" size={36}/>, <PixelNetwork key="password" size={36}/>];
  const missions: MissionDetail[] = groups.map((group, index) => ({
    id: group.id, rank: group.shortLabel, badgeColor: "bg-[#0f172a] text-[#39ff14] border-[#38bdf8]",
    titleEn: group.shortLabel, titleTh: group.label, subtitle: "8-Bit Computer Services", icon: icons[index],
    accentColor: "#39ff14", borderColor: "border-[#38bdf8]", turnaround: "ประเมินตามงาน", warranty: "สอบถามเงื่อนไข", startingPrice: "สอบถามราคา",
    symptoms: group.services, features: group.services, descriptionTh: group.description,
  }));

  const handleOpenMission = (mission: MissionDetail) => {
    sound.playSelect();
    setSelectedMission(mission);
  };

  const handleCloseModal = () => {
    sound.playClick();
    setSelectedMission(null);
  };

  return (
    <section id="missions" className="py-16 md:py-24 bg-[#070a0f] relative border-t-4 border-[#1e293b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1e293b] border border-[#38bdf8] text-[#39ff14] text-xs font-press-start">
            <span>[ SELECT MISSION TYPE ]</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-press-start text-white tracking-wide">
            เลือกบริการของร้าน
          </h2>
          <p className="text-sm sm:text-base text-[#94a3b8] font-thai max-w-2xl mx-auto">
            Windows, Upgrade และ Computer Care สอบถามรายละเอียดและประเมินราคาผ่าน LINE OA
          </p>
        </motion.div>

        <CatalogStatus />
        {/* Service cards with Motion & Tilt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {missions.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <TiltCard maxTilt={6} className="h-full">
                <div
                  className="retro-window p-4 sm:p-6 flex flex-col justify-between h-full hover:border-[#38bdf8] transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                >
                  <div>
                    {/* Card Top Banner */}
                    <div className="flex items-center justify-between gap-2 border-b-2 border-[#1e293b] pb-3 mb-4">
                      <span className={`px-2 py-0.5 text-[10px] font-press-start border ${m.badgeColor}`}>
                        {m.rank}
                      </span>
                      <div className="flex items-center gap-2 text-xs font-press-start text-[#64748b]">
                        <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                        <span>{m.turnaround}</span>
                      </div>
                    </div>

                    {/* Title & Icon Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-2.5 bg-[#090d16] border-2 border-[#1e293b] group-hover:border-[#38bdf8] group-hover:scale-105 transition-all shrink-0">
                        {m.icon}
                      </div>
                      <div>
                        <div className="text-[11px] font-press-start text-[#38bdf8] tracking-wider">
                          {m.titleEn}
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold font-thai text-white mt-1 group-hover:text-[#39ff14] transition-colors">
                          {m.titleTh}
                        </h3>
                        <p className="text-xs text-[#94a3b8] font-thai mt-0.5">
                          {m.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Symptoms Preview */}
                    <div className="bg-[#05080e] p-3 border border-[#1e293b] mb-4 space-y-1.5">
                      <div className="text-[10px] font-press-start text-[#facc15] flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-[#facc15]" />
                        <span>บริการในหมวดนี้:</span>
                      </div>
                      <ul className="text-xs text-[#cbd5e1] font-thai space-y-1">
                        {m.symptoms.slice(0, 2).map((s, sIdx) => (
                          <li key={sIdx} className="flex items-center gap-1.5">
                            <span className="text-[#ef4444] font-bold">&gt;</span>
                            <span className="truncate">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom Card Footer */}
                  <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between gap-2">
                    <div className="text-xs font-thai text-[#94a3b8]">
                      <a className="text-[#39ff14] underline" href={createLineShareUrl(`สนใจ${m.titleTh} ขอสอบถามรายละเอียดและประเมินราคาครับ`)} target="_blank" rel="noreferrer">สอบถามทาง LINE</a>
                    </div>
                    <button
                      onClick={() => handleOpenMission(m)}
                      className="px-3 py-1.5 text-[11px] font-press-start pixel-btn-dark hover:text-[#39ff14] flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                    >
                      <span>ดูรายละเอียด</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Interactive Modal: Mission Detailed Briefing with Motion */}
      <AnimatePresence>
        {selectedMission && (
          <PublicDialog open label={selectedMission.titleTh} onClose={handleCloseModal}>
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="w-full max-w-2xl retro-window max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="retro-window-header px-4 py-2.5 flex items-center justify-between text-white font-press-start text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#22c55e] inline-block animate-pulse" />
                  <span>MISSION_BRIEFING.DAT</span>
                </span>
                <button
                  aria-label="ปิดรายละเอียด" onClick={handleCloseModal}
                  className="text-white hover:text-[#ef4444] p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-7 space-y-5 bg-[#090e17]">
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#05080e] border-2 border-[#38bdf8] shrink-0">
                    {selectedMission.icon}
                  </div>
                  <div>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-press-start border mb-1 ${selectedMission.badgeColor}`}>
                      {selectedMission.rank}
                    </span>
                    <div className="text-xs font-press-start text-[#38bdf8]">
                      {selectedMission.titleEn}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-thai text-white mt-1">
                      {selectedMission.titleTh}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-[#cbd5e1] font-thai leading-relaxed border-l-4 border-[#39ff14] pl-3 py-1 bg-[#05080e]/60">
                  {selectedMission.descriptionTh}
                </p>

                {/* Spec Grid */}
                <div className="grid grid-cols-3 gap-3 bg-[#05080e] p-3 border border-[#1e293b] text-center font-press-start text-xs">
                  <div>
                    <div className="text-[10px] text-[#94a3b8]">ระยะเวลา</div>
                    <div className="text-[#facc15] mt-1 font-thai font-semibold">{selectedMission.turnaround}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#94a3b8]">เงื่อนไข</div>
                    <div className="text-[#38bdf8] mt-1 font-thai font-semibold">{selectedMission.warranty}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#94a3b8]">ค่าบริการ</div>
                    <div className="text-[#39ff14] mt-1">{selectedMission.startingPrice}</div>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2">
                  <div className="text-xs font-press-start text-[#39ff14] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>บริการในหมวดนี้</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 font-thai text-sm text-[#e2e8f0]">
                    {selectedMission.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 bg-[#0d1424] p-2.5 border border-[#1e293b]">
                        <Check className="w-4 h-4 text-[#39ff14] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action in Modal */}
                <div className="pt-4 border-t-2 border-[#1e293b] flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="w-full sm:w-auto px-4 py-2 font-press-start text-xs pixel-btn-dark cursor-pointer"
                  >
                    [ CLOSE ]
                  </button>
                  <a
                    href={createLineShareUrl(`สนใจ${selectedMission.titleTh} ขอสอบถามรายละเอียดและประเมินราคาครับ`)} target="_blank" rel="noreferrer"
                    onClick={() => {
                      sound.playPowerUp();
                      handleCloseModal();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 font-press-start text-xs pixel-btn-green text-center cursor-pointer"
                  >
                    สอบถามบริการและราคาทาง LINE
                  </a>
                </div>

              </div>
            </motion.div>
          </PublicDialog>
        )}
      </AnimatePresence>

    </section>
  );
}
