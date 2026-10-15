# Phase 5 — SaaS completeness boundaries

## Status

Safe, open-source skeletons are implemented and all are disabled by default. No Stripe, SMTP, Turnstile, Google, or GitHub credential was created or configured.

## Implemented

The billing module contains free/pro/enterprise entitlement rules and a Stripe signature verifier using Node's built-in HMAC primitives. The webhook route returns an explicit 503 disabled response without Stripe credentials; with a valid webhook secret it records no entitlement mutation and returns a reviewed-rollout message.

The Turnstile verifier returns a disabled no-op when no server secret exists and calls Cloudflare only when an owner-configured secret is present. The SMTP boundary returns a no-op until an approved mail adapter is installed. The CLI device endpoint returns disabled by default and refuses to claim a device session without a reviewed persistence and approval flow.

An authorization card is available behind `NEXT_PUBLIC_ENABLE_AUTH_SETUP_GUIDE`. It contains console links, exact callback values, checkboxes, and warnings, but it never captures or displays credentials.

## Human actions required

- Configure Google and GitHub OAuth in the provider consoles and Supabase Auth.
- Configure SMTP and verify confirmation/reset email delivery.
- Create least-privilege Turnstile credentials if abuse protection is required.
- Create restricted Stripe test-mode credentials and configure the webhook endpoint before enabling billing.
- Approve a server-side device-code persistence design before enabling CLI login.

## Verification

- Quality gate: 14 tests across 7 files, strict typecheck, 5 migration files, build, diff check, and secret scan pass.
- Default-off deployment remains behavior-compatible.
- No paid or proprietary dependency was added.
- These integrations are not represented as live until the corresponding human action and round-trip check succeeds.
