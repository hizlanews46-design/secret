import { z } from "zod";

export type ProviderCapability = "oauth" | "manual-secret" | "dynamic-registration" | "human-verification" | "rotation" | "revoke";

export type ProviderDefinition = {
  id: string;
  name: string;
  capabilities: readonly ProviderCapability[];
  requiredVariables: readonly string[];
};

export type ConnectInput = {
  consentId: string;
  redirectUri: string;
};

export type ConnectResult = {
  status: "redirect-required" | "connected" | "awaiting-user";
  authorizationUrl?: string;
  detail: string;
};

export type VariableValidationResult = {
  valid: boolean;
  missing: string[];
  detail: string;
};

export interface ProviderAdapter {
  readonly definition: ProviderDefinition;
  connect(input: ConnectInput): Promise<ConnectResult>;
  validateVariables(values: Record<string, string>): Promise<VariableValidationResult>;
}

const connectInputSchema = z.object({
  consentId: z.string().min(8),
  redirectUri: z.string().url(),
});

/** Safe sandbox adapter: never calls a provider or handles a real secret. */
export class SandboxProviderAdapter implements ProviderAdapter {
  readonly definition: ProviderDefinition;

  constructor(definition: ProviderDefinition) {
    this.definition = definition;
  }

  async connect(input: ConnectInput): Promise<ConnectResult> {
    connectInputSchema.parse(input);
    return {
      status: "awaiting-user",
      detail: "Sandbox connection staged. The user must complete the provider's official authorization flow.",
    };
  }

  async validateVariables(values: Record<string, string>): Promise<VariableValidationResult> {
    const missing = this.definition.requiredVariables.filter((name) => !values[name]?.trim());
    return {
      valid: missing.length === 0,
      missing,
      detail: missing.length === 0 ? "Required variable names are present." : `Missing ${missing.length} required variable(s).`,
    };
  }
}
