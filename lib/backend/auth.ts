import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { database } from "./db";
import { HttpError } from "./http";
export async function authClient() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) =>
          values.forEach(({ name, value, options }) =>
            jar.set(name, value, { ...options, httpOnly: true }),
          ),
      },
    },
  );
}
export async function isOwner(id: string) {
  const { data, error } = await database()
    .from("shop_admins")
    .select("user_id")
    .eq("user_id", id)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}
export async function requireOwner() {
  const auth = await authClient();
  const {
    data: { user },
    error,
  } = await auth.auth.getUser();
  if (error || !user) throw new HttpError(401, "กรุณาเข้าสู่ระบบ");
  if (!(await isOwner(user.id)))
    throw new HttpError(403, "บัญชีนี้ไม่มีสิทธิ์จัดการร้าน");
  return { auth, user };
}
