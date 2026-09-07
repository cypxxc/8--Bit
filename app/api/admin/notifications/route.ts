import { z } from "zod";
import { requireOwner } from "@/lib/backend/auth";
import { database } from "@/lib/backend/db";
import { body, failure, json, sameOrigin } from "@/lib/backend/http";
import { deliverNotification } from "@/lib/backend/notifications";
import { limit } from "@/lib/backend/limits";
export async function GET(request: Request) {
  try {
    await requireOwner();
    const page = Math.floor(
      Math.max(
        0,
        Math.min(
          10000,
          Number(new URL(request.url).searchParams.get("page")) || 0,
        ),
      ),
    );
    const { data, error, count } = await database()
      .from("line_notifications")
      .select("*, service_requests(ticket_code,customer_name)", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(page * 25, page * 25 + 24);
    if (error) throw error;
    return json({ notifications: data, count, page });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const { user } = await requireOwner();
    await limit(`notify:${user.id}`, 20, 3600);
    const { requestId } = z
      .object({ requestId: z.uuid() })
      .parse(await body(request));
    return json({
      success: true,
      notification: await deliverNotification(requestId),
    });
  } catch (error) {
    return failure(error);
  }
}
