"use client";

import { useEffect, useRef } from "react";
import { Wrench, MessageSquare, Sparkles, Bell, ExternalLink, LogOut, Menu, X, Monitor } from "lucide-react";

export const ADMIN_SECTIONS = [
  { id: "jobs", label: "งานบริการ", icon: Wrench },
  { id: "inbox", label: "แชตลูกค้า LINE", icon: MessageSquare },
  { id: "services", label: "บริการและราคา", icon: Sparkles },
  { id: "notifications", label: "ประวัติแจ้งเตือน", icon: Bell },
];

export default function AdminSidebar({ tab, email, onSelect, onLogout }: {
  tab: string; email: string; onSelect: (tab: string) => void; onLogout: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  function close() { dialog.current?.close(); }
  useEffect(() => {
    const screen = window.matchMedia("(min-width: 1001px)");
    const resize = () => { if (screen.matches) dialog.current?.close(); };
    screen.addEventListener("change", resize);
    return () => screen.removeEventListener("change", resize);
  }, []);
  function content(mobile = false) {
    return <>
      <div className="admin-sidebar-brand"><span className="admin-brand-icon"><Monitor size={23} aria-hidden="true" /></span><div><strong>8BIT</strong><p>จัดการร้านคอมพิวเตอร์</p></div>
        {mobile && <button className="admin-sidebar-close" onClick={close} aria-label="ปิดเมนู"><X size={22} /></button>}
      </div>
      <p className="admin-sidebar-label">เมนูจัดการร้าน</p>
      <nav aria-label={mobile ? "เมนูหลังบ้านบนมือถือ" : "เมนูหลังบ้าน"} className="admin-sidebar-nav">
        {ADMIN_SECTIONS.map(({ id, label, icon: Icon }) => <button key={id} aria-current={tab === id ? "page" : undefined}
          onClick={() => { onSelect(id); close(); }}><Icon size={19} aria-hidden="true" /><span>{label}</span></button>)}
      </nav>
      <div className="admin-sidebar-links"><p className="admin-sidebar-label">ช่องทางของร้าน</p>
        <a href="/" target="_blank" rel="noreferrer"><Monitor size={18} aria-hidden="true" />ดูหน้าร้าน<ExternalLink size={14} aria-hidden="true" /></a>
        <a href="https://manager.line.biz/" target="_blank" rel="noreferrer"><MessageSquare size={18} aria-hidden="true" />LINE OA Manager<ExternalLink size={14} aria-hidden="true" /></a>
      </div>
      <footer className="admin-sidebar-account"><span>บัญชีเจ้าของร้าน</span><p>{email}</p>
        <button onClick={onLogout}><LogOut size={17} aria-hidden="true" />ออกจากระบบ</button>
      </footer>
    </>;
  }
  return <>
    <aside className="admin-sidebar">{content()}</aside>
    <div className="admin-mobile-bar"><strong>8BIT <span>หลังบ้าน</span></strong><button ref={opener} className="admin-button" aria-haspopup="dialog" aria-controls="admin-mobile-menu"
      onClick={() => dialog.current?.showModal()}><Menu size={18} aria-hidden="true" />เมนู</button></div>
    <dialog ref={dialog} id="admin-mobile-menu" className="admin-mobile-menu" aria-label="เมนูหลังบ้าน" onClose={() => opener.current?.focus()}
      onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="admin-mobile-menu-panel">{content(true)}</div>
    </dialog>
  </>;
}
