"use client";

import React, { useState } from "react";
import BiosBootScreen from "@/components/motion/BiosBootScreen";
import PixelCursorTrail from "@/components/motion/PixelCursorTrail";
import SmoothPageScroll from "@/components/motion/SmoothPageScroll";
import { MotionConfig } from "motion/react";
import Scanlines from "@/components/Scanlines";
import NavbarHud from "@/components/NavbarHud";
import HeroSection from "@/components/HeroSection";
import ServicesMissions from "@/components/ServicesMissions";
import RepairTicketTerminal from "@/components/RepairTicketTerminal";
import TestimonialsHallOfFame from "@/components/TestimonialsHallOfFame";
import FaqSection from "@/components/FaqSection";
import FooterCommLink from "@/components/FooterCommLink";
import FloatingLineWidget from "@/components/FloatingLineWidget";

import type { ServiceRecord } from "@/lib/backend/types";
import { ServiceCatalog } from "@/components/ServiceCatalog";

export default function LandingPage({initialServices,initialError}: {initialServices: ServiceRecord[];initialError: string}) {
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [forceBootScreen, setForceBootScreen] = useState(false);
  const [scanlinesEnabled, setScanlinesEnabled] = useState(false);

  return (
    <MotionConfig reducedMotion="user"><ServiceCatalog initialServices={initialServices} initialError={initialError}><div className="min-h-screen bg-[#090b10] text-[#e2e8f0] relative flex flex-col">
      <SmoothPageScroll paused={forceBootScreen} />
      <BiosBootScreen forceShow={forceBootScreen} onClose={() => setForceBootScreen(false)} />
      {particlesEnabled && <PixelCursorTrail />}
      <a className="skip-link" href="#main-content">ข้ามไปยังเนื้อหา</a>
      {/* CRT Scanline & Screen Vignette Overlay */}
      <Scanlines enabled={scanlinesEnabled} />

      {/* Floating 8-bit LINE OA Quick Support Widget */}
      <FloatingLineWidget />

      {/* Retro Arcade HUD & Navigation Bar */}
      <NavbarHud
        scanlinesEnabled={scanlinesEnabled}
        setScanlinesEnabled={setScanlinesEnabled}
        particlesEnabled={particlesEnabled} setParticlesEnabled={setParticlesEnabled}
        onRebootBios={() => setForceBootScreen(true)}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1">
        <noscript><p className="p-4 text-center">กรุณาเปิด JavaScript เพื่อใช้ฟอร์ม หรือ <a href="https://lin.ee/rTDPJYr" className="underline">ติดต่อร้านผ่าน LINE OA</a></p></noscript>
        {/* 1. Hero Section (Title Screen & Arcade Attract Mode) */}
        <HeroSection />

        {/* Service catalog */}
        <ServicesMissions />

        {/* 4. Repair Ticket Terminal (Interactive Job Intake / Quest Log) */}
        <RepairTicketTerminal />


        {/* Service steps */}
        <TestimonialsHallOfFame />

        {/* 7. FAQ Section (NPC Helpdesk & Secrets) */}
        <FaqSection />
      </main>

      {/* 8. Footer (Comm Link & HQ Coordinates) */}
      <FooterCommLink />
    </div></ServiceCatalog></MotionConfig>
  );
}
