"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  type FormEvent,
} from "react";
import { api, formatDate, ApiError } from "./api";
import {
  JOB_STATUSES,
  NOTIFICATION_STATUSES,
  type Job,
  type Notification,
  type ServiceRecord,
} from "@/lib/backend/types";
import JobForm from "./JobForm";
import ServiceEditor from "./ServiceEditor";
import LineInbox from "./LineInbox";
import AdminSidebar, { ADMIN_SECTIONS } from "./AdminSidebar";
import { SERVICE_GROUPS } from "@/lib/services";
import { sound } from "@/lib/sound";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Search,
  Plus,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Send,
} from "lucide-react";

const STATUS_ICONS: Record<string, string> = {
  pending: "📥",
  received: "🪛",
  working: "⚡",
  ready: "🏆",
  delivered: "📦",
  cancelled: "❌",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-[#082032] text-[#38bdf8] border-[#0284c7]",
  received: "bg-[#161b38] text-[#a5b4fc] border-[#6366f1]",
  working: "bg-[#2e1d08] text-[#fbbf24] border-[#d97706]",
  ready: "bg-[#062c1e] text-[#34d399] border-[#059669]",
  delivered: "bg-[#0f172a] text-[#94a3b8] border-[#334155]",
  cancelled: "bg-[#2d0e0e] text-[#f87171] border-[#dc2626]",
};

export default function AdminApp() {
  const router = useRouter();
  const requestVersion = useRef(0);
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Job | null | undefined>(undefined);
  const [jobPrefill, setJobPrefill] = useState<Partial<Job> | null>(null);
  const [retrying, setRetrying] = useState("");
  const [group, setGroup] = useState("");
  const [showNewService, setShowNewService] = useState(false);
  const [newServiceBusy, setNewServiceBusy] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    api<{ email: string }>("/api/admin/auth")
      .then((data) => { setEmail(data.email); setIsMuted(sound.getMuted()); })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  const refresh = useCallback(async () => {
    if (!email) return;
    const version = ++requestVersion.current;
    setLoading(true);
    setError("");
    try {
      const [summary, catalog] = await Promise.all([
        api<{ counts: Record<string, number> }>("/api/admin/summary"),
        api<{ services: ServiceRecord[] }>("/api/admin/services"),
      ]);
      if (version !== requestVersion.current) return;
      setCounts(summary.counts);
      setServices(catalog.services);

      if (tab === "jobs") {
        const result = await api<{ jobs: Job[]; count: number }>(
          `/api/admin/jobs?page=${page}&status=${status}&q=${encodeURIComponent(query)}`
        );
        if (version !== requestVersion.current) return;
        setJobs(result.jobs);
        setCount(result.count);
      }

      if (tab === "notifications") {
        const result = await api<{
          notifications: Notification[];
          count: number;
        }>(`/api/admin/notifications?page=${page}`);
        if (version !== requestVersion.current) return;
        setNotifications(result.notifications);
        setCount(result.count);
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 401)
        router.replace("/admin/login");
      if (version === requestVersion.current)
        setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [email, tab, page, status, query, router]);

  useEffect(() => {
    // Synchronize remote records with the selected section and filters.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  async function logout() {
    sound.playClick();
    try {
      await api("/api/admin/auth", "DELETE");
      router.replace("/admin/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ออกจากระบบไม่สำเร็จ");
    }
  }

  async function retry(n: Notification) {
    if (
      !window.confirm(
        `ส่งแจ้งเตือนงาน ${n.service_requests?.ticket_code || ""} ไปยัง LINE เจ้าของร้านอีกครั้ง?`
      )
    )
      return;
    sound.playLaser();
    setRetrying(n.id);
    setError("");
    try {
      const result = await api<{ notification: Notification }>(
        "/api/admin/notifications",
        "POST",
        { requestId: n.request_id }
      );
      sound.playVictory();
      setMessage(
        NOTIFICATION_STATUSES[result.notification.status] ||
          result.notification.status
      );
      await refresh();
    } catch (e) {
      sound.playError();
      setError(e instanceof Error ? e.message : "ส่งไม่สำเร็จ");
    } finally {
      setRetrying("");
    }
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sound.playSelect();
    setPage(0);
    setQuery(String(new FormData(event.currentTarget).get("q") || ""));
  }

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleCreateJobFromIntake = (prefill: {
    customer_name: string;
    device_type: string;
    description: string;
    line_id: string;
  }) => {
    sound.playPowerUp();
    setJobPrefill({
      customer_name: prefill.customer_name,
      device_type: prefill.device_type === "Notebook" ? "Notebook" : "PC",
      description: prefill.description,
      line_id: prefill.line_id,
    });
    setEditing(null);
  };

  async function handleCreateService(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNewServiceBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      await api("/api/admin/services", "POST", {
        group_id: f.get("group_id"),
        name: f.get("name"),
        description: f.get("description") || "",
        price: f.get("price") === "" ? null : Number(f.get("price")),
        active: f.get("active") === "on",
      });
      sound.playPowerUp();
      setMessage("เพิ่มบริการใหม่ลงในแคตตาล็อกแล้ว");
      setShowNewService(false);
      void refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เพิ่มบริการไม่สำเร็จ");
    } finally {
      setNewServiceBusy(false);
    }
  }

  if (!email) {
    return (
      <div className="admin-empty" style={{ maxWidth: 500, margin: "15vh auto" }}>
        <p className="admin-kicker">INITIALIZING RETRO TERMINAL...</p>
        <p style={{ marginTop: 12 }}>กำลังตรวจสอบสิทธิ์การเข้าใช้งานระบบปฏิบัติการ...</p>
      </div>
    );
  }

  return (
    <div className="admin-workspace">
      <AdminSidebar tab={tab} email={email} onLogout={logout} onSelect={(next) => {
        sound.playClick(); setTab(next); setPage(0); setMessage("");
        window.scrollTo({ top: 0 });
      }} />
      <main className="admin-content" id="admin-content">
      <header className="admin-top admin-page-header">
        <div><p className="admin-muted">หลังบ้านร้าน 8bit</p>
          <h1>{ADMIN_SECTIONS.find(section => section.id === tab)?.label}</h1>
        </div>
        <div className="admin-actions">
          <button onClick={toggleSound} className="admin-button" aria-label={isMuted ? "เปิดเสียง" : "ปิดเสียง"}>
            {isMuted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
            {isMuted ? "ปิดเสียงอยู่" : "เปิดเสียงอยู่"}
          </button>
          {tab !== "inbox" && <button className="admin-button" disabled={loading} onClick={() => { sound.playCoin(); void refresh(); }}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} aria-hidden="true" />รีเฟรชข้อมูล
          </button>}
        </div>
      </header>

      {/* Arcade Stat Pods Grid */}
      {tab === "jobs" && (
        <div className="admin-grid" role="region" aria-label="สถิติสถานะงาน">
          {Object.entries(JOB_STATUSES).map(([key, label]) => {
            const isActive = tab === "jobs" && status === key;
            return (
              <button
                className={`admin-stat ${isActive ? "is-active" : ""}`}
                aria-pressed={isActive}
                data-status={key}
                key={key}
                onClick={() => {
                  sound.playSelect();
                  setTab("jobs");
                  setStatus(key);
                  setPage(0);
                }}
              >
                <span>
                  <span aria-hidden="true">{STATUS_ICONS[key] || "●"}</span> {label}
                </span>
                <strong>{counts[key] ?? 0}</strong>
              </button>
            );
          })}
        </div>
      )}

      {/* Alert Banners */}
      {error && (
        <div className="admin-error" role="alert">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#ef4444] shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}
      {message && (
        <div className="admin-success" role="status">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* TAB 1: งานบริการ (Jobs) */}
      {tab === "jobs" && (
        <>
          <form className="admin-toolbar" onSubmit={search}>
            <input
              name="q"
              aria-label="ค้นหางาน"
              placeholder="🔍 ค้นหาชื่อ เบอร์โทร หรือเลขตั๋วงาน..."
              defaultValue={query}
            />
            <select
              aria-label="กรองสถานะ"
              value={status}
              onChange={(e) => {
                sound.playSelect();
                setStatus(e.target.value);
                setPage(0);
              }}
            >
              <option value="">ทุกสถานะงาน</option>
              {Object.entries(JOB_STATUSES).map(([key, label]) => (
                <option key={key} value={key}>
                  {STATUS_ICONS[key]} {label}
                </option>
              ))}
            </select>
            <button className="admin-button primary" disabled={loading}>
              <Search className="w-3.5 h-3.5 mr-1" />
              <span>ค้นหา</span>
            </button>
          </form>

          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2>
              รายการงานบริการ{" "}
              <span className="text-sm font-normal text-[#94a3b8]">
                ({count} รายการ {status ? `• ${JOB_STATUSES[status as keyof typeof JOB_STATUSES]}` : ""})
              </span>
            </h2>
            <button
              className="admin-button primary"
              onClick={() => {
                sound.playPowerUp();
                setJobPrefill(null);
                setEditing(null);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>+ เพิ่มงานหน้าร้าน (WALK-IN)</span>
            </button>
          </div>

          {loading ? (
            <div className="admin-empty">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-[#38bdf8]" />
              <p>กำลังโหลดตารางงานจากฐานข้อมูล...</p>
            </div>
          ) : !jobs.length ? (
            <div className="admin-empty">
              <p className="font-press-start text-xs text-[#facc15] mb-2">NO ACTIVE QUESTS FOUND</p>
              ยังไม่มีงานในสถานะที่เลือก
              <br />
              คำขอแจ้งซ่อมจากเว็บไซต์จะปรากฏที่นี่ หรือกดปุ่มด้านบนเพื่อเพิ่มงานหน้าร้าน
            </div>
          ) : (
            <div className="admin-list">
              {jobs.map((job) => {
                const badgeColor = STATUS_COLORS[job.status] || "bg-[#0f172a] text-[#cbd5e1] border-[#334155]";
                return (
                  <button
                    className="admin-job"
                    key={job.id}
                    onClick={() => {
                      sound.playSelect();
                      setJobPrefill(null);
                      setEditing(job);
                    }}
                  >
                    <div>
                      <p className="admin-kicker">
                        <span className="text-[#38bdf8]">{job.ticket_code}</span> •{" "}
                        <span>{job.source === "web" ? "🌐 เว็บไซต์" : "🏪 หน้าร้าน"}</span>
                      </p>
                      <h3>{job.customer_name}</h3>
                      <p className="text-sm text-[#cbd5e1]">
                        {job.service_names?.length ? job.service_names.join(" • ") : "ตรวจเช็กอาการทั่วไป"}
                      </p>
                      <p className="admin-muted text-xs sm:text-sm">
                        💻 {job.device_type} {job.device_model ? `(${job.device_model})` : ""} • 📞 {job.phone}
                      </p>
                    </div>

                    <div className="text-right flex flex-col justify-between items-end">
                      <span className={`admin-badge border ${badgeColor}`}>
                        <span aria-hidden="true">{STATUS_ICONS[job.status]}</span> {JOB_STATUSES[job.status]}
                      </span>
                      <p className="admin-muted text-xs font-mono">{formatDate(job.created_at)}</p>
                      <p className="admin-job-price">
                        {job.quoted_price === null
                          ? "ยังไม่ระบุราคา"
                          : `฿${Number(job.quoted_price).toLocaleString("th-TH")}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: แชตลูกค้า LINE */}
      {tab === "inbox" && <LineInbox onCreateJob={handleCreateJobFromIntake} />}

      {/* TAB 3: บริการและราคา (Services) */}
      {tab === "services" && (
        <>
          <div className="admin-top">
            <div>
              <h2>แคตตาล็อกบริการและราคา</h2>
              <p className="admin-muted">
                การเปลี่ยนแปลงจะแสดงผลบนหน้าเว็บไซต์ทันทีเมื่อบันทึก
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <select
                style={{ maxWidth: 260 }}
                aria-label="กรองหมวดบริการ"
                value={group}
                onChange={(e) => {
                  sound.playSelect();
                  setGroup(e.target.value);
                }}
              >
                <option value="">ทุกหมวดบริการ</option>
                {SERVICE_GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="admin-button primary"
                onClick={() => {
                  sound.playClick();
                  setShowNewService((prev) => !prev);
                }}
              >
                {showNewService ? "▲ ปิดฟอร์ม" : "➕ เพิ่มบริการใหม่"}
              </button>
            </div>
          </div>

          {showNewService && (
            <form className="admin-service-new admin-form" onSubmit={handleCreateService}>
              <div className="admin-service-new-head">
                <h3>➕ เพิ่มบริการใหม่ลงในแคตตาล็อก</h3>
                <button
                  type="button"
                  className="admin-button"
                  style={{ padding: "3px 8px", fontSize: "11px" }}
                  onClick={() => setShowNewService(false)}
                >
                  ✕ ปิด
                </button>
              </div>
              <div className="admin-cols">
                <label>
                  หมวดบริการ
                  <select name="group_id" required defaultValue={group || "software"}>
                    {SERVICE_GROUPS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  ชื่อบริการ
                  <input name="name" required maxLength={200} placeholder="เช่น ติดตั้งโปรแกรมเฉพาะทาง..." />
                </label>
              </div>
              <label>
                รายละเอียดที่แสดงบนเว็บ
                <textarea name="description" rows={2} maxLength={1000} placeholder="อธิบายรายละเอียดขอบเขตงานหรือเงื่อนไข..." />
              </label>
              <div className="admin-cols">
                <label>
                  ราคาเริ่มต้น (เว้นว่าง = สอบถาม)
                  <input name="price" type="number" min="0" max="99999999" step="0.01" placeholder="300" />
                </label>
                <label className="admin-toggle-label" style={{ alignSelf: "center" }}>
                  <input type="checkbox" name="active" defaultChecked />
                  <span>เปิดรับบริการทันที</span>
                </label>
              </div>
              <div className="admin-actions" style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button className="admin-button primary" disabled={newServiceBusy} type="submit">
                  {newServiceBusy ? "กำลังบันทึก…" : "➕ บันทึกบริการใหม่"}
                </button>
                <button className="admin-button" type="button" onClick={() => setShowNewService(false)}>
                  ยกเลิก
                </button>
              </div>
            </form>
          )}

          <div className="admin-services">
            {services
              .filter((s) => !group || s.group_id === group)
              .map((s) => (
                <ServiceEditor
                  key={`${s.id}-${s.version}`}
                  service={s}
                  onSaved={() => {
                    sound.playVictory();
                    setMessage("บันทึกบริการแล้ว");
                    void refresh();
                  }}
                  onDeleted={() => {
                    sound.playLaser();
                    setMessage(`ลบบริการ "${s.name}" ออกจากแคตตาล็อกแล้ว`);
                    void refresh();
                  }}
                />
              ))}
          </div>
        </>
      )}

      {/* TAB 4: ประวัติแจ้งเตือน LINE */}
      {tab === "notifications" && (
        <>
          <div className="mb-4">
            <h2>ประวัติแจ้งเตือน LINE เจ้าของร้าน</h2>
            <p className="admin-muted">
              บันทึกผลการส่งแจ้งเตือนงานใหม่จากเว็บไซต์แบบ Real-time
            </p>
          </div>

          {loading ? (
            <div className="admin-empty">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-[#38bdf8]" />
              <p>กำลังโหลดประวัติ...</p>
            </div>
          ) : !notifications.length ? (
            <div className="admin-empty">ยังไม่มีประวัติแจ้งเตือนในระบบ</div>
          ) : (
            <div className="admin-list">
              {notifications.map((n) => (
                <article className="admin-panel" key={n.id}>
                  <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                    <div>
                      <h3 className="font-press-start text-xs text-[#38bdf8]">
                        {n.service_requests?.ticket_code || "TICKET"}
                      </h3>
                      <p className="text-white font-semibold">
                        {n.service_requests?.customer_name || "ลูกค้า"}
                      </p>
                    </div>
                    <span className="admin-badge">
                      {NOTIFICATION_STATUSES[n.status] || n.status}
                    </span>
                  </div>

                  <p className="text-sm text-[#cbd5e1]">{n.detail || "รอดำเนินการ"}</p>
                  <p className="admin-muted text-xs mt-1">
                    พยายามส่ง {n.attempts} ครั้ง • ล่าสุด {formatDate(n.last_attempt_at)}
                  </p>

                  {n.status !== "accepted" && (
                    <div className="mt-3">
                      <button
                        className="admin-button"
                        disabled={!!retrying}
                        onClick={() => void retry(n)}
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        <span>{retrying === n.id ? "กำลังส่ง…" : "ส่งแจ้งเตือนอีกครั้ง"}</span>
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination Bar */}
      {(tab === "jobs" || tab === "notifications") && (
        <div className="admin-pages">
          <button
            className="admin-button"
            disabled={loading || page === 0}
            onClick={() => {
              sound.playClick();
              setPage((p) => p - 1);
            }}
          >
            ◀ หน้าก่อนหน้า
          </button>
          <span className="font-press-start text-xs text-[#94a3b8] tabular-nums">
            PAGE {page + 1} • {count} ITEMS
          </span>
          <button
            className="admin-button"
            disabled={loading || (page + 1) * 25 >= count}
            onClick={() => {
              sound.playClick();
              setPage((p) => p + 1);
            }}
          >
            หน้าถัดไป ▶
          </button>
        </div>
      )}

      {/* Job Form Drawer / Modal */}
      {editing !== undefined && (
        <JobForm
          key={editing?.id || (jobPrefill ? `prefill-${jobPrefill.line_id || ""}` : "new-job")}
          job={editing}
          services={services}
          initialData={jobPrefill}
          onClose={() => {
            sound.playClick();
            setJobPrefill(null);
            setEditing(undefined);
          }}
          onSaved={() => {
            sound.playVictory();
            setJobPrefill(null);
            setEditing(undefined);
            setMessage("บันทึกงานเรียบร้อยแล้ว");
            void refresh();
          }}
        />
      )}
      </main>
    </div>
  );
}
