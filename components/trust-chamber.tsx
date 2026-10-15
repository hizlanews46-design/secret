"use client";

import dynamic from "next/dynamic";

export type TrustState = {
  rlsHealthy: boolean;
  pendingRotations: number;
  vaultIntegrity: "sealed" | "verified" | "attention";
};

const enabled = process.env.NEXT_PUBLIC_ENABLE_3D_TRUST_LAYER === "true";

function StaticTrustFallback({ state, label }: { state: TrustState; label: string }) {
  const tone = state.vaultIntegrity === "attention" ? "border-amber-200 bg-amber-50" : state.rlsHealthy ? "border-emerald-100 bg-emerald-50" : "border-red-200 bg-red-50";
  return <div className={`trust-chamber-fallback rounded-3xl border p-5 ${tone}`} role="img" aria-label={`${label}: ${state.rlsHealthy ? "RLS healthy" : "RLS needs attention"}, ${state.pendingRotations} pending rotations, vault ${state.vaultIntegrity}`}><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[.18em] text-emerald-800">{label}</span><span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_6px_#10b98122]" /></div><div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-2xl bg-white/70 p-3"><strong className="block text-lg">{state.rlsHealthy ? "OK" : "—"}</strong>RLS</div><div className="rounded-2xl bg-white/70 p-3"><strong className="block text-lg">{state.pendingRotations}</strong>Rotations</div><div className="rounded-2xl bg-white/70 p-3"><strong className="block text-lg">{state.vaultIntegrity === "verified" ? "✓" : "•"}</strong>Vault</div></div></div>;
}

const LazyTrustScene = dynamic(() => import("./trust-scene"), { ssr: false, loading: () => <div className="trust-scene-loading" aria-hidden="true" /> });

export function TrustChamber({ state, label = "Sealed vault chamber" }: { state: TrustState; label?: string }) {
  if (!enabled) return null;
  return <div className="trust-chamber" data-testid="trust-chamber"><div className="hidden motion-safe:block motion-reduce:hidden"><LazyTrustScene state={state} label={label} /></div><div className="block motion-safe:hidden"><StaticTrustFallback state={state} label={label} /></div></div>;
}

export function TrustChamberFallback({ state, label = "Sealed vault chamber" }: { state: TrustState; label?: string }) {
  return <StaticTrustFallback state={state} label={label} />;
}
