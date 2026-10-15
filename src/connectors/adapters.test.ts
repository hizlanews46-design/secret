import { describe, expect, it } from "vitest";
import { createGithubConnector } from "./adapters";
import { assertClientOnlyToken, encryptedRefSchema } from "./spec";

describe("connector safety contract", () => {
  it("requires a browser session for provider tokens", () => {
    expect(() => assertClientOnlyToken("token")).toThrow("browser session");
  });

  it("accepts ciphertext refs but rejects plaintext-shaped refs", () => {
    expect(encryptedRefSchema.parse({ provider: "github", name: "API_KEY", ciphertext: "opaque-ciphertext", metadata: {} }).ciphertext).toBe("opaque-ciphertext");
    expect(() => encryptedRefSchema.parse({ provider: "github", name: "API_KEY", plaintext: "secret" })).toThrow();
  });

  it("does not create a provider adapter outside the browser", () => {
    expect(() => createGithubConnector({ token: "token", owner: "owner", repo: "repo" })).toThrow("browser session");
  });
});
