"use client";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { api, formatDate } from "./api";
import {
  JOB_STATUSES,
  type Job,
  type ServiceRecord,
} from "@/lib/backend/types";
export default function JobForm({
  job,
  services,
  onClose,
  onSaved,
  initialData,
}: {
  job: Job | null;
  services: ServiceRecord[];
  onClose: () => void;
  onSaved: () => void;
  initialData?: Partial<Job> | null;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const key = useRef("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    return () => node?.close();
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      if (job)
        await api("/api/admin/jobs", "PATCH", {
          id: job.id,
          version: job.version,
          status: form.get("status"),
          customer_name: form.get("customer_name"),
          phone: form.get("phone"),
          line_id: form.get("line_id"),
          device_model: form.get("device_model"),
          accessories: form.get("accessories"),
          internal_notes: form.get("internal_notes"),
          quoted_price:
            form.get("quoted_price") === ""
              ? null
              : Number(form.get("quoted_price")),
        });
      else {
        key.current ||= crypto.randomUUID();
        await api("/api/admin/jobs", "POST", {
          idempotencyKey: key.current,
          customerName: form.get("customer_name"),
          phoneNumber: form.get("phone"),
          lineId: form.get("line_id"),
          deviceType: form.get("device_type"),
          deviceModel: form.get("device_model"),
          description: form.get("description"),
          serviceIds: form.getAll("serviceIds"),
        });
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="admin-overlay"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      aria-labelledby="job-title"
    >
      <section className="admin-drawer">
        <div className="admin-modal-head">
          <div>
            <p className="admin-kicker">{job?.ticket_code || "WALK-IN"}</p>
            <h2 id="job-title">
              {job ? job.customer_name : "เพิ่มงานหน้าร้าน"}
            </h2>
          </div>
          <button className="admin-button" onClick={onClose} disabled={busy}>
            ปิด
          </button>
        </div>
        {error && (
          <p role="alert" className="admin-error">
            {error}
          </p>
        )}
        {job && (
          <dl className="admin-detail">
            <div>
              <dt>ช่องทาง / วันที่รับคำขอ</dt>
              <dd>
                {job.source === "web" ? "เว็บไซต์" : "หน้าร้าน"} •{" "}
                {formatDate(job.created_at)}
              </dd>
            </div>
            <div>
              <dt>ติดต่อ</dt>
              <dd>
                {job.phone} {job.line_id && `• LINE: ${job.line_id}`}
              </dd>
            </div>
            <div>
              <dt>อุปกรณ์ / บริการที่เลือก</dt>
              <dd>
                {job.device_type}
                <br />
                {job.service_names.join("\n")}
              </dd>
            </div>
            <div>
              <dt>ข้อความจากลูกค้า</dt>
              <dd>{job.description || "ไม่ได้ระบุ"}</dd>
            </div>
          </dl>
        )}
        <form className="admin-form" onSubmit={submit} method="post">
          {job && (
            <>
              <div className="admin-cols">
                <label>
                  ชื่อลูกค้า
                  <input
                    name="customer_name"
                    defaultValue={job.customer_name}
                    required
                    maxLength={100}
                  />
                </label>
                <label>
                  เบอร์โทร
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={job.phone}
                    required
                    maxLength={30}
                  />
                </label>
              </div>
              <label>
                LINE ID
                <input
                  name="line_id"
                  defaultValue={job.line_id}
                  maxLength={100}
                />
              </label>
            </>
          )}
          {!job && (
            <>
              <div className="admin-cols">
                <label>
                  ชื่อลูกค้า *
                  <input
                    name="customer_name"
                    defaultValue={initialData?.customer_name || ""}
                    required
                    maxLength={100}
                  />
                </label>
                <label>
                  เบอร์โทร *
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={initialData?.phone || ""}
                    required
                    maxLength={30}
                  />
                </label>
              </div>
              <div className="admin-cols">
                <label>
                  LINE ID
                  <input
                    name="line_id"
                    defaultValue={initialData?.line_id || ""}
                    maxLength={100}
                  />
                </label>
                <label>
                  ประเภทเครื่อง
                  <select
                    name="device_type"
                    defaultValue={initialData?.device_type || "PC"}
                  >
                    <option>PC</option>
                    <option>Notebook</option>
                    <option>Desktop PC</option>
                    <option>Mini PC</option>
                    <option>อื่น ๆ</option>
                  </select>
                </label>
              </div>
            </>
          )}
          <label>
            รุ่นเครื่อง / สเปก
            <input
              name="device_model"
              defaultValue={job?.device_model || ""}
              maxLength={200}
            />
          </label>
          {job ? (
            <>
              <div className="admin-cols">
                <label>
                  สถานะ
                  <select name="status" defaultValue={job.status}>
                    {Object.entries(JOB_STATUSES).map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  ราคาที่ตกลง (บาท)
                  <input
                    name="quoted_price"
                    type="number"
                    step="0.01"
                    min="0"
                    max="99999999"
                    defaultValue={job.quoted_price ?? ""}
                  />
                </label>
              </div>
              <label>
                อุปกรณ์ที่ฝากไว้
                <textarea
                  name="accessories"
                  defaultValue={job.accessories}
                  rows={2}
                  maxLength={1000}
                />
              </label>
              <label>
                หมายเหตุภายใน (ไม่ส่งให้ลูกค้า)
                <textarea
                  name="internal_notes"
                  defaultValue={job.internal_notes}
                  rows={4}
                  maxLength={4000}
                />
              </label>
            </>
          ) : (
            <>
              <fieldset>
                <legend>บริการที่ต้องการ *</legend>
                <div className="admin-checks">
                  {services
                    .filter((s) => s.active)
                    .map((s) => (
                      <label key={s.id}>
                        <input type="checkbox" name="serviceIds" value={s.id} />
                        {s.name}
                      </label>
                    ))}
                </div>
              </fieldset>
              <label>
                รายละเอียดคำขอ
                <textarea
                  name="description"
                  defaultValue={initialData?.description || ""}
                  rows={3}
                  maxLength={2000}
                />
              </label>
              <p className="admin-muted">
                หลังเพิ่มงาน สามารถเปิดรายการเพื่อบันทึกราคา อุปกรณ์ที่ฝาก
                และหมายเหตุได้
              </p>
            </>
          )}
          <button className="admin-button primary" disabled={busy}>
            {busy
              ? "กำลังบันทึก…"
              : job
                ? "บันทึกการเปลี่ยนแปลง"
                : "เพิ่มงานหน้าร้าน"}
          </button>
        </form>
      </section>
    </dialog>
  );
}
