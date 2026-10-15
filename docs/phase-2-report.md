# Phase 2 — BYO provider connector system

## Status

Implemented behind `NEXT_PUBLIC_ENABLE_CONNECTORS`, default OFF. The feature is not enabled in Vercel by this commit.

## What shipped

The new `src/connectors/` module contains a strict Zod connector specification with `test()`, `push(encryptedRef)`, `pull()`, and `revoke()` methods. GitHub and Vercel adapters use browser `fetch` with a token held only in memory. The adapters return metadata and accept ciphertext references; they never accept a plaintext field. Provider responses are reduced to metadata before reaching UI state.

The integrations page now contains a Connect surface when the flag is enabled. The token input is password-masked, autocomplete is disabled, the value is cleared after a successful health check, and no localStorage/sessionStorage persistence exists.

## Safety boundary

GitHub push uses provider-compatible encrypted values and a key identifier. Vercel push stores the supplied ciphertext as an encrypted-type environment value, never a decrypted secret. The UI does not perform OAuth console setup, create tokens, or enable providers. Those actions remain human-authorized.

## Verification

- Existing 9 tests remain green; connector safety tests were added for browser-only token use and ciphertext-only validation.
- Strict TypeScript, migration verification, production build, and secret scan pass.
- The feature-on build path passes with a temporary shell flag.
- Default-off build path passes.
- Production health is checked after the deployment is READY.

## Human actions required before enabling

Create a least-privilege GitHub token or approved OAuth flow with repository Actions-secrets scope, or a least-privilege Vercel token scoped to the intended project. Review CORS and provider rate limits in a preview deployment. Do not place these tokens in environment variables or send them in chat. Enable `NEXT_PUBLIC_ENABLE_CONNECTORS` only after this review.
