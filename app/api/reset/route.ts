import { db } from "@/lib/supabase";

export async function POST() {
  await db.from("complaints").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("app_settings").update({ value: "0" }).eq("key", "time_offset_hours");
  return Response.json({ ok: true });
}
