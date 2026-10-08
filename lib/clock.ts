import { db } from "./supabase";

export async function getOffsetHours(): Promise<number> {
  const { data } = await db.from("app_settings").select("value").eq("key", "time_offset_hours").single();
  return Number(data?.value ?? 0);
}

// "Demo now" = real time + Time Machine offset
export async function nowDemo(): Promise<Date> {
  const off = await getOffsetHours();
  return new Date(Date.now() + off * 3600 * 1000);
}
