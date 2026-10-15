"use client";

import { useState } from "react";

const enabled = process.env.NEXT_PUBLIC_ENABLE_AUTH_SETUP_GUIDE === "true";
const tasks = [
  { id: "google", name: "Google OAuth", url: "https://console.cloud.google.com/auth/overview", callback: "https://tqzchcbbkwycjhaegmgi.supabase.co/auth/v1/callback" },
  { id: "github", name: "GitHub OAuth", url: "https://github.com/settings/developers", callback: "https://tqzchcbbkwycjhaegmgi.supabase.co/auth/v1/callback" },
  { id: "supabase", name: "Supabase Auth redirects", url: "https://supabase.com/dashboard/project/tqzchcbbkwycjhaegmgi/auth/url-configuration", callback: "https://secret-iota-ten.vercel.app/auth/callback" },
];

export function AuthorizationCard() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  if (!enabled) return null;
  return <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6"><p className="text-sm font-bold uppercase tracking-[.18em] text-amber-800">Authorization required</p><h2 className="mt-2 text-2xl font-semibold">Finish provider setup</h2><p className="mt-3 text-sm leading-6 text-amber-950/70">Open each console yourself. Never paste client secrets or tokens into this page or chat. After saving, test the provider from `/login`.</p><div className="mt-5 space-y-3">{tasks.map((task) => <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 p-4"><div><p className="font-semibold">{task.name}</p><p className="mt-1 break-all text-xs text-amber-950/60">Callback: {task.callback}</p></div><div className="flex items-center gap-3"><a href={task.url} target="_blank" rel="noreferrer" className="rounded-xl border border-amber-300 px-3 py-2 text-sm font-semibold">Open console</a><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={Boolean(done[task.id])} onChange={(event) => setDone((current) => ({ ...current, [task.id]: event.target.checked }))} />Done</label></div></div>)}</div></section>;
}
