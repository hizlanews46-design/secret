# Vaultline

Vaultline is a production-ready **core SaaS foundation** for a zero-trust integration-variable workspace. It keeps user-entered variables encrypted in the browser and provides a consent-first orchestration queue for future provider adapters.

It is not an autonomous universal account scraper. The original blueprint's credential harvesting, third-party login automation, CAPTCHA/MFA bypass, residential proxy use, and payment execution are intentionally not implemented.

## Production-ready core

- **Client-side vault:** Argon2id derives an AES-256-GCM key from a passphrase. Plaintext values are encrypted before Supabase writes, and the passphrase is never persisted.
- **Service catalog:** GitHub, OpenAI, Stripe, Supabase, and Vercel are represented as typed service definitions with status and variable requirements.
- **Persistent orchestration queue:** consent-gated discovery, provisioning, and rotation previews persist to `workflow_runs` with RLS and audit records in `audit_events`.
- **Pluggable payment boundary:** `IVirtualCardProvider` and `MockVirtualCardAdapter` define the extension point for a separately reviewed adapter. The default adapter never contacts a card network or executes a payment.
- **Supabase RLS and indexes:** user vault, workflow, and audit records are scoped to `auth.uid()` and indexed for per-user reads.
- **Operational readiness:** CI runs tests, TypeScript checks, and production builds. `/api/health` exposes a no-store health response. Security headers include HSTS, CSP, frame denial, and permissions policy.
- **Deployment hygiene:** `/manus-routes.json` exposes only page routes, and browser Supabase initialization remains build-safe when local environment variables are absent.

## Explicit safety boundary

This repository does **not** scrape credentials, inspect email bodies, automate third-party login, bypass MFA or CAPTCHA, create external accounts, use residential proxies, or execute payments. Any future provider integration must be separately reviewed, explicitly consent-based, and implemented behind an adapter interface with its own audit trail.

## Run locally

1. Copy `.env.example` to `.env.local` and add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Run `pnpm install` and `pnpm dev`.
3. Apply the SQL migrations in `supabase/migrations/` to the intended Supabase project. The orchestration migration adds persistent workflows, audit events, indexes, and RLS. If the project already owns a different `public.profiles` schema, also apply `20261014020000_shared_profiles_compat.sql`.
4. Configure the same two public environment variables in Vercel. The connected deployment currently uses the `New Banglarvoice` Supabase project in `ap-southeast-1`; its existing shared profile schema is preserved by the compatibility migration.
5. Verify `GET /api/health` returns `{ "status": "ok" }` after deployment.

## Checks

```bash
pnpm test
pnpm typecheck
pnpm build
```

Google OAuth is supported through Supabase Auth when enabled in the Supabase dashboard; email/password works without any provider secret in this repository.
