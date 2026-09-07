"use client";

import React, { useState } from "react";
import PublicDialog from "./PublicDialog";
import { sound } from "@/lib/sound";
import { SHOP_CONFIG } from "@/lib/config";
import { MessageCircle, X, Copy, Check, ExternalLink } from "lucide-react";

interface LineModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledMessage?: string;
  title?: string;
}

export default function LineModal({
  isOpen,
  onClose,
  prefilledMessage,
  title = "ติดต่อร้านผ่าน LINE OA",
}: LineModalProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  if (!isOpen) return null;

  const handleCopyId = async () => {
    sound.playCoin();
    try { await navigator.clipboard.writeText(SHOP_CONFIG.line.oaId); } catch { setCopyError("คัดลอกไม่ได้ กรุณาคัดลอก LINE ID ที่แสดงด้วยตนเอง"); return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const lineDirectUrl = prefilledMessage
    ? `https://line.me/R/oaMessage/${SHOP_CONFIG.line.oaId}/?${encodeURIComponent(prefilledMessage)}`
    : SHOP_CONFIG.line.oaUrl;

  return (
    <PublicDialog open={isOpen} onClose={onClose} label={title}>
      <div className="w-full max-w-md retro-window border-2 border-[#06c755]">
        {/* Header */}
        <div className="bg-[#06c755] text-black px-4 py-2 flex items-center justify-between font-press-start text-xs">
          <span className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 fill-black" />
            <span>LINE_OA_LINK.EXE</span>
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="ปิดหน้าต่าง LINE" className="text-black hover:bg-black/10 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-[#090e18] text-center space-y-5">
          <div>
            <span className="text-[10px] font-press-start text-[#39ff14] border border-[#39ff14] px-2 py-0.5 inline-block mb-1">
              OFFICIAL SUPPORT COMM LINK
            </span>
            <h3 className="text-lg font-bold font-thai text-white">
              ปรึกษาช่างและส่งตั๋วผ่าน LINE OA
            </h3>
            <p className="text-xs font-thai text-[#94a3b8] mt-1">
              สแกน QR Code เพื่อเพิ่มเพื่อน หรือกดปุ่มด้านล่างเพื่อเปิดแอปพลิเคชัน LINE ได้ทันที
            </p>
          </div>

          {/* QR Code Container (Retro Border) */}
          <div className="inline-block p-3 bg-white border-4 border-black shadow-[4px_4px_0_#06c755]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              width={160} height={160} referrerPolicy="no-referrer" src={SHOP_CONFIG.line.qrCodeImage}
              alt="LINE OA QR Code"
              className="w-40 h-40 mx-auto"
            />
          </div>

          {/* LINE ID Copy Box */}
          <div className="flex items-center justify-center gap-2 bg-[#05080e] p-2.5 border-2 border-[#1e293b]">
            <span className="text-xs font-press-start text-[#94a3b8]">LINE ID:</span>
            <span className="text-sm font-press-start text-[#06c755]">{SHOP_CONFIG.line.oaId}</span>
            <button
              onClick={handleCopyId}
              className="ml-2 p-1.5 bg-[#1e293b] hover:bg-[#334155] text-white border border-[#475569] text-xs font-press-start flex items-center gap-1 cursor-pointer"
              title="Copy LINE ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#39ff14]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[9px]">{copied ? "COPIED" : "COPY"}</span>
            </button>
          </div>

          {copyError && <p role="alert" className="text-amber-200 text-sm">{copyError}</p>}
          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <a
              href={lineDirectUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => sound.playVictory()}
              className="w-full py-3 bg-[#06c755] hover:bg-[#05b34c] text-black font-press-start text-xs flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0_#fff] cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>[ 📲 เปิดแชต LINE ]</span>
            </a>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-full py-2 font-press-start text-[10px] text-[#94a3b8] hover:text-white cursor-pointer"
            >
              [ ปิดหน้าต่าง ]
            </button>
          </div>

        </div>
      </div>
    </PublicDialog>
  );
}
