# Environment variable registry

Last audited: 2026-10-16. Values are intentionally omitted. Secret values are never stored in this document.

## Registry

| Variable | Where used | Tier | Public/secret | Required for | Source system | Automatable | Current status |
|---|---|---|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/client.ts:3`, `lib/supabase/server.ts`, `middleware.ts` | A | Public | local/preview/production | Supabase project URL → Vercel | Yes | Set in Vercel production, preview, development; live health and project identity verified |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/client.ts:4`, `lib/supabase/server.ts`, `middleware.ts` | A | Public publishable key | local/preview/production | Supabase publishable/anon key → Vercel | Yes | Set in Vercel production, preview, development; value never printed |
| `NEXT_PUBLIC_SITE_URL` | Auth redirect convention and deployment metadata | C | Public derived | local/preview/production | Canonical URL / Vercel deployment URL | Yes | Set in Vercel production, preview, development |
| `NEXT_PUBLIC_APP_URL` | `.env.example` only; no runtime reference found | C | Public derived | local only if a future module adopts it | Local app URL | Yes | Removed from active registry; use `NEXT_PUBLIC_SITE_URL` instead |
| `SUPABASE_PROJECT_REF` | `.env.example` and operational documentation | C | Non-secret metadata | local/CI operations | Supabase project | Yes | Known: `tqzchcbbkwycjhaegmgi`; not required by the Next.js runtime |
| `VERCEL_GIT_COMMIT_SHA` | `app/api/health/route.ts:9` | C | Public runtime metadata | preview/production | Vercel system variable | Yes | Vercel-managed; health endpoint returned the deployed commit version |
| `GOOGLE_CLIENT_ID` | OAuth provider configuration, not application bundle | B | Secret-adjacent provider credential | production OAuth | Google Cloud → Supabase Auth provider | No | Human action required; OAuth app cannot be provisioned through the connected API |
| `GOOGLE_CLIENT_SECRET` | OAuth provider configuration, not application bundle | B | Secret | production OAuth | Google Cloud → Supabase Auth provider | No | Human action required; not present in repo or Vercel |
| `GITHUB_CLIENT_ID` | OAuth provider configuration, not application bundle | B | Secret-adjacent provider credential | production OAuth | GitHub OAuth App → Supabase Auth provider | No | Human action required |
| `GITHUB_CLIENT_SECRET` | OAuth provider configuration, not application bundle | B | Secret | production OAuth | GitHub OAuth App → Supabase Auth provider | No | Human action required |
| `TURNSTILE_SECRET_KEY` | Future server-side human-verification endpoints | B | Secret | only when Turnstile is enabled | Cloudflare dashboard | No | Not configured; no Turnstile endpoint claims completion |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Future client-side Turnstile widget | A | Public | only when Turnstile is enabled | Cloudflare dashboard | No | Not configured |
| `STRIPE_SECRET_KEY` | Payment provider adapter catalog only; no runtime reference found | B | Secret | only when billing is enabled | Stripe dashboard | No | Not configured; payments remain disabled |
| `STRIPE_PUBLISHABLE_KEY` | Payment provider adapter catalog only; no runtime reference found | A | Public | only when billing is enabled | Stripe dashboard | No | Not configured; payments remain disabled |
| `STRIPE_WEBHOOK_SECRET` | No runtime reference found; reserved for future signed webhooks | B | Secret | only when billing/webhooks are enabled | Stripe dashboard | No | Not configured |
| `SMTP_*` | No runtime reference found; reserved for production email delivery | B | Secret | only when email delivery is enabled | Email provider | No | Not configured |

## Live system findings

- Supabase project `tqzchcbbkwycjhaegmgi` is `ACTIVE_HEALTHY`.
- Vercel project `secret` has the two Supabase public variables set across production, preview, and development. The new derived site URL is being provisioned across the same scopes.
- No service-role key, provider client secret, Stripe secret, or Turnstile secret is in the repository.
- `.env.local` and all `.env.*` files except `.env.example` are ignored by Git.
- Public values are allowed in `NEXT_PUBLIC_*`; secrets are not.

## Classification rule

Tier A is safe for browser exposure. Tier B must stay in the provider dashboard or encrypted server environment. Tier C is computed from deployment metadata or canonical configuration and must not be requested as a secret.
