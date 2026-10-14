# Vaultline

Production baseline for a compliant zero-trust integration-variable vault. Users manually enter variables; the application does not scrape, automate login, bypass CAPTCHA/MFA, create third-party accounts, or execute payments.

## Security model

- The browser derives an AES-256-GCM key with Argon2id from the user's vault passphrase.
- Plaintext values are encrypted before Supabase writes.
- `user_vault.encrypted_value` is opaque JSON containing ciphertext, IV, salt, and algorithm metadata.
- Supabase RLS restricts every row to `auth.uid() = user_id`.
- The passphrase and derived key are never stored.

## Run

1. Copy `.env.example` to `.env.local` and add the Supabase URL/anon key.
2. Run `pnpm install`, `pnpm dev`.
3. Apply `supabase/migrations/20261014000000_zero_trust_vault.sql` in the Supabase SQL editor or CLI.
4. Configure the same two public environment variables in Vercel.

## Checks

`pnpm test` · `pnpm typecheck` · `pnpm build`

Google OAuth is supported through Supabase Auth when enabled in the Supabase dashboard; email/password works without any provider secret in this repository.
