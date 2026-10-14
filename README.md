# Vaultline

Vaultline is a safe MVP for a zero-trust integration-variable workspace. It keeps user-entered variables encrypted in the browser and provides a consent-first orchestration UI for future provider adapters.

## What this MVP includes

- **Client-side vault:** Argon2id derives an AES-256-GCM key from a passphrase. Plaintext values are encrypted before Supabase writes, and the passphrase is never persisted.
- **Service catalog:** GitHub, OpenAI, Stripe, Supabase, and Vercel are represented as typed service definitions with status and variable requirements.
- **Safe orchestration previews:** discovery, provisioning, and rotation actions create paused mock workflow records that require a future explicit consent step.
- **Pluggable payment boundary:** `IVirtualCardProvider` and `MockVirtualCardAdapter` define the extension point for a separately reviewed adapter. The default adapter never contacts a card network or executes a payment.
- **Supabase RLS:** rows are scoped to `auth.uid() = user_id` by the included migration.
- **Deployment hygiene:** a route manifest is available at `/manus-routes.json`, and browser Supabase initialization has build-safe placeholders when local environment variables are absent.

## Explicit safety boundary

This repository does **not** scrape credentials, inspect email bodies, automate third-party login, bypass MFA or CAPTCHA, create external accounts, use residential proxies, or execute payments. Any future provider integration must be separately reviewed, explicitly consent-based, and implemented behind an adapter interface.

## Run locally

1. Copy `.env.example` to `.env.local` and add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Run `pnpm install` and `pnpm dev`.
3. Apply `supabase/migrations/20261014000000_zero_trust_vault.sql` in the Supabase SQL editor or CLI.
4. Configure the same two public environment variables in Vercel.

## Checks

```bash
pnpm test
pnpm typecheck
pnpm build
```

Google OAuth is supported through Supabase Auth when enabled in the Supabase dashboard; email/password works without any provider secret in this repository.
