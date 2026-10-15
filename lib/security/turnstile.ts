export type TurnstileResult = { ok: boolean; enabled: boolean; detail: string };
export async function verifyTurnstile(token: string, remoteip?: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, enabled: false, detail: "Turnstile is disabled; no challenge was requested." };
  if (!token) return { ok: false, enabled: true, detail: "A Turnstile token is required." };
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secret, response: token, remoteip }) });
  if (!response.ok) return { ok: false, enabled: true, detail: "Turnstile verification service returned an error." };
  const result = await response.json() as { success?: boolean };
  return result.success ? { ok: true, enabled: true, detail: "Turnstile verified." } : { ok: false, enabled: true, detail: "Turnstile verification failed." };
}
