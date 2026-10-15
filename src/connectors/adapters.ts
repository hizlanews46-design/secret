import { assertClientOnlyToken, assertEncryptedRef, ConnectorError, type ConnectorAdapter, type ConnectorHealth, type ConnectorItem, type EncryptedRef } from "./spec";

type RequestOptions = { method?: string; body?: unknown };

async function requestJson<T>(url: string, token: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(url, { method: options.method ?? "GET", headers: { Accept: "application/json", Authorization: `Bearer ${token}`, ...(options.body ? { "Content-Type": "application/json" } : {}) }, body: options.body ? JSON.stringify(options.body) : undefined });
  if (!response.ok) throw new ConnectorError(`Provider request failed with HTTP ${response.status}.`, response.status);
  return response.status === 204 ? (undefined as T) : response.json() as Promise<T>;
}

export function createGithubConnector(input: { token: string; owner: string; repo: string }): ConnectorAdapter {
  const token = assertClientOnlyToken(input.token);
  const base = `https://api.github.com/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/actions/secrets`;
  return {
    kind: "github",
    async test(): Promise<ConnectorHealth> {
      const user = await requestJson<{ login?: string }>("https://api.github.com/user", token);
      return { ok: true, provider: "github", subject: user.login ?? input.owner, detail: "GitHub token accepted for the current browser session." };
    },
    async pull(): Promise<ConnectorItem[]> {
      const result = await requestJson<{ secrets?: Array<{ name?: string; updated_at?: string }> }>(base, token);
      return (result.secrets ?? []).map((secret) => ({ provider: "github", name: secret.name ?? "unknown", updatedAt: secret.updated_at ?? null, metadata: { repository: `${input.owner}/${input.repo}`, values: "not-returned" } }));
    },
    async push(ref: EncryptedRef): Promise<ConnectorItem> {
      const safe = assertEncryptedRef(ref);
      if (safe.provider !== "github" || !safe.keyId) throw new ConnectorError("GitHub push requires a GitHub public-key id and ciphertext; plaintext is never accepted.");
      await requestJson<void>(`${base}/${encodeURIComponent(safe.name)}`, token, { method: "PUT", body: { encrypted_value: safe.ciphertext, key_id: safe.keyId } });
      return { provider: "github", name: safe.name, updatedAt: new Date().toISOString(), metadata: { repository: `${input.owner}/${input.repo}`, values: "ciphertext-only" } };
    },
    async revoke(item): Promise<void> {
      if (item.provider !== "github") throw new ConnectorError("Provider mismatch.");
      await requestJson<void>(`${base}/${encodeURIComponent(item.name)}`, token, { method: "DELETE" });
    },
  };
}

export function createVercelConnector(input: { token: string; projectIdOrName: string }): ConnectorAdapter {
  const token = assertClientOnlyToken(input.token);
  const base = `https://api.vercel.com/v9/projects/${encodeURIComponent(input.projectIdOrName)}/env`;
  return {
    kind: "vercel",
    async test(): Promise<ConnectorHealth> {
      const user = await requestJson<{ user?: { username?: string; email?: string } }>("https://api.vercel.com/v2/user", token);
      return { ok: true, provider: "vercel", subject: user.user?.username ?? user.user?.email ?? "vercel-user", detail: "Vercel token accepted for the current browser session." };
    },
    async pull(): Promise<ConnectorItem[]> {
      const result = await requestJson<{ envs?: Array<{ key?: string; updatedAt?: number; target?: string[] }> }>(base, token);
      return (result.envs ?? []).map((env) => ({ provider: "vercel", name: env.key ?? "unknown", updatedAt: env.updatedAt ? new Date(env.updatedAt).toISOString() : null, metadata: { project: input.projectIdOrName, target: (env.target ?? []).join(","), values: "not-returned" } }));
    },
    async push(ref: EncryptedRef): Promise<ConnectorItem> {
      const safe = assertEncryptedRef(ref);
      if (safe.provider !== "vercel") throw new ConnectorError("Provider mismatch.");
      await requestJson<void>(base, token, { method: "POST", body: { key: safe.name, value: safe.ciphertext, type: "encrypted", target: ["production", "preview", "development"], comment: "Vaultline ciphertext; plaintext is never sent." } });
      return { provider: "vercel", name: safe.name, updatedAt: new Date().toISOString(), metadata: { project: input.projectIdOrName, values: "ciphertext-only" } };
    },
    async revoke(item): Promise<void> {
      if (item.provider !== "vercel") throw new ConnectorError("Provider mismatch.");
      const result = await requestJson<{ envs?: Array<{ id?: string; key?: string }> }>(base, token);
      const match = (result.envs ?? []).find((env) => env.key === item.name);
      if (!match?.id) throw new ConnectorError("Vercel environment variable was not found.");
      await requestJson<void>(`${base}/${encodeURIComponent(match.id)}`, token, { method: "DELETE" });
    },
  };
}
