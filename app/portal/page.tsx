"use client";
import { useEffect, useState } from "react";

type Row = {
  id: string;
  status: string;
  after_photo_url: string | null;
  complaints: { description: string; ward: string } | null;
};

export default function Portal() {
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");

  const load = async () => setRows(await (await fetch("/api/portal")).json());
  useEffect(() => { load(); }, []);

  async function act(id: string, action: string, file?: File) {
    let after_photo_url: string | undefined;
    if (file) {
      const fd = new FormData();
      fd.append("file", file);
      after_photo_url = (await (await fetch("/api/upload", { method: "POST", body: fd })).json()).url;
    }
    await fetch("/api/portal", { method: "POST", body: JSON.stringify({ id, action, after_photo_url }) });
    load();
  }
  async function time(hours: number) {
    const r = await (await fetch("/api/time", { method: "POST", body: JSON.stringify({ hours }) })).json();
    setMsg(`Clock offset: ${r.offset}h`);
  }
  async function reset() {
    await fetch("/api/reset", { method: "POST" });
    setMsg("Demo reset done");
    load();
  }
  async function track() {
    const r = await (await fetch("/api/track")).json();
    setMsg(JSON.stringify(r.changes));
    load();
  }

  return (
    <main className="mx-auto max-w-2xl p-4 space-y-4">
      <h1 className="text-2xl font-bold">Mock City Portal (Officer)</h1>

      <div className="flex flex-wrap gap-2 rounded border p-3">
        <button className="rounded bg-black px-3 py-1 text-white" onClick={() => time(24)}>Time Machine +1 day</button>
        <button className="rounded bg-black px-3 py-1 text-white" onClick={() => time(168)}>Time Machine +7 days</button>
        <button className="rounded bg-gray-600 px-3 py-1 text-white" onClick={track}>Run tracker now</button>
        <button className="rounded bg-red-600 px-3 py-1 text-white" onClick={reset}>Demo Reset</button>
        <span className="text-sm">{msg}</span>
      </div>

      {rows.length === 0 && <p>No complaints on the portal yet.</p>}
      {rows.map((r) => (
        <div key={r.id} className="rounded border p-3 space-y-2">
          <div className="font-mono text-sm">{r.id} · <b>{r.status}</b></div>
          <div>{r.complaints?.description} ({r.complaints?.ward})</div>
          {r.after_photo_url && <img src={r.after_photo_url} alt="after" className="h-32 rounded" />}
          {r.status !== "RESOLVED" && (
            <div className="flex flex-wrap items-center gap-2">
              <button className="rounded border px-3 py-1" onClick={() => act(r.id, "in_progress")}>Mark In Progress</button>
              <label className="text-sm">
                Resolve with after-photo:{" "}
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && act(r.id, "resolve", e.target.files[0])} />
              </label>
            </div>
          )}
        </div>
      ))}
    </main>
  );
}
