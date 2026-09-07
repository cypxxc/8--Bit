"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { api } from "./api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sound } from "@/lib/sound";
import { ShieldAlert, KeyRound, ArrowLeft, Terminal } from "lucide-react";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export default function Login({ setup = false }: { setup?: boolean }) {
  const hydrated = useSyncExternalStore(subscribe, clientReady, serverReady);
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sound.playSelect();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget),
      password = String(form.get("password"));
    try {
      if (setup) {
        if (password !== form.get("confirm"))
          throw Error("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
        const token = new URLSearchParams(location.hash.slice(1)).get("token");
        if (!token) throw Error("กรุณาเปิดจากลิงก์ตั้งรหัสผ่านที่เตรียมให้");
        await api("/api/admin/setup", "POST", { token, password });
        history.replaceState(null, "", "/admin/setup");
      } else
        await api("/api/admin/auth", "POST", {
          email: form.get("email"),
          password,
        });
      sound.playVictory();
      router.replace("/admin");
    } catch (e) {
      sound.playError();
      setError(e instanceof Error ? e.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-login">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1e293b] border border-[#38bdf8] text-[#39ff14] text-xs font-press-start mb-3">
        <Terminal className="w-3.5 h-3.5" />
        <span>[ LEVEL 4 CLEARANCE REQUIRED ]</span>
      </div>

      <h1>{setup ? "ตั้งรหัสผ่านเจ้าของร้าน" : "เข้าสู่หลังบ้าน"}</h1>
      <p className="admin-muted">
        ระบบบริหารจัดการงานซ่อม ประกอบคอมพิวเตอร์ และแชต LINE OA
      </p>

      <section className="admin-panel mt-6">
        {error && (
          <div className="admin-error" role="alert">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#ef4444] shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={submit} method="post" className="admin-form">
          {!setup && (
            <label>
              อีเมลผู้ดูแลระบบ (OPERATOR EMAIL)
              <input
                name="email"
                type="email"
                autoComplete="username"
                placeholder="admin@8bitrigs.shop"
                required
              />
            </label>
          )}

          <label>
            {setup ? "รหัสผ่านใหม่ (อย่างน้อย 12 ตัวอักษร)" : "รหัสผ่านเข้าเครื่อง (ACCESS KEY)"}
            <input
              name="password"
              type="password"
              autoComplete={setup ? "new-password" : "current-password"}
              placeholder="••••••••••••"
              required
              minLength={setup ? 12 : 1}
              maxLength={128}
            />
          </label>

          {setup && (
            <label>
              ยืนยันรหัสผ่านใหม่ (CONFIRM ACCESS KEY)
              <input
                name="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••••••"
                required
                minLength={12}
                maxLength={128}
              />
            </label>
          )}

          <button
            className="admin-button primary w-full mt-2"
            disabled={busy || !hydrated}
          >
            <KeyRound className="w-4 h-4 mr-1" />
            <span>
              {busy
                ? "กำลังยืนยันตัวตน…"
                : setup
                ? "บันทึกรหัสผ่านและเริ่มใช้งาน"
                : "ยืนยันรหัสผ่านเข้าสู่ระบบ"}
            </span>
          </button>
        </form>
      </section>

      <p className="mt-6 text-center">
        <Link href="/" className="inline-flex items-center gap-1.5 font-press-start text-xs">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับสู่หน้าร้าน (RETURN TO STORE)</span>
        </Link>
      </p>
    </main>
  );
}
