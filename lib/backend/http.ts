import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { validRequestOrigin } from "../request-security";
import { siteOrigin } from "../site";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function json(value: unknown, status = 200) {
  return NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
export function failure(error: unknown) {
  if (error instanceof HttpError)
    return json({ success: false, message: error.message }, error.status);
  if (error instanceof ZodError || error instanceof SyntaxError)
    return json({ success: false, message: "กรุณาตรวจสอบข้อมูลที่กรอก" }, 400);
  console.error(
    "Shop request failed",
    error instanceof Error ? error.name : "Database error",
  );
  return json(
    { success: false, message: "ระบบไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่" },
    503,
  );
}
export async function body(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json")
    throw new HttpError(415, "ต้องส่งข้อมูลแบบ JSON");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "ไม่มีข้อมูลคำขอ");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 20000) {
      await reader.cancel();
      throw new HttpError(413, "ข้อมูลยาวเกินกำหนด");
    }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
export function sameOrigin(request: Request) {
  if (!validRequestOrigin(request, siteOrigin()))
    throw new HttpError(403, "คำขอไม่ถูกต้อง");
}
