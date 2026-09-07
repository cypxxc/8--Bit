import { requireOwner } from "@/lib/backend/auth";
import { database } from "@/lib/backend/db";
import { body, failure, HttpError, json, sameOrigin } from "@/lib/backend/http";
import { serviceSchema } from "@/lib/backend/validation";
export async function GET() {
  try {
    await requireOwner();
    const { data, error } = await database()
      .from("shop_services")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return json({ services: data });
  } catch (error) {
    return failure(error);
  }
}
export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    await requireOwner();
    const { id, version, ...fields } = serviceSchema.parse(await body(request));
    const { data, error } = await database()
      .from("shop_services")
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
      throw new HttpError(409, "รายการถูกแก้ไขแล้ว กรุณาโหลดข้อมูลใหม่");
    return json({ success: true, service: data });
  } catch (error) {
    return failure(error);
  }
}
