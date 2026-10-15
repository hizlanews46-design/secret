import { z } from "zod";

export const connectorKindSchema = z.enum(["github", "vercel"]);
export type ConnectorKind = z.infer<typeof connectorKindSchema>;

export const connectorTokenSchema = z.string().min(1).max(4096);

export const encryptedRefSchema = z.object({
  provider: connectorKindSchema,
  name: z.string().regex(/^[A-Za-z_][A-Za-z0-9_./-]{0,127}$/),
  ciphertext: z.string().min(1).max(65536),
  keyId: z.string().max(512).optional(),
  metadata: z.record(z.string().max(512)).default({}),
}).strict();
export type EncryptedRef = z.infer<typeof encryptedRefSchema>;

export const connectorHealthSchema = z.object({
  ok: z.boolean(),
  provider: connectorKindSchema,
  subject: z.string().max(256),
  detail: z.string().max(512),
}).strict();
export type ConnectorHealth = z.infer<typeof connectorHealthSchema>;

export const connectorItemSchema = z.object({
  provider: connectorKindSchema,
  name: z.string().max(256),
  updatedAt: z.string().max(128).nullable(),
  metadata: z.record(z.string().max(512)).default({}),
}).strict();
export type ConnectorItem = z.infer<typeof connectorItemSchema>;

export interface ConnectorAdapter {
  readonly kind: ConnectorKind;
  test(): Promise<ConnectorHealth>;
  push(encryptedRef: EncryptedRef): Promise<ConnectorItem>;
  pull(): Promise<ConnectorItem[]>;
  revoke(item: Pick<EncryptedRef, "name" | "provider">): Promise<void>;
}

export class ConnectorError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "ConnectorError";
  }
}

export function assertClientOnlyToken(token: string): string {
  if (typeof window === "undefined") throw new ConnectorError("Connector tokens may only be used in a browser session.");
  return connectorTokenSchema.parse(token);
}

export function assertEncryptedRef(ref: EncryptedRef): EncryptedRef {
  return encryptedRefSchema.parse(ref);
}
