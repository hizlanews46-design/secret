# Environment verification matrix

Audit date: 2026-10-16. Secret values are intentionally omitted.

| Check | Method | Result |
|---|---|---|
| Supabase project identity | Supabase project API | PASS — project `tqzchcbbkwycjhaegmgi`, status `ACTIVE_HEALTHY` |
| Supabase public URL | Supabase project URL API | PASS — URL matches the project ref; value omitted here |
| Vercel Supabase variables | Vercel env metadata, decrypt disabled | PASS — `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` target production, preview, development |
| Vercel site URL | Vercel env provisioning | PROVISIONED — production, preview, development values configured; recheck after deployment |
| Git secret tracking | `git ls-files` + secret-pattern scan | PASS — only `.env.example` is tracked; no service-role, Stripe secret, OAuth secret, or Turnstile secret found |
| Local secret protection | `.gitignore` inspection | PASS — `.env` and `.env.*` ignored except `.env.example` |
| Migration/build/tests | `pnpm check` before this env-only increment | PASS — 9 tests, strict typecheck, 5 migration files, production build |
| Production health | `GET /api/health` | PASS — HTTP 200 on current production deployment |
| Provider catalog | `GET /providers` | PASS — verified in prior production smoke check |
| Supabase Auth Site URL | Auth configuration API | NOT MACHINE-VERIFIED — connected Supabase tools do not expose Auth URL configuration in this session |
| Supabase Auth redirect allow-list | Auth configuration API | NOT MACHINE-VERIFIED — human must confirm exact URLs in dashboard |
| Google provider enabled | `GET /auth/v1/authorize?provider=google` | FAIL/NOT DONE — HTTP 400 `Unsupported provider: provider is not enabled`; human provider setup required |
| GitHub provider enabled | `GET /auth/v1/authorize?provider=github` | FAIL/NOT DONE — HTTP 400 `Unsupported provider: provider is not enabled`; human provider setup required |
| OAuth incognito round-trip | Browser/provider flow | NOT VERIFIED — requires human consent and provider credentials |
| SMTP | Confirmation/reset email | NOT DONE — no SMTP provider configured |
| Turnstile | Challenge verification | NOT DONE — no site/secret keys configured |
| Stripe | Test-mode API check | NOT DONE — payment is disabled and no Stripe secret is configured |
| Phase 1 3D trust layer | Feature-on build with temporary shell flag | PASS — lazy client scene, static fallback, reduced-motion path, and strict build verified |
| Phase 1 mobile Lighthouse | Feature-on deployed preview | NOT VERIFIED — flag remains OFF pending a real-device performance review |
| Phase 2 connector contract | `pnpm test`, strict typecheck, default-off/feature-on builds | PASS — 6 test files, 12 tests; tokens browser-only and ciphertext validation covered |
| Phase 2 provider health | Live GitHub/Vercel token test | NOT VERIFIED — no human-provided token; no dashboard/provider action performed |
| Phase 3 CLI | Node syntax + local init/run/rotate smoke test | PASS — local AES-256-GCM vault flow works without printing values |
| Phase 3 device login | Live device-code round-trip | NOT DONE — server endpoint remains intentionally disabled; CLI does not claim a session |
| Phase 4 hygiene badge | Local route build and SVG-safe output path | PASS — metadata-only route; no secret or ciphertext fields |
| Phase 4 public status metadata | Audited public rotation/RLS source | NOT DONE — badge honestly shows review required/not recorded by default |
| Phase 5 SaaS skeleton | `pnpm check`, 7 test files, 14 tests, strict build | PASS — no paid/proprietary dependency added |
| Stripe webhook | POST without configured secret | NOT DONE — returns disabled; no billing credential configured |
| Turnstile | Server verifier without configured secret | NOT DONE — explicit no-op until human configures a key |
| SMTP | Transactional email boundary | NOT DONE — no provider configured and no delivery claimed |
| CLI device auth | `POST /api/cli/device/start` | NOT DONE — returns disabled by design |
| OAuth authorization cards | Feature-gated UI path | NOT VERIFIED — guide is default OFF until console setup is human-approved |

## Interpretation

A `PASS` is machine-checked. `PROVISIONED` means a safe configuration write was issued and must be followed by the READY deployment check. `NOT VERIFIED` and `NOT DONE` are intentionally not represented as complete.

## Phase 1 release note

The 3D trust layer is implemented but remains disabled by default. See [`docs/phase-1-report.md`](phase-1-report.md). No Vercel environment change is required to preserve the default-off invariant.

The Phase 2 connector panel and adapters are also implemented but remain disabled by default. See [`docs/phase-2-report.md`](phase-2-report.md). Provider tokens must be entered by the user in an enabled preview or local browser session and are never requested in chat.

The Phase 3 CLI is publish-ready but not published to npm. See [`docs/phase-3-report.md`](phase-3-report.md). Public package publication and server-backed device login remain separate authorized actions.

The Phase 4 badge is live but conservative by default. See [`docs/phase-4-report.md`](phase-4-report.md). It does not claim proof until an audited public metadata source is configured.

Phase 5 adds safe no-op boundaries only. See [`docs/phase-5-report.md`](phase-5-report.md). Credentials and console setup remain human-gated.
