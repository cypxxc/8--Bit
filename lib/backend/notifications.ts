import "server-only";
import { database } from "./db";
import { HttpError } from "./http";
import type { Job } from "./types";
export async function deliverNotification(requestId: string) {
  const db = database();
  const { data: log, error } = await db
    .from("line_notifications")
    .select("*")
    .eq("request_id", requestId)
    .single();
  if (error) throw error;
  if (log.status === "accepted") return log;
  if (
    log.status === "sending" &&
    Date.now() - Date.parse(log.last_attempt_at) < 60000
  )
    return log;
  if (
    log.attempts > 0 &&
    ["sending", "uncertain"].includes(log.status) &&
    Date.now() - Date.parse(log.created_at) > 23 * 3600000
  )
    throw new HttpError(
      409,
      "ผลเดิมยังไม่แน่ชัดและพ้นช่วงส่งซ้ำอย่างปลอดภัย กรุณาตรวจแชต LINE",
    );
  const { data: claimed, error: claimError } = await db
    .from("line_notifications")
    .update({
      status: "sending",
      attempts: log.attempts + 1,
      last_attempt_at: new Date().toISOString(),
      detail: "",
    })
    .eq("id", log.id)
    .eq("attempts", log.attempts)
    .eq("status", log.status)
    .select()
    .maybeSingle();
  if (claimError) throw claimError;
  if (!claimed) return { ...log, status: "sending" };
  const { data: job, error: jobError } = await db
    .from("service_requests")
    .select("*")
    .eq("id", requestId)
    .single();
  if (jobError) throw jobError;
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim(),
    recipient = process.env.LINE_ADMIN_USER_ID?.trim();
  let status = "skipped",
    detail = "ยังไม่ได้ตั้งค่า LINE";
  if (token && recipient) {
    try {
      const response = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Line-Retry-Key": log.retry_key,
        },
        body: JSON.stringify({
          to: recipient,
          messages: [{ type: "text", text: notificationText(job) }],
        }),
        signal: AbortSignal.timeout(10000),
      });
      const accepted =
        response.ok ||
        (response.status === 409 &&
          !!response.headers.get("x-line-accepted-request-id"));
      status = accepted ? "accepted" : "failed";
      detail = accepted
        ? "LINE รับคำขอแล้ว (ไม่ได้ยืนยันว่าผู้รับอ่านแล้ว)"
        : `LINE ปฏิเสธคำขอ (${response.status})`;
    } catch {
      status = "uncertain";
      detail = "การเชื่อมต่อขาดหาย ยังยืนยันผลไม่ได้";
    }
  }
  const { data: result, error: saveError } = await db
    .from("line_notifications")
    .update({ status, detail })
    .eq("id", log.id)
    .select()
    .single();
  if (saveError) throw saveError;
  return result;
}
function notificationText(job: Job) {
  return `🕹️ คำขอรับบริการใหม่ — 8bit\nเลขงาน: ${job.ticket_code}\nลูกค้า: ${job.customer_name}\nโทร: ${job.phone}\nอุปกรณ์: ${job.device_type} ${job.device_model}\nบริการ: ${job.service_names.join(", ")}\nรายละเอียด: ${job.description || "-"}\nเปิดหลังบ้านเพื่อประเมินและติดต่อกลับ`.slice(
    0,
    4500,
  );
}
