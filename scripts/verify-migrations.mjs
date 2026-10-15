import { existsSync, readFileSync } from "node:fs";

const required = [
  ["supabase/migrations/20261014000000_zero_trust_vault.sql", ["user_vault", "enable row level security"]],
  ["supabase/migrations/20261014010000_orchestration_audit.sql", ["workflow_runs", "audit_events", "enable row level security"]],
  ["supabase/migrations/20261015000000_partner_agreements.sql", ["partner_agreements", "integration_feature_flags", "awaiting-user"]],
  ["supabase/migrations/20261015010000_partner_attraction.sql", ["revenue_share_pct", "status = 'signed'", "partner_marketplace_is_enabled"]],
  ["supabase/migrations/20261015020000_platform_operations.sql", ["consent_records", "plan_limits", "usage_counters", "support_tickets", "auth_audit_log"]],
];

for (const [file, markers] of required) {
  if (!existsSync(file)) throw new Error(`Missing migration: ${file}`);
  const text = readFileSync(file, "utf8");
  for (const marker of markers) if (!text.toLowerCase().includes(marker.toLowerCase())) throw new Error(`Migration ${file} is missing marker: ${marker}`);
}
console.log(`Verified ${required.length} Supabase migration files.`);
