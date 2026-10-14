import { describe, expect, it, vi } from "vitest";
import { redactSecrets, safeLog } from "./redaction";

describe("secret redaction", () => {
  it("redacts secret-like fields recursively", () => {
    expect(redactSecrets({ token: "abc", nested: { password: "xyz", label: "safe" } })).toEqual({ token: "[REDACTED]", nested: { password: "[REDACTED]", label: "[REDACTED]" } });
  });

  it("never writes plaintext values through safeLog", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    safeLog("workflow.created", { apiKey: "secret-value", serviceId: "sandbox" });
    expect(spy.mock.calls[0]?.[0]).not.toContain("secret-value");
    spy.mockRestore();
  });
});
