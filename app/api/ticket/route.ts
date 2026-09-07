import { body, failure, json, sameOrigin } from "@/lib/backend/http";
import { createJob } from "@/lib/backend/jobs";
import { deliverNotification } from "@/lib/backend/notifications";
import { limit, requestIp } from "@/lib/backend/limits";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await limit(`intake:${requestIp(request)}`, 30, 3600);
    const { job, created } = await createJob(await body(request), "web");
    let lineSent = false;
    if (created) {
      try {
        lineSent = (await deliverNotification(job.id)).status === "accepted";
      } catch {
        /* Job and notification are already saved. */
      }
    }
    return json(
      {
        success: true,
        ticketId: job.ticket_code,
        createdAt: job.created_at,
        lineSent,
        message: "บันทึกคำขอแล้ว ร้านจะตรวจสอบและติดต่อกลับ",
      },
      created ? 201 : 200,
    );
  } catch (error) {
    return failure(error);
  }
}
