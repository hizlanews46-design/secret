# Tier-B secret rotation runbook

Never print a secret. Never place a secret in Git, `.env.example`, a `NEXT_PUBLIC_*` variable, a database row, or chat.

## General order

1. Confirm the target provider and affected environments.
2. Create or generate the replacement credential with minimum required scopes while the old credential remains active.
3. Store the replacement in the provider's encrypted configuration or Vercel encrypted/sensitive environment variable.
4. Redeploy or reload the affected service.
5. Run a live health/auth/integration check without printing request headers or response tokens.
6. Revoke the old credential only after the new credential succeeds.
7. Monitor logs and health for one release window.
8. If the new credential fails, restore the old value, redeploy, and investigate. Revoke only after the rollback is healthy.

## Google/GitHub OAuth client secrets

Create a new provider secret first, update it in Supabase Authentication → Providers, save, and complete an incognito login round-trip. Only then revoke the old OAuth secret in Google Cloud or GitHub. If login fails, restore the previous provider secret and retest before revoking anything.

## Vercel server secrets

Use Vercel Project → Settings → Environment Variables. Add the replacement as an encrypted/sensitive variable for the exact target scopes. Redeploy, call `/api/health`, and exercise the affected server route. Remove the old variable only after the deployment is READY and verified.

## Supabase Edge Function secrets

Use Supabase CLI or the project secret manager (`supabase secrets set NAME=...`) against the linked project. Never use SQL migrations for secrets. Deploy the function, invoke a non-destructive health path, then remove the old secret after validation.

## Stripe keys and webhook signing secrets

Create restricted/test-mode replacements first. Update the server-side secret and webhook endpoint configuration, deploy, then validate with a zero-value/non-charging test API call or Stripe test event. Rotate webhook signing secrets with overlapping verification if the provider supports it. Never run a live charge as a health check.

## Turnstile and SMTP

Create a replacement in the provider dashboard, update the server-side secret, deploy, and test a verification or email delivery flow. Keep the old secret active until the new flow is proven. Revoke old credentials last.

## Evidence to record

Record only: timestamp, environment, variable name, provider, deployment ID, health check result, and rotation owner. Do not record secret values, full tokens, authorization codes, or email credentials.
