import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { SERVICE_GROUPS } from "../lib/services";
loadEnvConfig(process.cwd());
async function main() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );
  const rows = SERVICE_GROUPS.flatMap((g, gi) =>
    g.services.map((name, i) => ({
      id: `${g.id}-${i + 1}`,
      group_id: g.id,
      name,
      description: "",
      price: null,
      active: true,
      sort_order: gi * 100 + i,
    })),
  );
  const { error: seedError } = await db
    .from("shop_services")
    .upsert(rows, { onConflict: "id", ignoreDuplicates: true });
  if (seedError) throw seedError;
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw Error("Pass the owner email as the first argument");
  let owner;
  for (let page = 1; page <= 100; page++) {
    const { data, error } = await db.auth.admin.listUsers({
      page,
      perPage: 100,
    });
    if (error) throw error;
    owner = data.users.find((u) => u.email?.toLowerCase() === email);
    if (owner || data.users.length < 100) break;
  }
  if (!owner) {
    const { data, error } = await db.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (error) throw error;
    owner = data.user;
  }
  if (!owner) throw Error("Owner unavailable");
  const { error: roleError } = await db
    .from("shop_admins")
    .upsert({ user_id: owner.id });
  if (roleError) throw roleError;
  const { data, error } = await db.auth.admin.generateLink({
    type: "recovery",
    email,
  });
  if (error) throw error;
  const url =
    "http://localhost:3000/admin/setup#token=" +
    encodeURIComponent(data.properties.hashed_token);
  writeFileSync(".env.owner-setup", url + "\n");
  console.log(
    JSON.stringify({ owner: email, services: rows.length, setupReady: true }),
  );
}
main().catch(() => {
  console.error("Provisioning failed");
  process.exitCode = 1;
});
