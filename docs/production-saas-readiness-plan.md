# Universal Variable Orchestration Platform
## Production SaaS Readiness Plan

**Audit date:** 2026-10-14  
**Repository:** `hizlanews46-design/secret`  
**Current commit:** `c03939d`

## 1. Executive assessment

The current product is a **deployed production-core MVP**, not yet a complete universal credential-orchestration SaaS. The core web application, encrypted vault model, consent-gated workflow records, audit tables, RLS, CI checks, health endpoint, GitHub integration, Supabase project, and Vercel deployment are in place.

The original blueprint contains valuable ideas, but several requirements are not safe, legally reliable, or technically universal:

- Discovering every account associated with an email is not a guaranteed capability. It must be limited to services for which the user explicitly grants OAuth access and only to permitted metadata.
- Existing third-party secrets should not be scraped from dashboards. Providers often show secrets only once, and dashboard automation may violate provider terms.
- CAPTCHA, MFA, anti-bot controls, residential-proxy rotation, automated solvers, disposable email, and payment-validation bypasses must not be implemented.
- Autonomous account creation and payment-card issuance require provider authorization, user confirmation, compliance review, and often commercial contracts.
- SRP is an authentication protocol; it is not itself a complete vault-encryption design. The vault should use client-side key derivation plus authenticated encryption, with an explicit recovery model.
- A production Android APK requires a separate mobile application, Android build pipeline, package identity, signing key, privacy disclosures, and device testing. A Next.js web deployment does not produce a native APK.

**Conclusion:** continue as a consent-first integration platform, not an unrestricted credential scraper or account-creation bot.

## 2. Current verified state

