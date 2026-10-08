import { db } from "@/lib/supabase";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return Response.json({ error: "no file" }, { status: 400 });
  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const { error } = await db.storage.from("photos").upload(path, file, { contentType: file.type });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const { data } = db.storage.from("photos").getPublicUrl(path);
  return Response.json({ url: data.publicUrl });
}
