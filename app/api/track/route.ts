import { db } from "@/lib/supabase";
import { nowDemo } from "@/lib/clock";
import { setStatus } from "@/lib/status";

export async function GET() {
  const now = await nowDemo();
  const { data: list } = await db
    .from("complaints").select("*")
    .in("status", ["ACKNOWLEDGED", "IN_PROGRESS", "SLA_BREACHED", "ESCALATED"]);

  const changes: string[] = [];
  for (const c of list ?? []) {
    const { data: p } = await db.from("portal_complaints").select("*").eq("id", c.portal_id).single();
    let status: string = c.status;

    if (p?.status === "RESOLVED") status = "RESOLVED_PENDING_VERIFICATION";
    else if (p?.status === "IN_PROGRESS" && status === "ACKNOWLEDGED") status = "IN_PROGRESS";

    if (["ACKNOWLEDGED", "IN_PROGRESS"].includes(status) && c.sla_deadline && now > new Date(c.sla_deadline)) {
      status = "SLA_BREACHED";
    }

    if (status !== c.status) {
      await setStatus(c.id, status);
      changes.push(`${c.id}: ${c.status} -> ${status}`);
    }
  }
  return Response.json({ now, changes });
}
