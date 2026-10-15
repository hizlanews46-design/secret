"use client";

import { useState } from "react";
import { createGithubConnector, createVercelConnector } from "@/src/connectors/adapters";
import type { ConnectorHealth } from "@/src/connectors/spec";

const enabled = process.env.NEXT_PUBLIC_ENABLE_CONNECTORS === "true";

export function ConnectorPanel() {
  const [provider, setProvider] = useState<"github" | "vercel">("github");
  const [token, setToken] = useState("");
  const [target, setTarget] = useState("");
  const [health, setHealth] = useState<ConnectorHealth | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (!enabled) return null;

  async function connect() {
    if (!token.trim() || !target.trim()) return setMessage("Enter a session token and approved target.");
    setBusy(true); setMessage(""); setHealth(null);
    try {
      const adapter = provider === "github" ? createGithubConnector({ token, owner: target.split("/")[0], repo: target.split("/")[1] ?? "" }) : createVercelConnector({ token, projectIdOrName: target });
      setHealth(await adapter.test());
      setMessage("Connected for this tab only. The token is not persisted.");
      setToken("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Connection failed."); }
    finally { setBusy(false); }
  }

  return <section className="rounded-3xl border border-line bg-white p-6"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-emerald-700">BYO provider</p><h2 className="mt-2 text-2xl font-semibold">Connect securely</h2></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${health?.ok ? "bg-mint text-emerald-800" : "bg-[#f1f3f2] text-ink/55"}`}>{health?.ok ? "Healthy" : "Not connected"}</span></div><p className="mt-3 text-sm leading-6 text-ink/60">Tokens remain in memory for this tab and are cleared after use. Vaultline sends ciphertext or metadata only; it never sends your decrypted secret.</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><select value={provider} onChange={(event) => setProvider(event.target.value as "github" | "vercel")} className="rounded-xl border border-line px-3 py-2"><option value="github">GitHub repository</option><option value="vercel">Vercel project</option></select><input type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder="PAT / OAuth token" autoComplete="off" className="rounded-xl border border-line px-3 py-2" /><input value={target} onChange={(event) => setTarget(event.target.value)} placeholder={provider === "github" ? "owner/repository" : "project name or ID"} className="rounded-xl border border-line px-3 py-2" /></div><button onClick={connect} disabled={busy} className="mt-4 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Testing…" : "Connect"}</button>{health && <p className="mt-4 rounded-xl bg-mint p-3 text-sm text-emerald-800">{health.detail} Subject: {health.subject}.</p>}{message && !health && <p className="mt-4 rounded-xl bg-[#f4f8f5] p-3 text-sm text-ink/70">{message}</p>}</section>;
}
