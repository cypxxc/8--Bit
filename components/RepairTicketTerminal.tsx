"use client";

import React, { useState, useRef, useSyncExternalStore } from "react";
import { sound } from "@/lib/sound";
import { SHOP_CONFIG } from "@/lib/config";
import LineModal from "./LineModal";
import { triggerRetroConfetti } from "@/components/motion/ConfettiTrigger";
import { useCatalog, CatalogStatus } from "./ServiceCatalog";
import { motion } from "motion/react";
import {
  Terminal,
  Monitor,
  Laptop,
  CheckCircle2,
  Printer,
  RefreshCw,
  Send,
  MessageCircle,
  Loader2,
} from "lucide-react";

interface TicketData {
  ticketId: string;
  deviceType: string;
  category: string;
  symptoms: string[];
  description: string;
  customerName: string;
  phoneNumber: string;
  lineId: string;
  urgency: string;
  createdAt: string;
}

const subscribe = () => () => {};
export default function RepairTicketTerminal() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const {services, groups} = useCatalog();
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState("");
  const pending = useRef(false);
  const retry = useRef<{fingerprint:string;key:string} | null>(null);
  const [deviceType, setDeviceType] = useState("PC");
  const [category, setCategory] = useState("software");
  const symptoms = services.filter(s => serviceIds.includes(s.id)).map(s => s.name);
  const [description, setDescription] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [lineId, setLineId] = useState("");
  const urgency = "NORMAL";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<TicketData | null>(null);
  const [lineModalOpen, setLineModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending.current) return;
    setSubmitError("");
    if (!customerName.trim() || !phoneNumber.trim() || !serviceIds.length) {
      setSubmitError("กรุณากรอกชื่อ เบอร์โทรศัพท์ และเลือกบริการอย่างน้อย 1 รายการ"); return;
    }
    pending.current = true;
    setIsSubmitting(true);
    try {
      const input = {customerName:customerName.trim(), phoneNumber:phoneNumber.trim(), lineId:lineId.trim(), deviceType, description, serviceIds};
      const fingerprint = JSON.stringify(input);
      if (retry.current?.fingerprint !== fingerprint) retry.current = {fingerprint,key:crypto.randomUUID()};
      const res = await fetch("/api/ticket", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({...input,idempotencyKey:retry.current.key}),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!res.ok || !data.success || typeof data.ticketId !== "string" || typeof data.createdAt !== "string")
        throw Error(data.message || "บันทึกคำขอไม่สำเร็จ กรุณาลองใหม่");
      setSubmittedTicket({ticketId:data.ticketId,createdAt:new Date(data.createdAt).toLocaleString("th-TH"), deviceType,category:"บริการที่เลือก",symptoms,description,customerName:input.customerName,phoneNumber:input.phoneNumber,lineId:input.lineId,urgency});
      sound.playVictory(); triggerRetroConfetti();
    } catch (error) {
      setSubmitError(error instanceof Error && error.name === "Error" ? error.message : "ยังยืนยันการบันทึกไม่ได้ กรุณาลองส่งอีกครั้ง ระบบจะป้องกันคำขอซ้ำ");
    } finally { pending.current=false; setIsSubmitting(false); }
  };

  const resetTicket = () => {
    sound.playClick();
    setSubmittedTicket(null);
    retry.current=null; setServiceIds([]); setSubmitError("");
    setDescription("");
    setCustomerName("");
    setPhoneNumber("");
    setLineId("");
  };

  const getLineMessage = () => {
    if (!submittedTicket) return "";
    return `🕹️ [ขอรับบริการ 8-Bit Computer] 🕹️
-----------------------------------
🎫 เลขที่ตั๋ว: ${submittedTicket.ticketId}
👤 ผู้ติดต่อ: ${submittedTicket.customerName}
📞 โทร: ${submittedTicket.phoneNumber} ${submittedTicket.lineId ? `(LINE: ${submittedTicket.lineId})` : ""}
💻 อุปกรณ์: ${submittedTicket.deviceType}
🛠️ หมวดหมู่: ${submittedTicket.category}
⚠️ อาการ: ${submittedTicket.symptoms.join(", ")}
${submittedTicket.description ? `📝 รายละเอียดเพิ่มเติม: ${submittedTicket.description}\n` : ""}-----------------------------------
รบกวนช่างช่วยประเมินราคาและคิวให้หน่อยครับ 🙏`;
  };

  const openLineForward = () => {
    sound.playPowerUp();
    triggerRetroConfetti();
    setLineModalOpen(true);
  };

  return (
    <section id="ticket-log" className="py-16 md:py-24 bg-[#06080d] relative border-t-4 border-[#1e293b]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1e293b] border border-[#39ff14] text-[#39ff14] text-xs font-press-start">
            <span>[ TERMINAL PROTOCOL: JOB INTAKE ]</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-press-start text-white tracking-wide">
            ส่งคำขอรับบริการ
          </h2>
          <p className="text-sm sm:text-base text-[#94a3b8] font-thai max-w-xl mx-auto">
            เลือกบริการและฝากข้อมูลติดต่อ ร้านจะตรวจสอบและติดต่อกลับเพื่อยืนยันรายละเอียดและราคา
          </p>
        </motion.div>

        {/* Terminal Window */}
        <div className="retro-window p-1 shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
          {/* Header Bar */}
          <div className="retro-window-header px-4 py-2 flex flex-wrap gap-2 items-center justify-between text-xs font-press-start text-white">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#39ff14]" />
              <span>QUEST_TERMINAL_V1.98.EXE</span>
            </span>
            <span className="text-[10px] text-[#bfdbfe]">LINE OA: {SHOP_CONFIG.line.oaId}</span>
          </div>

          <div className="bg-[#090d16] p-5 sm:p-8 border-2 border-black">
            {!submittedTicket ? (
              <form onSubmit={handleSubmit} method="post" className="space-y-6"><fieldset disabled={isSubmitting} className="space-y-6 min-w-0">
                
                {/* 1. Device Selection */}
                <div>
                  <label className="block text-xs font-press-start text-[#38bdf8] mb-3">
                    STEP 1: SELECT DEVICE CLASS (ประเภทอุปกรณ์)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "PC", icon: <Monitor className="w-4 h-4" /> },
                      { label: "Notebook", icon: <Laptop className="w-4 h-4" /> },
                    ].map((d) => (
                      <button
                        key={d.label} aria-pressed={deviceType === d.label}
                        type="button"
                        onClick={() => {
                          sound.playSelect();
                          setDeviceType(d.label);
                        }}
                        className={`p-3 border-2 text-center text-xs font-press-start transition-all cursor-pointer flex flex-col items-center gap-2 hover:scale-105 active:scale-95 ${
                          deviceType === d.label
                            ? "bg-[#1e3a8a] border-[#60a5fa] text-white shadow-[2px_2px_0_#000]"
                            : "bg-[#05080e] border-[#1e293b] text-[#94a3b8] hover:border-[#38bdf8]"
                        }`}
                      >
                        {d.icon}
                        <span className="text-[10px]">{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <CatalogStatus />
                <div>
                  <p className="text-xs font-press-start text-[#facc15] mb-3">SELECT SERVICE • เลือกบริการ</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {groups.map(group => <button type="button" key={group.id} aria-pressed={category === group.id}
                      onClick={() => {sound.playSelect(); setCategory(group.id);}}
                      className={`p-3 border text-sm font-thai transition-transform hover:scale-[1.02] ${category === group.id ? "border-[#39ff14] text-white bg-[#064e3b]" : "border-[#334155] text-[#cbd5e1]"}`}>{group.label}</button>)}
                  </div>
                  <div className="grid gap-2 bg-[#05080e] p-3 border border-[#1e293b]">
                    {services.filter(service => service.group_id === category).map(service => <label key={service.id} className="flex gap-3 items-start p-2 text-sm font-thai cursor-pointer">
                      <input type="checkbox" checked={serviceIds.includes(service.id)} onChange={e => setServiceIds(ids => e.target.checked ? [...ids,service.id] : ids.filter(id => id !== service.id))} className="mt-1 accent-[#39ff14]" />
                      <span>{service.name}</span>
                    </label>)}
                  </div>
                  {symptoms.length > 0 && <p className="text-sm font-thai text-[#39ff14] mt-3">เลือกแล้ว {symptoms.length} รายการ: {symptoms.join(" • ")}</p>}
                </div>

                {/* 4. Description Notes */}
                <div>
                  <label className="block text-xs font-press-start text-[#cbd5e1] mb-1">
                    ADDITIONAL BRIEF / SPECS (รายละเอียดเพิ่มเติม):
                  </label>
                  <textarea
                    aria-label="รายละเอียดเพิ่มเติม" maxLength={2000} value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="เช่น เปิดเล่นเกมไป 15 นาทีแล้วดับ หรืออยากเพิ่ม M.2 1TB ยี่ห้อไหนดี..."
                    className="w-full bg-[#05080e] border-2 border-[#1e293b] p-3 text-xs sm:text-sm font-thai text-white focus:border-[#39ff14] focus:outline-none"
                  />
                </div>

                {/* 5. Hero Contact Info */}
                <div className="border-t-2 border-[#1e293b] pt-4 space-y-3">
                  <label className="block text-xs font-press-start text-[#ff0077]">
                    CONTACT • ข้อมูลติดต่อ
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="block text-[11px] font-thai text-[#94a3b8] mb-1">ชื่อผู้ติดต่อ *</span>
                      <input
                        type="text"
                        required
                        aria-label="ชื่อผู้ติดต่อ" maxLength={100} autoComplete="name" value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="คุณชยุต"
                        className="w-full bg-[#05080e] border border-[#1e293b] p-2.5 text-xs font-thai text-white focus:border-[#38bdf8] focus:outline-none"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-thai text-[#94a3b8] mb-1">เบอร์โทรศัพท์ *</span>
                      <input
                        type="tel"
                        required
                        aria-label="เบอร์โทรศัพท์" maxLength={30} minLength={8} autoComplete="tel" inputMode="tel" value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="08X-XXX-XXXX"
                        className="w-full bg-[#05080e] border border-[#1e293b] p-2.5 text-xs font-thai text-white focus:border-[#38bdf8] focus:outline-none"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-thai text-[#94a3b8] mb-1">LINE ID (ถ้ามี)</span>
                      <input
                        type="text"
                        aria-label="LINE ID" maxLength={100} value={lineId}
                        onChange={(e) => setLineId(e.target.value)}
                        placeholder="@yourline"
                        className="w-full bg-[#05080e] border border-[#1e293b] p-2.5 text-xs font-thai text-white focus:border-[#38bdf8] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs font-thai text-[#94a3b8]">ใช้ข้อมูลเพื่อติดต่อและจัดการงาน กรุณาอย่าส่งรหัสผ่านหรือ Recovery Key <a href="#request-data" className="underline">ดูรายละเอียดการใช้ข้อมูล</a></p>
                {submitError && <p role="alert" className="text-sm font-thai text-red-300">{submitError}</p>}
                {/* Submit Action with Micro-interaction */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !hydrated}
                    className="w-full py-4 text-xs sm:text-sm font-press-start pixel-btn-green flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(57,255,20,0.3)] disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] transition-transform"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังบันทึกคำขอ…</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>ส่งคำขอรับบริการ</span>
                      </>
                    )}
                  </button>
                </div>

              </fieldset></form>
            ) : (
              /* Success Generated Ticket Screen with Motion */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="space-y-6 text-center"
              >
                <div className="inline-flex p-3 bg-[#064e3b] border-2 border-[#34d399] rounded-none animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-[#39ff14]" />
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-press-start text-[#39ff14]">
                    บันทึกคำขอแล้ว
                  </h3>
                  <p className="text-sm font-thai text-[#cbd5e1] mt-1">
                    ระบบบันทึกคำขอแล้ว ร้านจะตรวจสอบและติดต่อกลับ คุณสามารถเปิด LINE OA เพื่อสอบถามเพิ่มเติมได้ครับ
                  </p>
                </div>

                {/* Pixel Ticket Card with Motion Spring */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="max-w-md mx-auto bg-[#05080e] border-4 border-dashed border-[#38bdf8] p-5 text-left font-vt323 space-y-3 shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                >
                  <div className="flex items-center justify-between border-b-2 border-[#1e293b] pb-2">
                    <span className="text-lg font-press-start text-[#38bdf8]">
                      {submittedTicket.ticketId}
                    </span>
                    <span className="text-sm text-[#39ff14] uppercase">● STATUS: RECEIVED</span>
                  </div>

                  <div className="text-base text-[#e2e8f0] space-y-1">
                    <div><span className="text-[#94a3b8]">ชื่อผู้ติดต่อ:</span> {submittedTicket.customerName}</div>
                    <div><span className="text-[#94a3b8]">COMM LINK:</span> {submittedTicket.phoneNumber} {submittedTicket.lineId && `(LINE: ${submittedTicket.lineId})`}</div>
                    <div><span className="text-[#94a3b8]">DEVICE:</span> {submittedTicket.deviceType}</div>
                    <div><span className="text-[#94a3b8]">CATEGORY:</span> {submittedTicket.category}</div>
                    <div><span className="text-[#94a3b8]">บริการ:</span> {submittedTicket.symptoms.join(", ")}</div>
                    {submittedTicket.description && (
                      <div><span className="text-[#94a3b8]">NOTE:</span> {submittedTicket.description}</div>
                    )}
                    <div><span className="text-[#94a3b8]">TIMESTAMP:</span> {submittedTicket.createdAt}</div>
                  </div>

                  <div className="pt-2 border-t-2 border-[#1e293b] flex items-center justify-between text-xs text-[#94a3b8]">
                    <span>LINE OA: {SHOP_CONFIG.line.oaId}</span>
                    <span>8-Bit Computer</span>
                  </div>
                </motion.div>

                {/* Primary LINE OA Forward Button with Confetti */}
                <div className="max-w-md mx-auto pt-2">
                  <button
                    onClick={openLineForward}
                    className="w-full py-3.5 bg-[#06c755] hover:bg-[#05b34c] text-black font-press-start text-xs sm:text-sm flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0_#fff] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <MessageCircle className="w-5 h-5 fill-black" />
                    <span>[ 📲 เปิดแชตคุยกับช่างใน LINE OA ]</span>
                  </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-4 py-2.5 font-press-start text-xs pixel-btn-cyan flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                  >
                    <Printer className="w-4 h-4" />
                    <span>พิมพ์คำขอ</span>
                  </button>

                  <button
                    onClick={resetTicket}
                    className="w-full sm:w-auto px-4 py-2.5 font-press-start text-xs pixel-btn-dark flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>ส่งคำขอใหม่</span>
                  </button>
                </div>

              </motion.div>
            )}
          </div>
        </div>

      </div>

      {/* LINE OA Modal */}
      <LineModal
        isOpen={lineModalOpen}
        onClose={() => setLineModalOpen(false)}
        prefilledMessage={getLineMessage()}
        title="TRANSMIT TICKET TO LINE OA"
      />
    </section>
  );
}
