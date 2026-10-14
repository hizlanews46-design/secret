export type ServiceStatus = "connected" | "discovered" | "not-connected";
export type WorkflowStatus = "queued" | "awaiting-consent" | "running" | "completed" | "cancelled";

export type ServiceDefinition = {
  id: string;
  name: string;
  category: string;
  description: string;
  variables: string[];
  status: ServiceStatus;
  color: string;
};

export type WorkflowRun = {
  id: string;
  serviceId: string;
  serviceName: string;
  kind: "discover" | "provision" | "rotate";
  status: WorkflowStatus;
  detail: string;
  createdAt: string;
};

export const serviceCatalog: ServiceDefinition[] = [
  { id: "github", name: "GitHub", category: "Developer tools", description: "Personal access token and repository automation variables.", variables: ["GITHUB_TOKEN", "GITHUB_OWNER"], status: "connected", color: "#1f2937" },
  { id: "openai", name: "OpenAI", category: "AI platform", description: "API access for model-powered products and internal tools.", variables: ["OPENAI_API_KEY", "OPENAI_ORG_ID"], status: "discovered", color: "#10a37f" },
  { id: "stripe", name: "Stripe", category: "Payments", description: "Sandbox integration variables with payment execution disabled.", variables: ["STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY"], status: "not-connected", color: "#635bff" },
  { id: "supabase", name: "Supabase", category: "Data", description: "Project URL and client keys for a connected backend.", variables: ["SUPABASE_URL", "SUPABASE_ANON_KEY"], status: "connected", color: "#3ecf8e" },
  { id: "vercel", name: "Vercel", category: "Deployment", description: "Project and deployment environment variables.", variables: ["VERCEL_TOKEN", "VERCEL_PROJECT_ID"], status: "discovered", color: "#111111" },
];

export function createMockWorkflow(service: ServiceDefinition, kind: WorkflowRun["kind"]): WorkflowRun {
  const detail = kind === "discover"
    ? "Header-only discovery preview. No inbox body or credential is accessed."
    : kind === "provision"
      ? "Mock provisioning queued. Human consent is required before any external action."
      : "Rotation request staged. Existing values remain unchanged until approved.";
  return {
    id: `wf_${Math.random().toString(36).slice(2, 9)}`,
    serviceId: service.id,
    serviceName: service.name,
    kind,
    status: "awaiting-consent",
    detail,
    createdAt: new Date().toISOString(),
  };
}
