"use client";

import React, { useState } from "react";
import { sound } from "@/lib/sound";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircleQuestion, ChevronDown } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {q:"ร้านให้บริการอะไรบ้าง?",a:"ติดตั้ง Windows และโปรแกรม อัปเกรดอุปกรณ์ ทำความสะอาด ดูแลเครื่อง และรีเซ็ตรหัสผ่าน Windows สำหรับ Local Account ร้านไม่ได้ให้บริการซ่อมวงจรหรือซ่อมชิ้นส่วนที่เสีย"},
    {q:"สอบถามราคาและนัดหมายอย่างไร?",a:"ส่งรายละเอียดเครื่องและบริการที่ต้องการผ่าน LINE OA ร้านจะประเมินความเหมาะสมและแจ้งราคาให้ยืนยันก่อนเริ่มงาน กรุณานัดหมายก่อนนำเครื่องมาที่ร้าน"},
    {q:"นำอุปกรณ์ที่ซื้อมาเองมาติดตั้งได้ไหม?",a:"ได้ครับ ส่งรุ่นเครื่องและรุ่นอุปกรณ์มาทาง LINE ก่อน เพื่อให้ร้านตรวจความเข้ากันได้และประเมินค่าบริการ"},
    {q:"ต้องเตรียมอะไรบ้างก่อนลง Windows หรือโปรแกรม?",a:"สำรองข้อมูลสำคัญและแจ้งข้อมูลที่ต้องการเก็บก่อนลงระบบใหม่ สำหรับโปรแกรมที่มีลิขสิทธิ์ ใช้สิทธิ์ของลูกค้าหรือเลือกโปรแกรมฟรี ไม่ต้องส่งรหัสผ่านหรือ Recovery Key ในฟอร์ม"},
    {q:"รีเซ็ตรหัสผ่าน Windows แบบไหนได้บ้าง?",a:"ให้บริการบัญชีภายในเครื่อง (Local Account) สำหรับเจ้าของเครื่องหรือผู้ได้รับอนุญาต โดยตรวจสอบสิทธิ์และผลกระทบต่อข้อมูลก่อน บัญชี Microsoft และเครื่องที่ใช้ BitLocker มีขั้นตอนกู้คืนต่างกัน กรุณาสอบถามก่อน"},
  ];

  const toggleFaq = (i: number) => {
    sound.playSelect();
    setOpenIdx(openIdx === i ? null : i);
  };

  return (
    <section className="py-16 md:py-24 bg-[#090b10] relative border-t-4 border-[#1e293b]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1e293b] border border-[#38bdf8] text-[#38bdf8] text-xs font-press-start">
            <MessageCircleQuestion className="w-3.5 h-3.5" />
            <span>[ NPC HELPDESK & SECRETS ]</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-press-start text-white tracking-wide">
            คำถามที่พบบ่อย
          </h2>
          <p className="text-sm sm:text-base text-[#94a3b8] font-thai max-w-xl mx-auto">
            ข้อมูลก่อนนำเครื่องมารับบริการกับ 8-Bit
          </p>
        </motion.div>

        {/* Accordion with Smooth Height Spring Motion */}
        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className={`retro-window transition-all ${
                  isOpen ? "border-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.2)]" : "border-[#334155]"
                }`}
              >
                <button
                  aria-expanded={isOpen} aria-controls={`faq-answer-${i}`} onClick={() => toggleFaq(i)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 bg-[#0d1424] hover:bg-[#131d33] transition-colors cursor-pointer"
                >
                  <span className="font-bold text-white font-thai text-sm sm:text-base flex items-center gap-2.5">
                    <span className="text-[#39ff14] font-press-start text-xs">Q{i + 1}:</span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#38bdf8] shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#39ff14]" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${i}`} initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 sm:p-5 bg-[#070b13] border-t border-[#1e293b] text-sm sm:text-base font-thai text-[#cbd5e1] leading-relaxed">
                        <div className="flex items-start gap-2">
                          <span className="text-[#facc15] font-press-start text-xs mt-1">A:</span>
                          <div>{faq.a}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
