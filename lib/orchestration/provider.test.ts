import { describe, expect, it } from "vitest";
import { SandboxProviderAdapter } from "./provider";

describe("SandboxProviderAdapter", () => {
  const adapter = new SandboxProviderAdapter({
    id: "sandbox",
    name: "Sandbox provider",
    capabilities: ["manual-secret"],
    requiredVariables: ["API_KEY", "API_URL"],
  });

  it("requires a valid consent input and never contacts a provider", async () => {
    await expect(adapter.connect({ consentId: "consent_123456", redirectUri: "https://example.com/callback" })).resolves.toMatchObject({ status: "awaiting-user" });
    await expect(adapter.connect({ consentId: "short", redirectUri: "https://example.com/callback" })).rejects.toThrow();
  });

  it("reports missing variables without exposing values", async () => {
    await expect(adapter.validateVariables({ API_KEY: "secret" })).resolves.toEqual({ valid: false, missing: ["API_URL"], detail: "Missing 1 required variable(s)." });
  });
});
