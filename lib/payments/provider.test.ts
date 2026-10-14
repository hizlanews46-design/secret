import { describe, expect, it } from "vitest";
import { MockVirtualCardAdapter } from "./provider";

describe("mock virtual card provider", () => {
  it("never creates a live card and exposes a mock card", async () => {
    const provider = new MockVirtualCardAdapter();
    const card = await provider.createCard("Demo only");
    expect(provider.name).toBe("Mock adapter");
    expect(card.status).toBe("mock");
    expect(card.last4).toBe("4242");
  });
});
