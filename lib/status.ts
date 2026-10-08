import { db } from "./supabase";

// The ONLY place complaint status changes. Plain code controls status, not AI.
export async function setStatus(id: string, status: string) {
  await db.from("complaints").update({ status }).eq("id", id);
  await db.from("status_events").insert({ complaint_id: id, status });
}
