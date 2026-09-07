import { z } from "zod";
import { authClient, isOwner, requireOwner } from "@/lib/backend/auth";
import { body, failure, HttpError, json, sameOrigin } from "@/lib/backend/http";
import { limit, requestIp } from "@/lib/backend/limits";
export async function GET() {
  try {
    const { user } = await requireOwner();
    return json({ email: user.email });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await limit(`login:${requestIp(request)}`, 15, 900);
    const input = z
      .object({ email: z.email().max(254).transform(value => value.toLowerCase()), password: z.string().min(1).max(200) })
      .parse(await body(request));
    await limit(`login-account:${input.email}`, 10, 900);
    const client = await authClient(),
      { data, error } = await client.auth.signInWithPassword(input);
    if (error || !data.user)
      throw new HttpError(401, "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    if (!(await isOwner(data.user.id))) {
      await client.auth.signOut({ scope: "local" });
      throw new HttpError(403, "บัญชีนี้ไม่มีสิทธิ์จัดการร้าน");
    }
    return json({ success: true, email: data.user.email });
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    const client = await authClient();
    await client.auth.signOut({ scope: "local" });
    return json({ success: true });
  } catch (error) {
    return failure(error);
  }
}
