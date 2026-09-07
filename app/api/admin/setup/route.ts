import { z } from "zod";
import { authClient, isOwner } from "@/lib/backend/auth";
import { body, failure, HttpError, json, sameOrigin } from "@/lib/backend/http";
import { limit, requestIp } from "@/lib/backend/limits";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await limit(`setup:${requestIp(request)}`, 10, 900);
    const input = z
      .object({
        token: z.string().min(20).max(300),
        password: z.string().min(12).max(128),
      })
      .parse(await body(request));
    const client = await authClient(),
      { data, error } = await client.auth.verifyOtp({
        token_hash: input.token,
        type: "recovery",
      });
    if (error || !data.user)
      throw new HttpError(400, "ลิงก์ตั้งรหัสผ่านหมดอายุหรือใช้ไปแล้ว");
    if (!(await isOwner(data.user.id))) {
      await client.auth.signOut({ scope: "local" });
      throw new HttpError(403, "ไม่มีสิทธิ์จัดการร้าน");
    }
    const { error: updateError } = await client.auth.updateUser({
      password: input.password,
    });
    if (updateError)
      throw new HttpError(
        400,
        "ตั้งรหัสผ่านไม่สำเร็จ กรุณาใช้รหัสที่คาดเดายาก",
      );
    return json({ success: true });
  } catch (error) {
    return failure(error);
  }
}
