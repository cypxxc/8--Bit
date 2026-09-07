"use client";

import React, { useState } from "react";
import { sound } from "@/lib/sound";
import LineModal from "./LineModal";
import { MessageCircle } from "lucide-react";

export default function FloatingLineWidget() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => {
    sound.playPowerUp();
    setModalOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 group">
        {/* Floating Tooltip / Speech Bubble */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#05080e] border-2 border-[#06c755] text-white text-xs font-thai shadow-[3px_3px_0_#000] ">
          <span className="w-2 h-2 bg-[#06c755] rounded-none inline-block " />
          <span>แชตปรึกษาช่างผ่าน <strong>LINE OA</strong></span>
        </div>

        {/* 8-Bit Pixel Button */}
        <button
          onClick={handleClick}
          className="p-3.5 bg-[#06c755] hover:bg-[#05b34c] text-black border-4 border-black shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2 font-press-start text-xs"
          title="ติดต่อเราผ่าน LINE Official Account"
        >
          <MessageCircle className="w-6 h-6 fill-black text-[#06c755]" />
          <span className="hidden md:inline font-bold">LINE OA</span>
        </button>
      </div>

      <LineModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
