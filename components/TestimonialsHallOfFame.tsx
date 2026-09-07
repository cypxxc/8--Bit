"use client";

import React from "react";

import { motion } from "motion/react";
import { Trophy } from "lucide-react";

interface Review {
  rank: string;
  name: string;
  score: string;
  rigType: string;
  comment: string;
  date: string;
}

export default function TestimonialsHallOfFame() {
  const reviews: Review[] = [
    {rank:"01",name:"สอบถามและประเมิน",score:"",rigType:"CONSULT",comment:"แจ้งรุ่นเครื่อง ลักษณะการใช้งาน และบริการที่ต้องการผ่าน LINE OA เพื่อประเมินความเหมาะสมและราคา",date:"ก่อนนำเครื่องมา"},
    {rank:"02",name:"ยืนยันรายละเอียดและรับบริการ",score:"",rigType:"SERVICE",comment:"นัดหมายกับร้าน ยืนยันรายการ ราคา และข้อมูลที่ต้องการเก็บก่อนเริ่มดำเนินการ",date:"เมื่อยืนยันงาน"},
    {rank:"03",name:"ตรวจสอบและรับเครื่อง",score:"",rigType:"READY",comment:"ร้านตรวจสอบการทำงานตามรายการที่ตกลง และติดต่อเพื่อนัดรับเครื่องพร้อมคำแนะนำการใช้งาน",date:"เมื่อดำเนินการเสร็จ"},
  ];

  return (
    <section id="hall-of-fame" className="py-16 md:py-24 bg-[#06080d] relative border-t-4 border-[#1e293b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1e293b] border border-[#facc15] text-[#facc15] text-xs font-press-start">
            <Trophy className="w-3.5 h-3.5 text-[#facc15]" />
            <span>[ HOW IT WORKS ]</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-press-start text-white tracking-wide">
            ขั้นตอนรับบริการ
          </h2>
          <p className="text-sm sm:text-base text-[#94a3b8] font-thai max-w-xl mx-auto">
            เริ่มจากการพูดคุย ประเมินราคา และยืนยันรายละเอียดร่วมกัน
          </p>
        </motion.div>

        {/* High Score Table Arcade Style with Motion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="retro-window p-1 max-w-4xl mx-auto shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
        >
          <div className="retro-window-header px-4 py-2 flex items-center justify-between text-xs font-press-start text-white">
            <span>SERVICE_STEPS</span>
            <span className="text-[#facc15] animate-pulse">8-BIT</span>
          </div>

          <div className="bg-[#090e18] p-4 sm:p-6 divide-y-2 divide-[#1e293b]">
            {reviews.map((r, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.4 }}
                className="py-5 first:pt-2 last:pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                {/* Rank & Name */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-press-start border ${
                        idx === 0
                          ? "bg-[#854d0e] text-[#fef08a] border-[#fde047]"
                          : idx === 1
                          ? "bg-[#334155] text-white border-[#94a3b8]"
                          : "bg-[#7c2d12] text-[#fed7aa] border-[#fb923c]"
                      }`}
                    >
                      {r.rank}
                    </span>
                    <span className="font-bold text-white font-thai text-base group-hover:text-[#39ff14] transition-colors">
                      {r.name}
                    </span>
                  </div>

                  <div className="text-xs font-press-start text-[#38bdf8]">
                    {r.rigType}
                  </div>

                  <p className="text-xs sm:text-sm font-thai text-[#cbd5e1] leading-relaxed pt-1 max-w-xl">
                    {r.comment}
                  </p>
                </div>

                <div className="text-xs font-thai text-[#38bdf8] shrink-0">{r.date}</div>

              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
