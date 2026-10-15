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

## Interpretation

A `PASS` is machine-checked. `PROVISIONED` means a safe configuration write was issued and must be followed by the READY deployment check. `NOT VERIFIED` and `NOT DONE` are intentionally not represented as complete.
