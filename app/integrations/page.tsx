"use client";

import Link from "next/link";
import { ConnectorPanel } from "@/components/connector-panel";

export default function Page() {
  return <main className="grain min-h-screen px-6 py-12"><div className="mx-auto max-w-4xl"><Link href="/" className="font-semibold text-emerald-700">← Vaultline</Link><h1 className="mt-10 text-5xl font-semibold tracking-tight">Integrations</h1><p className="mt-4 text-lg leading-8 text-ink/65">Review provider connections, health, scopes, and validation history.</p><div className="mt-10 grid gap-6"><ConnectorPanel /><section className="rounded-3xl border border-line bg-white p-6"><p className="leading-7 text-ink/65">The curated provider catalog and encrypted variable vault are live. Provider-specific OAuth refresh, expiry countdowns, and validation history require reviewed adapters. Connector tokens remain browser-only and are never persisted by this app.</p></section></div></div></main>;
}
