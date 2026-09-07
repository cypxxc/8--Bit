"use client";

import React, { useState } from "react";
import { sound } from "@/lib/sound";
import { PixelCoin } from "@/components/PixelIcons";
import TiltCard from "@/components/motion/TiltCard";
import { motion } from "motion/react";
import { Check } from "lucide-react";

interface PriceItem {
  id: string;
  name: string;
  category: "HARDWARE" | "SOFTWARE" | "NETWORK" | "CUSTOM PC";
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  rarityColor: string;
  price: string;
  time: string;
  warranty: string;
  included: string[];
}

export default function PriceMatrix() {
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const priceItems: PriceItem[] = [
    {
      id: "p1",
      name: "ทำความสะอาด & เปลี่ยนซิลิโคนเทพ (Deep Thermal Clean)",
      category: "HARDWARE",
      rarity: "COMMON",
      rarityColor: "text-[#94a3b8] border-[#64748b] bg-[#1e293b]/50",
      price: "฿450",
      time: "45 นาที",
      warranty: "30 วัน",
      included: [
        "เป่าฝุ่นทุกซอกมุม + เช็ดคราบ",
        "ทาซิลิโคนเกรดสูง (ลด 5-15°C)",
        "เทสต์ความร้อน CPU/GPU Full Load",
      ],
    },
    {
      id: "p2",
      name: "ลง Windows / Linux คลีนแท้ + ไดรเวอร์ตรงรุ่น",
      category: "SOFTWARE",
      rarity: "COMMON",
      rarityColor: "text-[#94a3b8] border-[#64748b] bg-[#1e293b]/50",
      price: "฿350",
      time: "1 - 2 ชม.",
      warranty: "30 วัน",
      included: [
        "ลงระบบใหม่ 0% Bloatware",
        "อัปเดตไดรเวอร์ล่าสุด",
        "โปรแกรมพื้นฐานพร้อมใช้งานครบ",
      ],
    },
    {
      id: "p3",
      name: "ซ่อมภาคจ่ายไฟเมนบอร์ด / ซ่อมบอร์ดช็อต",
      category: "HARDWARE",
      rarity: "RARE",
      rarityColor: "text-[#38bdf8] border-[#0284c7] bg-[#0c4a6e]/40",
      price: "฿1,200 - ฿2,500",
      time: "1 - 3 วัน",
      warranty: "90 วัน",
      included: [
        "ตรวจวัดจุดช็อตด้วยมิเตอร์แล็บ",
        "เปลี่ยน IC / MOSFET / Capacitor แท้",
        "เทสต์ไฟนิ่งก่อนประกอบเครื่อง",
      ],
    },
    {
      id: "p4",
      name: "กู้ข้อมูลไดรฟ์เสีย / Flash Drive / โคลน Windows ย้ายดิสก์",
      category: "SOFTWARE",
      rarity: "RARE",
      rarityColor: "text-[#38bdf8] border-[#0284c7] bg-[#0c4a6e]/40",
      price: "฿800 - ฿2,000",
      time: "2 - 6 ชม.",
      warranty: "การันตีไฟล์",
      included: [
        "กู้คืนรูปภาพ งาน และเอกสารสำคัญ",
        "โคลน Windows แท้เดิมย้ายไป M.2 ใหม่ไม่ต้องลงใหม่",
        "รักษาความลับข้อมูลลูกค้า 100%",
      ],
    },
    {
      id: "p5",
      name: "จัดสายไฟเทพ + ปรับแต่ง Airflow + Overclock XMP/PBO",
      category: "CUSTOM PC",
      rarity: "EPIC",
      rarityColor: "text-[#c084fc] border-[#9333ea] bg-[#581c87]/40",
      price: "฿890",
      time: "2 - 3 ชม.",
      warranty: "ตลอดการใช้งาน",
      included: [
        "ร้อยสายไฟด้านหลังเนี๊ยบสวย",
        "จูนรอบพัดลมเงียบกริบ",
        "เซ็ตอัปโปรไฟล์ RAM บูสต์ FPS พุ่ง",
      ],
    },
    {
      id: "p6",
      name: "ประกอบ Custom Rig Full Tower + ทดสอบเบิร์น 24 ชั่วโมง",
      category: "CUSTOM PC",
      rarity: "LEGENDARY",
      rarityColor: "text-[#facc15] border-[#ca8a04] bg-[#713f12]/40",
      price: "฿1,500 (ฟรีเมื่อซื้ออะไหล่)",
      time: "1 - 2 วัน",
      warranty: "3 ปีเต็ม",
      included: [
        "ประกอบทุกจุดด้วยความประณีต",
        "ทดสอบ Cinebench & 3DMark ผ่านฉลุย",
        "จัดส่งถึงบ้านพร้อมสอนใช้งาน",
      ],
    },
  ];

  const filteredItems =
    activeTab === "ALL"
      ? priceItems
      : priceItems.filter((item) => item.category === activeTab);

  return (
    <section id="pricing" className="py-16 md:py-24 bg-[#090b10] relative border-t-4 border-[#1e293b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1e293b] border border-[#facc15] text-[#facc15] text-xs font-press-start">
            <PixelCoin size={14} />
            <span>[ LOOT & UPGRADE RATES ]</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-press-start text-white tracking-wide">
            PRICE MATRIX & <span className="text-[#facc15]">TARIFFS</span>
          </h2>
          <p className="text-sm sm:text-base text-[#94a3b8] font-thai max-w-xl mx-auto">
            ราคาโปร่งใส ชัดเจนทุกรายการ ไม่มีค่าใช้จ่ายแอบแฝง แจ้งประเมินก่อนเริ่มซ่อมเสมอ
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {["ALL", "HARDWARE", "SOFTWARE", "NETWORK", "CUSTOM PC"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  sound.playSelect();
                  setActiveTab(tab);
                }}
                className={`px-3 py-1.5 text-[10px] sm:text-xs font-press-start transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                  activeTab === tab
                    ? "bg-[#f59e0b] text-black border-2 border-white shadow-[2px_2px_0_#000]"
                    : "bg-[#0f172a] text-[#94a3b8] border border-[#334155] hover:border-[#facc15]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Pricing Cards Grid with Motion & Tilt */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
            >
              <TiltCard maxTilt={6} className="h-full">
                <div
                  className="retro-window p-5 flex flex-col justify-between h-full hover:border-[#facc15] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                >
                  <div>
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3 border-b border-[#1e293b] pb-2">
                      <span className={`px-2 py-0.5 text-[9px] font-press-start border ${item.rarityColor}`}>
                        {item.rarity}
                      </span>
                      <span className="text-[10px] font-press-start text-[#64748b]">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-thai text-white min-h-[48px] leading-snug">
                      {item.name}
                    </h3>

                    {/* Price Display */}
                    <div className="my-4 p-3 bg-[#05080e] border border-[#1e293b] text-center">
                      <div className="text-[10px] font-press-start text-[#94a3b8]">COST / TARIFF</div>
                      <div className="text-xl font-press-start text-[#39ff14] mt-1">
                        {item.price}
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-thai text-[#cbd5e1] mb-4">
                      <div className="bg-[#0c1220] p-2 border border-[#1e293b]">
                        <span className="text-[#94a3b8] block text-[10px]">ระยะเวลา:</span>
                        <span className="font-semibold text-white">{item.time}</span>
                      </div>
                      <div className="bg-[#0c1220] p-2 border border-[#1e293b]">
                        <span className="text-[#94a3b8] block text-[10px]">ประกันงานซ่อม:</span>
                        <span className="font-semibold text-[#38bdf8]">{item.warranty}</span>
                      </div>
                    </div>

                    {/* Checklist */}
                    <div className="space-y-1.5 mb-4">
                      {item.included.map((inc, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-thai text-[#cbd5e1]">
                          <Check className="w-3.5 h-3.5 text-[#39ff14] shrink-0" />
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Action */}
                  <a
                    href="#ticket-log"
                    onClick={() => sound.playPowerUp()}
                    className="w-full py-2.5 font-press-start text-[11px] pixel-btn-dark hover:text-[#facc15] text-center block cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                  >
                    [ BOOK THIS SERVICE ]
                  </a>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
