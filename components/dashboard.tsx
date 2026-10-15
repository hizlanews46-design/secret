"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, Check, Eye, EyeOff, KeyRound, LockKeyhole, LogOut, Plus, ShieldCheck, Sparkles, Trash2, WalletCards, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { decryptValue, deriveKey, encryptValue, randomSalt, type EncryptedValue } from "@/lib/crypto/vault";
import { createMockWorkflow, serviceCatalog, type ServiceDefinition, type WorkflowRun } from "@/lib/orchestration/catalog";
import { MockVirtualCardAdapter, type VirtualCard } from "@/lib/payments/provider";
import { TrustChamber } from "@/components/trust-chamber";

type Row = { id: string; label: string; variable_name: string; encrypted_value: EncryptedValue; created_at: string; updated_at: string };

const statusLabel = { connected: "Connected", discovered: "Discovered", "not-connected": "Not connected" } as const;

export default function Dashboard({ email, userId }: { email: string; userId: string }) {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [passphrase, setPassphrase] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [label, setLabel] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
  const [activeService, setActiveService] = useState<ServiceDefinition | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [rlsHealthy, setRlsHealthy] = useState(true);

  useEffect(() => {
    supabase.from("user_vault").select("id,label,variable_name,encrypted_value,created_at,updated_at").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) { setRlsHealthy(false); setMessage(error.message); } else setRows((data ?? []) as Row[]);
    });
    supabase.from("workflow_runs").select("id,service_id,service_name,kind,status,detail,created_at").order("created_at", { ascending: false }).limit(20).then(({ data, error }) => {
      if (error) setRlsHealthy(false); else setWorkflows((data ?? []).map((row) => ({ id: row.id, serviceId: row.service_id, serviceName: row.service_name, kind: row.kind, status: row.status, detail: row.detail, createdAt: row.created_at })) as WorkflowRun[]);
    });
    new MockVirtualCardAdapter().listCards().then(setCards);
  }, []);

  const connectedCount = useMemo(() => serviceCatalog.filter((service) => service.status === "connected").length, []);

  async function unlock() {
    if (!passphrase.trim()) return;
    setBusy(true);
    try {
      if (rows[0]) await decryptValue(rows[0].encrypted_value, await deriveKey(passphrase, rows[0].encrypted_value.salt));
      setUnlocked(true);
      setMessage("Vault unlocked locally. The key is held only in this tab.");
    } catch { setMessage("Could not derive the vault key."); }
    setBusy(false);
  }

  async function add() {
    if (!unlocked || !label || !name || !value) return setMessage("Unlock the vault and complete all fields.");
    setBusy(true);
    const salt = randomSalt();
    const payload = await encryptValue(value, await deriveKey(passphrase, salt), salt);
    const { data, error } = await supabase.from("user_vault").insert({ user_id: userId, label, variable_name: name, encrypted_value: payload }).select("id,label,variable_name,encrypted_value,created_at,updated_at").single();
    if (error) setMessage(error.message); else {
      setRows((current) => [data as Row, ...current]);
      setLabel(""); setName(""); setValue("");
      setMessage("Encrypted variable saved.");
    }
    setBusy(false);
  }

  async function reveal(row: Row) {
    if (!unlocked) return setMessage("Unlock the vault first.");
    if (revealed[row.id]) return setRevealed((current) => ({ ...current, [row.id]: "" }));
    try {
      setRevealed((current) => ({ ...current, [row.id]: "decrypting…" }));
      const plain = await decryptValue(row.encrypted_value, await deriveKey(passphrase, row.encrypted_value.salt));
      setRevealed((current) => ({ ...current, [row.id]: plain }));
    } catch {
      setMessage("Unable to decrypt. Check your passphrase.");
      setRevealed((current) => ({ ...current, [row.id]: "" }));
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this encrypted variable?")) return;
    const { error } = await supabase.from("user_vault").delete().eq("id", id);
    if (!error) setRows((current) => current.filter((row) => row.id !== id)); else setMessage(error.message);
  }

  async function stageWorkflow(service: ServiceDefinition, kind: WorkflowRun["kind"]) {
    const workflow = createMockWorkflow(service, kind);
    const { data, error } = await supabase.from("workflow_runs").insert({ user_id: userId, service_id: service.id, service_name: service.name, kind, status: workflow.status, detail: workflow.detail }).select("id,service_id,service_name,kind,status,detail,created_at").single();
    const persisted = data ? { id: data.id, serviceId: data.service_id, serviceName: data.service_name, kind: data.kind, status: data.status, detail: data.detail, createdAt: data.created_at } as WorkflowRun : workflow;
    setWorkflows((current) => [persisted, ...current]);
    if (!error) await supabase.from("audit_events").insert({ user_id: userId, action: `workflow.${kind}.staged`, resource_type: "workflow_run", resource_id: persisted.id, metadata: { service_id: service.id } });
    setActiveService(null);
    setMessage(error ? `Workflow preview staged locally; apply the orchestration migration to persist it.` : `${service.name} ${kind} staged. Nothing is sent to the provider.`);
  }

  return <main className="grain min-h-screen">
    <header className="border-b border-line bg-white/80"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><div className="flex items-center gap-3 font-bold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lime">V</span>Vaultline <span className="hidden rounded-full bg-lime px-2 py-1 text-[10px] font-bold uppercase tracking-widest sm:inline">MVP</span></div><div className="flex items-center gap-4 text-sm text-ink/60"><span>{email}</span><button onClick={() => supabase.auth.signOut().then(() => location.assign("/login"))} className="flex items-center gap-2 font-semibold text-ink"><LogOut size={16} /> Sign out</button></div></div></header>
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-700">Private workspace</p><h1 className="mt-3 text-5xl font-semibold tracking-[-.05em]">Control your integrations.</h1><p className="mt-3 max-w-2xl text-ink/60">Discover service footprints, stage consent-based workflows, and keep every secret encrypted before it reaches Supabase.</p></div><div className="flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-sm font-semibold"><ShieldCheck size={17} /> Client encrypted</div></div>
      <TrustChamber state={{ rlsHealthy, pendingRotations: workflows.filter((workflow) => workflow.status === "awaiting-consent" || workflow.status === "queued").length, vaultIntegrity: unlocked ? "verified" : "sealed" }} label="Workspace trust chamber" /><section className="mt-8 grid gap-4 md:grid-cols-3"><div className="rounded-3xl bg-ink p-5 text-white"><p className="text-sm text-white/60">Connected services</p><p className="mt-3 text-4xl font-semibold">{connectedCount}<span className="text-lg text-white/40"> / {serviceCatalog.length}</span></p><p className="mt-2 text-xs text-lime">Consent-first access</p></div><div className="rounded-3xl border border-line bg-white p-5"><p className="text-sm text-ink/60">Encrypted variables</p><p className="mt-3 text-4xl font-semibold">{rows.length}</p><p className="mt-2 text-xs text-emerald-700">Opaque ciphertext at rest</p></div><div className="rounded-3xl border border-line bg-white p-5"><p className="text-sm text-ink/60">Workflow queue</p><p className="mt-3 text-4xl font-semibold">{workflows.length}</p><p className="mt-2 text-xs text-amber-700">Human approval required</p></div></section>
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div className="rounded-3xl border border-line bg-white"><div className="flex items-center justify-between border-b border-line px-6 py-5"><div><h2 className="font-semibold">Service catalog</h2><p className="mt-1 text-sm text-ink/50">Safe previews only — no automated login or scraping.</p></div><Sparkles size={19} className="text-emerald-700" /></div><div className="divide-y divide-line">{serviceCatalog.map((service) => <div key={service.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"><div className="flex items-center gap-4"><span className="grid h-10 w-10 place-items-center rounded-2xl text-sm font-bold text-white" style={{ backgroundColor: service.color }}>{service.name.slice(0, 1)}</span><div><div className="flex items-center gap-2"><p className="font-semibold">{service.name}</p><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${service.status === "connected" ? "bg-mint text-emerald-800" : service.status === "discovered" ? "bg-amber-50 text-amber-800" : "bg-[#f1f3f2] text-ink/50"}`}>{statusLabel[service.status]}</span></div><p className="mt-1 text-sm text-ink/55">{service.description}</p></div></div><button onClick={() => setActiveService(service)} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold hover:bg-[#f4f8f5]">Manage <ArrowUpRight size={15} /></button></div>)}</div></div>
        <div className="rounded-3xl border border-line bg-white p-6"><div className="flex items-center gap-3"><Activity size={20} /><h2 className="font-semibold">Workflow queue</h2></div><p className="mt-3 text-sm leading-6 text-ink/60">Requests pause at the consent boundary. Real provider adapters can be added later without changing the vault.</p>{workflows.length === 0 ? <div className="mt-6 rounded-2xl bg-[#f4f8f5] p-5 text-sm text-ink/55">No staged workflows. Open a service to preview discovery or provisioning.</div> : <div className="mt-6 space-y-3">{workflows.slice(0, 4).map((workflow) => <div key={workflow.id} className="rounded-2xl border border-line p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{workflow.serviceName} · {workflow.kind}</p><span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-800">{workflow.status}</span></div><p className="mt-2 text-xs leading-5 text-ink/55">{workflow.detail}</p></div>)}</div>}</div></section>
      <section className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><div className="rounded-3xl border border-line bg-white p-6"><div className="flex items-center gap-3"><LockKeyhole size={20} /><h2 className="font-semibold">Local vault lock</h2></div><p className="mt-3 text-sm leading-6 text-ink/60">Your passphrase never persists or leaves this tab. Argon2id derives the AES-256-GCM key locally.</p><div className="mt-5 flex gap-2"><input type="password" value={passphrase} onChange={(event) => setPassphrase(event.target.value)} placeholder="Vault passphrase" className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2" /><button onClick={unlock} disabled={busy} className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white">{unlocked ? "Unlocked" : "Unlock"}</button></div>{message && <p className="mt-4 rounded-xl bg-mint p-3 text-sm text-emerald-800">{message}</p>}</div><div className="rounded-3xl border border-line bg-white p-6"><div className="flex items-center gap-3"><Plus size={20} /><h2 className="font-semibold">Add an integration variable</h2></div><div className="mt-5 grid gap-3 md:grid-cols-3"><input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Label e.g. Production API" className="rounded-xl border border-line px-3 py-2" /><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Variable name" className="rounded-xl border border-line px-3 py-2" /><input type="password" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Secret value" className="rounded-xl border border-line px-3 py-2" /></div><button onClick={add} disabled={busy || !unlocked} className="mt-4 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Encrypt & save</button></div></section>
      <section className="mt-8 rounded-3xl border border-line bg-white"><div className="flex items-center justify-between border-b border-line px-6 py-5"><div><h2 className="font-semibold">Saved variables <span className="ml-2 rounded-full bg-[#f0f5f1] px-2 py-1 text-xs">{rows.length}</span></h2><p className="mt-1 text-sm text-ink/50">Reveal is local-only and requires the vault key.</p></div><KeyRound size={19} className="text-emerald-700" /></div>{rows.length === 0 ? <div className="px-6 py-16 text-center text-ink/50">No variables yet. Unlock your vault and add the first one.</div> : <div className="divide-y divide-line">{rows.map((row) => <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5" key={row.id}><div><p className="font-semibold">{row.label}</p><p className="mt-1 font-mono text-xs text-ink/50">{row.variable_name}</p></div><div className="flex items-center gap-4"><code className="max-w-[280px] truncate rounded-lg bg-[#f4f8f5] px-3 py-2 text-sm">{revealed[row.id] || "••••••••••••••••"}</code><button onClick={() => reveal(row)} className="rounded-lg p-2 hover:bg-[#f4f8f5]" aria-label="Reveal variable">{revealed[row.id] ? <EyeOff size={17} /> : <Eye size={17} />}</button><button onClick={() => remove(row.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete variable"><Trash2 size={17} /></button></div></div>)}</div>}</section>
      <section className="mt-8 rounded-3xl border border-dashed border-line bg-white/60 p-6"><div className="flex items-center gap-3"><WalletCards size={20} /><h2 className="font-semibold">Payment extension point</h2></div><p className="mt-2 max-w-3xl text-sm leading-6 text-ink/60">Card workflows are intentionally mock-only. The provider strategy is ready for a separately reviewed adapter; this MVP never creates cards, charges users, or stores payment details.</p><div className="mt-4 flex flex-wrap gap-3">{cards.map((card) => <span key={card.id} className="rounded-xl bg-[#f4f8f5] px-3 py-2 text-sm font-semibold">{card.label} · •••• {card.last4} <span className="ml-1 text-xs font-normal text-ink/50">({card.status})</span></span>)}</div></section>
    </div>
    {activeService && <div className="fixed inset-0 z-20 grid place-items-center bg-ink/30 p-6"><div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-emerald-700">Safe action preview</p><h2 className="mt-2 text-3xl font-semibold">{activeService.name}</h2></div><button onClick={() => setActiveService(null)} className="rounded-full p-2 hover:bg-[#f4f8f5]" aria-label="Close"><X size={19} /></button></div><p className="mt-4 text-sm leading-6 text-ink/60">Choose a mock workflow. The MVP does not connect to {activeService.name}, inspect inbox content, automate login, bypass MFA/CAPTCHA, or create an account.</p><div className="mt-6 grid gap-3"><button onClick={() => stageWorkflow(activeService, "discover")} className="flex items-center justify-between rounded-2xl border border-line p-4 text-left hover:bg-[#f4f8f5]"><span><span className="block font-semibold">Preview header discovery</span><span className="mt-1 block text-xs text-ink/50">Indexes only user-approved metadata in a future adapter.</span></span><ArrowUpRight size={17} /></button><button onClick={() => stageWorkflow(activeService, "provision")} className="flex items-center justify-between rounded-2xl border border-line p-4 text-left hover:bg-[#f4f8f5]"><span><span className="block font-semibold">Stage new connection</span><span className="mt-1 block text-xs text-ink/50">Creates a paused, consent-required workflow.</span></span><ArrowUpRight size={17} /></button><button onClick={() => stageWorkflow(activeService, "rotate")} className="flex items-center justify-between rounded-2xl border border-line p-4 text-left hover:bg-[#f4f8f5]"><span><span className="block font-semibold">Stage rotation</span><span className="mt-1 block text-xs text-ink/50">Leaves the current encrypted value untouched.</span></span><ArrowUpRight size={17} /></button></div><div className="mt-6 flex items-center gap-2 rounded-xl bg-mint p-3 text-xs text-emerald-900"><Check size={15} /> Every external action requires a future explicit approval step.</div></div></div>}
  </main>;
}
