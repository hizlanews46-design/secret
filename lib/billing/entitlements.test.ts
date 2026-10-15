import { describe, expect, it } from "vitest";
import { hasEntitlement, verifyStripeSignature } from "./entitlements";

describe("billing safety boundaries", () => {
  it("keeps free entitlements narrow", () => {
    expect(hasEntitlement("free", "vault")).toBe(true);
    expect(hasEntitlement("free", "connectors")).toBe(false);
  });
  it("rejects malformed webhook signatures", () => {
    expect(verifyStripeSignature("{}", "", "test-secret")).toBe(false);
  });
});
