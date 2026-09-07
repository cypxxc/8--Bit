import { requireOwner } from "@/lib/backend/auth";
import { database } from "@/lib/backend/db";
import { failure, json } from "@/lib/backend/http";
import { JOB_STATUSES } from "@/lib/backend/types";
export async function GET() {
  try {
    await requireOwner();
    const db = database();
    const counts = await Promise.all(
      Object.keys(JOB_STATUSES).map(async (status) => {
        const { count, error } = await db
          .from("service_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", status);
        if (error) throw error;
        return [status, count || 0];
      }),
    );
    return json({ counts: Object.fromEntries(counts) });
  } catch (error) {
    return failure(error);
  }
}
