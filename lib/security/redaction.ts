const SECRET_KEY = /(key|token|secret|password|credential|authorization|cookie|private)/i;

export function redactSecrets(value: unknown): unknown {
  if (typeof value === "string") return value.length > 0 ? "[REDACTED]" : value;
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, SECRET_KEY.test(key) ? "[REDACTED]" : redactSecrets(item)]));
  }
  return value;
}

export function safeLog(event: string, metadata: Record<string, unknown> = {}) {
  console.info(JSON.stringify({ event, ...redactSecrets(metadata) as Record<string, unknown> }));
}
