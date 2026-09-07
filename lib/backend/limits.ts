import "server-only";
import { createHash } from "node:crypto";
import { database } from "./db";
import { HttpError } from "./http";
import { clientIp } from "../request-security";
export async function limit(value: string, max: number, seconds: number) {
  const key = createHash("sha256").update(value).digest("hex");
  const { data, error } = await database().rpc("shop_consume_limit", {
    p_key: key,
    p_max: max,
    p_seconds: seconds,
  });
  if (error) throw error;
  if (!data)
    throw new HttpError(429, "ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่");
}
export const requestIp = (request: Request) =>
  clientIp(request, process.env.TRUSTED_CLIENT_IP_HEADER);
