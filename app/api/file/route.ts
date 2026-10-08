import { db } from "@/lib/supabase";
import { setStatus } from "@/lib/status";

const SLA_HOURS = 72;

export async function POST(req: Request) {
  const b = await req.json();
  const deadline = new Date(Date.now() + SLA_HOURS * 3600 * 1000).toISOString();

  const { data: c, error } = await db.from("complaints").insert({
    photo_url: b.photo_url ?? null,
    lat: b.lat ?? null,
    lng: b.lng ?? null,
    ward: b.ward ?? "LB Nagar",
    category: b.category ?? "garbage",
    severity: b.severity ?? null,
    description: b.description ?? null,
    telegram_chat_id: b.telegram_chat_id ?? null,
    status: "SUBMITTED",
    sla_deadline: deadline,
  }).select().single();
  if (error || !c) return Response.json({ error: error?.message }, { status: 500 });
  await db.from("status_events").insert({ complaint_id: c.id, status: "SUBMITTED" });

  const portalId = `GHMC-${Date.now().toString().slice(-7)}`;
  await db.from("portal_complaints").insert({ id: portalId, complaint_id: c.id, status: "ACKNOWLEDGED" });
  await db.from("complaints").update({ portal_id: portalId }).eq("id", c.id);
  await setStatus(c.id, "ACKNOWLEDGED");

  return Response.json({ id: c.id, portal_id: portalId });
}
