import "server-only";
import { database } from "./db";
import { intakeSchema } from "./validation";
import { HttpError } from "./http";
import { limit } from "./limits";
export async function createJob(raw: unknown, source: "web" | "store") {
  const input = intakeSchema.parse(raw),
    db = database();
  const { data: existing, error: findError } = await db
    .from("service_requests")
    .select("id,ticket_code,created_at")
    .eq("idempotency_key", input.idempotencyKey)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return { job: existing, created: false };
  const { data: services, error } = await db
    .from("shop_services")
    .select("id,name")
    .in("id", input.serviceIds)
    .eq("active", true);
  if (error) throw error;
  if (services.length !== input.serviceIds.length)
    throw new HttpError(400, "บางบริการปิดรับแล้ว กรุณาโหลดรายการใหม่");
  if (source === "web")
    await limit(`phone:${input.phoneNumber.replace(/\D/g, "")}`, 5, 3600);
  const { data: job, error: insertError } = await db
    .from("service_requests")
    .insert({
      idempotency_key: input.idempotencyKey,
      source,
      customer_name: input.customerName,
      phone: input.phoneNumber,
      line_id: input.lineId,
      device_type: input.deviceType,
      device_model: input.deviceModel,
      description: input.description,
      service_ids: input.serviceIds,
      service_names: input.serviceIds.map(
        (id) => services.find((s) => s.id === id)!.name,
      ),
    })
    .select("id,ticket_code,created_at")
    .single();
  if (insertError?.code === "23505") {
    const { data: duplicate, error: duplicateError } = await db
      .from("service_requests")
      .select("id,ticket_code,created_at")
      .eq("idempotency_key", input.idempotencyKey)
      .single();
    if (duplicateError) throw duplicateError;
    return { job: duplicate, created: false };
  }
  if (insertError) throw insertError;
  return { job, created: true };
}
