import { requireOwner } from "@/lib/backend/auth";
import { database } from "@/lib/backend/db";
import { body, failure, HttpError, json, sameOrigin } from "@/lib/backend/http";
import { createJob } from "@/lib/backend/jobs";
import { updateJobSchema } from "@/lib/backend/validation";
import { JOB_STATUSES } from "@/lib/backend/types";
export async function GET(request: Request) {
  try {
    await requireOwner();
    const params = new URL(request.url).searchParams;
    const page = Math.floor(
        Math.max(0, Math.min(10000, Number(params.get("page")) || 0)),
      ),
      status = params.get("status");
    const search = (params.get("q") || "")
      .replace(/[^\p{L}\p{N} +@._-]/gu, "")
      .slice(0, 80);
    let query = database()
      .from("service_requests")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });
    if (status && status in JOB_STATUSES) query = query.eq("status", status);
    if (search)
      query = query.or(
        `customer_name.ilike.%${search}%,phone.ilike.%${search}%,ticket_code.ilike.%${search}%`,
      );
    const { data, error, count } = await query.range(page * 25, page * 25 + 24);
    if (error) throw error;
    return json({ jobs: data, count, page });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireOwner();
    const result = await createJob(await body(request), "store");
    return json({ success: true, ...result }, result.created ? 201 : 200);
  } catch (error) {
    return failure(error);
  }
}
export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    await requireOwner();
    const { id, version, ...fields } = updateJobSchema.parse(
      await body(request),
    );
    const { data, error } = await database()
      .from("service_requests")
      .update({
        ...fields,
        version: version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("version", version)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data)
      throw new HttpError(
        409,
        "รายการนี้ถูกแก้ไขแล้ว กรุณาโหลดข้อมูลใหม่ก่อนบันทึก",
      );
    return json({ success: true, job: data });
  } catch (error) {
    return failure(error);
  }
}
