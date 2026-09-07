export const JOB_STATUSES = {
  pending: "รอยืนยัน",
  received: "รับเครื่องแล้ว",
  working: "กำลังดำเนินการ",
  ready: "พร้อมรับ",
  delivered: "ส่งมอบแล้ว",
  cancelled: "ยกเลิก",
} as const;
export const NOTIFICATION_STATUSES: Record<string, string> = {
  pending: "รอส่ง",
  sending: "กำลังส่ง",
  accepted: "LINE รับคำขอแล้ว",
  failed: "ส่งไม่สำเร็จ",
  uncertain: "ยังยืนยันผลไม่ได้",
  skipped: "ยังไม่ได้ตั้งค่า LINE",
};
export interface ServiceRecord {
  id: string;
  group_id: string;
  name: string;
  description: string;
  price: number | null;
  active: boolean;
  sort_order: number;
  version: number;
}
export interface Job {
  id: string;
  ticket_code: string;
  source: "web" | "store";
  customer_name: string;
  phone: string;
  line_id: string;
  device_type: string;
  device_model: string;
  accessories: string;
  service_ids: string[];
  service_names: string[];
  description: string;
  internal_notes: string;
  quoted_price: number | null;
  status: keyof typeof JOB_STATUSES;
  version: number;
  created_at: string;
  updated_at: string;
}
export interface Notification {
  id: string;
  request_id: string;
  status: string;
  attempts: number;
  detail: string;
  last_attempt_at: string | null;
  created_at: string;
  service_requests?: { ticket_code: string; customer_name: string };
}
