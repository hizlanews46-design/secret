import { NextResponse } from "next/server";
import { billingEnabled, verifyStripeSignature } from "@/lib/billing/entitlements";

export async function POST(request: Request) {
  if (!billingEnabled()) return NextResponse.json({ status: "disabled", reason: "Stripe billing is not configured." }, { status: 503 });
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";
  if (!verifyStripeSignature(payload, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "")) return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  return NextResponse.json({ received: true, status: "recorded-no-op", detail: "Entitlement persistence requires an approved billing rollout." });
}
