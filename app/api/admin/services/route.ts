import { z } from "zod";
import { requireOwner } from "@/lib/backend/auth";
import { database } from "@/lib/backend/db";
import { body, failure, HttpError, json, sameOrigin } from "@/lib/backend/http";
import { serviceSchema } from "@/lib/backend/validation";

const deleteServiceSchema = z.object({
  id: z.string().trim().min(1),
});

const createServiceSchema = z.object({
  group_id: z.enum(["software", "upgrade", "care", "password"]),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).default(""),
  price: z.number().min(0).max(99999999).nullable().default(null),
  active: z.boolean().default(true),
});

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

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireOwner();
    const parsed = createServiceSchema.parse(await body(request));
    const id = `${parsed.group_id}-${Date.now().toString(36)}`;
    const { data, error } = await database()
      .from("shop_services")
      .insert({
        id,
        group_id: parsed.group_id,
        name: parsed.name,
        description: parsed.description,
        price: parsed.price,
        active: parsed.active,
        sort_order: 99,
        version: 1,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return json({ success: true, service: data });
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

export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    await requireOwner();
    const { id } = deleteServiceSchema.parse(await body(request));
    const { error } = await database()
      .from("shop_services")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return json({ success: true, id });
  } catch (error) {
    return failure(error);
  }
}

