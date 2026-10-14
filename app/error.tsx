"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="grain grid min-h-screen place-items-center px-6"><div className="max-w-md rounded-3xl border border-line bg-white p-8 text-center shadow-xl"><p className="text-sm font-bold uppercase tracking-[.2em] text-red-700">Something went wrong</p><h1 className="mt-3 text-3xl font-semibold">Your vault is still protected.</h1><p className="mt-3 text-sm leading-6 text-ink/60">No secret values were sent by this error state. Try again, or return to the dashboard.</p><div className="mt-6 flex justify-center gap-3"><button onClick={() => reset()} className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white">Try again</button><a href="/dashboard" className="rounded-xl border border-line px-4 py-2 text-sm font-semibold">Dashboard</a></div></div></main>;
}
