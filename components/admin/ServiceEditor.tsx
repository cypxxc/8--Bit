"use client";
import { useState, type FormEvent } from "react";
import { api } from "./api";
import type { ServiceRecord } from "@/lib/backend/types";
export default function ServiceEditor({
  service,
  onSaved,
  onDeleted,
}: {
  service: ServiceRecord;
  onSaved: () => void;
  onDeleted?: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [failed, setFailed] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const f = new FormData(event.currentTarget);
    try {
      await api("/api/admin/services", "PATCH", {
        id: service.id,
        version: service.version,
        name: f.get("name"),
        description: f.get("description"),
        price: f.get("price") === "" ? null : Number(f.get("price")),
        active: f.get("active") === "on",
      });
      setFailed(false);
      setMessage("บันทึกแล้ว");
      onSaved();
    } catch (e) {
      setFailed(true);
      setMessage(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const confirmText = `ยืนยันการลบบริการ "${service.name}" หรือไม่?\nการลบจะมีผลบนหน้าเว็บไซต์ทันทีและไม่สามารถย้อนกลับได้`;
    if (!window.confirm(confirmText)) return;

    setBusy(true);
    setMessage("");
    try {
      await api("/api/admin/services", "DELETE", { id: service.id });
      setFailed(false);
      onDeleted?.();
    } catch (e) {
      setFailed(true);
      setMessage(e instanceof Error ? e.message : "ลบไม่สำเร็จ");
      setBusy(false);
    }
  }

  return (
    <form className="admin-service admin-form" onSubmit={save} method="post">
      <div className="admin-service-head">
        <div className="admin-service-meta">
          <span className="admin-badge">
            {service.group_id.toUpperCase()}
          </span>
          <span className="admin-service-id">#{service.id}</span>
        </div>
        <div className="admin-service-status-pill">
          <span className={`admin-dot ${service.active ? "is-online" : "is-offline"}`} />
          <span>{service.active ? "เปิดรับงาน" : "ปิดชั่วคราว"}</span>
        </div>
      </div>
      <label>
        ชื่อบริการ
        <input
          name="name"
          defaultValue={service.name}
          required
          maxLength={200}
        />
      </label>
      <label>
        รายละเอียดที่แสดงบนเว็บ
        <textarea
          name="description"
          rows={2}
          defaultValue={service.description}
          maxLength={1000}
        />
      </label>
      <div className="admin-cols">
        <label>
          ราคาเริ่มต้น (เว้นว่าง = สอบถาม)
          <input
            name="price"
            type="number"
            min="0"
            max="99999999"
            step="0.01"
            defaultValue={service.price ?? ""}
            style={{ fontVariantNumeric: "tabular-nums" }}
          />
        </label>
        <label className="admin-toggle-label" style={{ alignSelf: "center" }}>
          <input
            type="checkbox"
            name="active"
            defaultChecked={service.active}
          />
          <span>เปิดรับบริการ</span>
        </label>
      </div>
      {message && (
        <p role="status" className={failed ? "admin-error" : "admin-success"}>
          {message}
        </p>
      )}
      <div className="admin-actions">
        <button className="admin-button primary" disabled={busy} type="submit">
          {busy ? "กำลังบันทึก…" : "💾 บันทึกบริการ"}
        </button>
        <button
          type="button"
          className="admin-button danger"
          disabled={busy}
          onClick={remove}
        >
          🗑️ ลบบริการ
        </button>
      </div>
    </form>
  );
}
