"use client";
import { useState, type FormEvent } from "react";
import { api } from "./api";
import type { ServiceRecord } from "@/lib/backend/types";
export default function ServiceEditor({
  service,
  onSaved,
}: {
  service: ServiceRecord;
  onSaved: () => void;
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
  return (
    <form className="admin-panel admin-form admin-service" onSubmit={save} method="post">
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
          />
        </label>
        <label style={{ alignSelf: "center" }}>
          <input
            type="checkbox"
            name="active"
            defaultChecked={service.active}
          />{" "}
          เปิดรับบริการ
        </label>
      </div>
      {message && (
        <p role="status" className={failed ? "admin-error" : "admin-success"}>
          {message}
        </p>
      )}
      <div className="admin-actions">
        <button className="admin-button" disabled={busy}>
          {busy ? "กำลังบันทึก…" : "บันทึกบริการ"}
        </button>
      </div>
    </form>
  );
}