| Area | Verified state |
|---|---|
| GitHub | `hizlanews46-design/secret`, `main` synchronized at `c03939d` |
| Local repository | Clean working tree |
| Automated checks | 3 tests passed, TypeScript passed, production build passed |
| Supabase project | `secret`, ref `tqzchcbbkwycjhaegmgi`, `ACTIVE_HEALTHY`, `ap-southeast-1` |
| Supabase tables | `profiles`, `user_vault`, `workflow_runs`, `audit_events` |
| Supabase security | RLS enabled on the Vaultline tables |
| Supabase migrations | Base vault and orchestration/audit migrations applied |
| Vercel retained project | `secret`, production deployment `READY` |
| Vercel variables | `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured for production, preview, development |
| Production health | HTTP 200 from `/api/health` |
| Duplicate Vercel project | `secret-1flx` still exists and requires user deletion confirmation |

## 3. Recommended product definition

Position the product as:

> A consent-first, zero-knowledge integration workspace that helps users connect approved SaaS providers, store their own integration variables locally encrypted, run auditable workflows, and complete human verification steps themselves.

### Core user journeys

1. Create an account and unlock the local vault.
2. Add a provider from a curated catalog.
3. Complete the provider's official OAuth or API-key flow.
4. Enter or paste a secret manually when the provider requires it.
5. Encrypt the value in the browser before persistence.
6. Run a workflow only after explicit consent.
7. Pause for MFA or other human verification without bypassing it.
8. View workflow status, audit history, rotation reminders, and revoke/delete actions.

### Do not promise

- Guaranteed discovery of every historical account.
- Retrieval of secrets that a provider no longer displays.
- CAPTCHA or MFA bypass.
- Automatic payment-card creation.
- Universal provider compatibility.
- Autonomous acceptance of terms, identity checks, or financial agreements.

## 4. Production architecture to target

### Web application

- Next.js App Router with strict TypeScript.
- Server-side authorization checks for every workflow mutation.
- Client-side vault unlock and encryption using WebCrypto AES-GCM and a memory-only derived key.
- Supabase Auth, Postgres, RLS, audit events, and storage only for opaque ciphertext and non-sensitive metadata.
- Provider adapter registry with capability declarations:
  - `oauth`
  - `manual_secret`
  - `dynamic_registration`
  - `human_verification`
  - `rotation`
  - `revoke`

### Workflow engine

The current database-backed workflow records are appropriate for the MVP. Add a durable workflow runtime only when a real provider workflow needs long-running execution.

Recommended states:

`draft → awaiting_consent → queued → running → awaiting_user → completed | cancelled | failed`

Every transition should be authorized, idempotent, auditable, and safe to retry.

### Provider adapters

Each adapter should implement a narrow contract:

```ts
interface ProviderAdapter {
  id: string;
  displayName: string;
  capabilities: ProviderCapability[];
  connect(input: ConnectInput): Promise<ConnectResult>;
  validate(input: ValidateInput): Promise<ValidationResult>;
  rotate?(input: RotateInput): Promise<RotationResult>;
  revoke?(input: RevokeInput): Promise<RevokeResult>;
}
```

Start with official, documented providers and test adapters using sandbox accounts. Do not ship a generic browser scraper as the default path.

### Secret handling

- Never log plaintext secrets.
- Never send plaintext secrets to analytics, error tracking, LLM prompts, or browser automation models.
- Redact tokens in server logs and client error messages.
- Use short-lived access tokens where supported.
- Provide revoke, rotate, export, and permanent-delete controls.
- Add a clear recovery policy before marketing the vault as zero-knowledge. If the user loses the unlock secret, the platform must state whether recovery is impossible or depends on a separately protected recovery key.

### Observability and operations

Add before broad launch:

- Structured redacted logs.
- Error tracking with secret scrubbing.
- Deployment and migration checks in CI.
- Rate limits per user and provider.
- Idempotency keys for workflow mutations.
- Background cleanup for expired sessions and abandoned workflows.
- Backup and restore runbooks.
- Incident response and credential-revocation runbooks.
- Uptime, latency, workflow success, and provider-error dashboards.

## 5. Premium UX requirements

### Dashboard

- Clear onboarding checklist.
- Provider cards showing status, last validation, required scopes, and next action.
- One primary action per card.
- Visible consent summary before every workflow.
- Human-verification modal with an explanation, timeout, resume, cancel, and retry action.
- Activity timeline showing only safe metadata.
- Search, filter, status badges, and keyboard-accessible controls.
- Responsive design tested at mobile, tablet, and desktop breakpoints.

### Trust and safety UX

- Explain exactly what data a connector can read.
- Show the provider authorization URL and requested scopes.
- Show whether a value is stored encrypted locally, encrypted in Supabase, or never stored.
- Make destructive actions explicit and reversible where possible.
- Add a security page, privacy policy, terms of service, and support contact before public launch.

## 6. Android APK strategy

The current web repository is not an Android project. A professional APK requires one of these approaches:

### Recommended first release: installable web app

- Make the Next.js application a high-quality responsive PWA.
- Add manifest, icons, offline-safe shell, install prompt, and mobile navigation.
- This is the fastest path to a mobile-friendly product and can be delivered without native signing.

### Native Android release

Create a separate `/apps/android` application using Kotlin/Jetpack Compose or a maintained cross-platform shell. It must include:

- Android application ID and package name.
- Secure storage integration such as Android Keystore.
- Deep-link handling for OAuth callbacks.
- Biometric unlock option.
- Network security and certificate policy.
- Play Store privacy/data-safety declarations.
- Release keystore controlled by the owner.
- CI build producing a signed APK/AAB.
- Physical-device and emulator testing.

**Capacity boundary:** this session can prepare the mobile architecture and source project, but a trustworthy signed production APK cannot be claimed until the Android build toolchain, package identity, signing key, OAuth redirect configuration, and device testing are available.

## 7. Realistic delivery schedule

### Track A: production web SaaS core — 6 to 8 weeks

| Week | Deliverable | Acceptance criteria |
|---|---|---|
| 1 | Product hardening | Error boundaries, loading states, route auth, accessibility baseline, security headers |
| 2 | Vault UX | Unlock, lock, add, reveal, copy, delete, rotate reminders, redacted logs |
| 3 | Provider framework | Adapter interface, catalog, sandbox provider, validation and revoke flows |
| 4 | Workflow UX | Consent screen, idempotent states, retry/cancel, audit timeline, awaiting-user state |
| 5 | Operations | Rate limits, monitoring, backups, migration CI, incident runbooks |
| 6 | Security review | Threat model, dependency audit, RLS review, secret redaction, penetration-test fixes |
| 7 | Beta launch | 5–20 invited users, support workflow, analytics without secret capture |
| 8 | Public launch preparation | Legal pages, documentation, pricing, support, rollback plan |

### Track B: mobile/PWA — 2 to 4 weeks in parallel

| Week | Deliverable |
|---|---|
| 1 | Responsive navigation, mobile vault UX, manifest and icons |
| 2 | Installability, offline shell, mobile OAuth callback handling |
| 3 | Optional native shell, secure storage, deep links |
| 4 | Signed internal APK/AAB and device QA |

### Track C: approved provider integrations — 2 to 4 weeks per provider group

Each provider needs separate sandbox testing, scopes review, error handling, rotation/revoke behavior, rate-limit handling, and terms/compliance review. There is no credible universal deadline for all SaaS providers.

### Track D: high-risk automation and payments

Do not schedule this as a default feature. It requires provider authorization, legal/compliance review, security review, vendor contracts, human approval, and a dedicated payments architecture. Keep the current `MockVirtualCardAdapter` as the default until those prerequisites are complete.

## 8. Definition of production-ready

The platform is ready for a controlled beta when:

- The top user journeys pass end-to-end in a staging environment.
- All secrets are redacted from logs and telemetry.
- RLS tests cover every table and mutation.
- Workflow retries are idempotent.
- OAuth scopes are documented and minimized.
- Users can revoke providers and delete vault values.
- A recovery policy is documented and tested.
- Monitoring, backups, rollback, and incident response are tested.
- At least one real provider integration works through its official API/OAuth path.
- Accessibility and mobile QA pass.

It is ready for a broader launch only after a security review and a limited beta.

## 9. Safe one-shot implementation instruction for an AI coding agent

Use this as a controlled master instruction, not as permission to bypass provider security:

> Work only in the existing `hizlanews46-design/secret` repository. Preserve the current Next.js application and production-safe boundaries. Build the next production SaaS increment as a consent-first integration workspace. Implement the provider-adapter interface, sandbox provider, vault UX, workflow consent/state machine, audit timeline, redacted observability, rate limits, accessibility improvements, responsive mobile/PWA experience, and tests. Use official OAuth/API flows only. Never scrape hidden credentials, bypass MFA/CAPTCHA, rotate residential proxies, create disposable identities, accept legal terms for a user, or execute payments. Keep payment behind `IVirtualCardProvider` with the mock adapter as the only default. Never place plaintext credentials in logs, prompts, URLs, analytics, or server persistence. Run tests, typecheck, production build, migration checks, and security-focused checks. Update documentation and `.env.example`. Do not change production environment variables or delete external projects without an explicit final review of the exact target. Commit only verified source changes with a focused message and report every incomplete item honestly.

## 10. Immediate next actions

1. Keep Vercel project `secret` as the canonical production project.
2. Remove `secret-1flx` from Vercel through the owner-confirmed dashboard action.
3. Add an automated migration verification job for Supabase ref `tqzchcbbkwycjhaegmgi`.
4. Complete the PWA/mobile UX before starting native Android packaging.
5. Select the first two official provider adapters and obtain sandbox credentials.
6. Add security, privacy, terms, support, and recovery-policy documents.
7. Run a closed beta before enabling any advanced provider automation.

This plan is the realistic path from the current deployed core to a professional, supportable SaaS product without promising unsafe or technically impossible universal automation.
