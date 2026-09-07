import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, unlinkSync } from "node:fs";
loadEnvConfig(process.cwd());
async function main() {
  const fixture = JSON.parse(readFileSync(".env.backend-test", "utf8"));
  if (
    !fixture.email.startsWith("8bit-check-") ||
    !fixture.email.endsWith("@example.invalid")
  )
    throw Error("Not a test fixture");
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );
  const { error: a } = await db
    .from("service_requests")
    .delete()
    .in("id", fixture.ids);
  if (a) throw a;
  const { error: b } = await db
    .from("shop_services")
    .delete()
    .eq("id", fixture.serviceId);
  if (b) throw b;
  const { error: c } = await db.auth.admin.deleteUser(fixture.userId);
  if (c) throw c;
  const { count, error: d } = await db
    .from("service_requests")
    .select("id", { count: "exact", head: true })
    .in("id", fixture.ids);
  if (d || count !== 0) throw Error("Cleanup verification failed");
  unlinkSync(".env.backend-test");
  console.log(
    "Temporary test jobs, notification logs, service and owner removed",
  );
}
main().catch(() => {
  console.error("Test cleanup incomplete");
  process.exitCode = 1;
});
