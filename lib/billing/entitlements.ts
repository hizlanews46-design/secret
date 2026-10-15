import { createHmac, timingSafeEqual } from "node:crypto";

export type Plan = "free" | "pro" | "enterprise";
export type Entitlement = "vault" | "connectors" | "cli" | "advanced_integrations";

const grants: Record<Plan, readonly Entitlement[]> = { free: ["vault"], pro: ["vault", "connectors", "cli"], enterprise: ["vault", "connectors", "cli", "advanced_integrations"] };
export function hasEntitlement(plan: Plan, entitlement: Entitlement) { return grants[plan].includes(entitlement); }
export function billingEnabled() { return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET); }
export function verifyStripeSignature(payload: string, signature: string, secret: string, toleranceSeconds = 300) {
  const values = Object.fromEntries(signature.split(",").map((part) => part.split("=", 2) as [string, string]));
  const timestamp = Number(values.t);
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds || !values.v1) return false;
  const expected = createHmac("sha256", secret).update(`${values.t}.${payload}`).digest("hex");
  const actual = Buffer.from(values.v1, "utf8"); const wanted = Buffer.from(expected, "utf8");
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
}
