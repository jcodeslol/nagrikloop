import { db } from "@/lib/supabase";

export async function GET() {
  const { data } = await db
    .from("portal_complaints")
    .select("*, complaints(description, ward, photo_url)")
    .order("updated_at", { ascending: false });
  return Response.json(data ?? []);
}

export async function POST(req: Request) {
  const { id, action, after_photo_url } = await req.json();
  const status = action === "resolve" ? "RESOLVED" : "IN_PROGRESS";
  await db.from("portal_complaints").update({
    status,
    after_photo_url: after_photo_url ?? null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  return Response.json({ ok: true });
}
