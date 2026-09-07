import { database } from "@/lib/backend/db";
import { json, failure } from "@/lib/backend/http";
export async function GET() {
  try {
    const { data, error } = await database()
      .from("shop_services")
      .select("id,group_id,name,description,price,active,sort_order,version")
      .eq("active", true)
      .order("sort_order");
    if (error) throw error;
    return json({ services: data });
  } catch (error) {
    return failure(error);
  }
}
