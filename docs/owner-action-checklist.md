# Owner-only action checklist

These actions are intentionally **not executed by the agent**.

## A. Delete duplicate Vercel project `secret-1flx`

1. Open the Vercel dashboard and select the team that owns `secret`.
2. Open **Projects** and select **`secret-1flx`** — verify the exact project name before continuing.
3. Open **Settings → General**.
4. Scroll to **Delete Project**.
5. Review the project name and deployment list, then enter the requested confirmation text.
6. Confirm deletion only after verifying the retained canonical project is **`secret`** and its production deployment is healthy.
7. Return to **Projects** and verify that `secret-1flx` no longer appears.
8. Open the retained `secret` project and verify its GitHub repository is `hizlanews46-design/secret`.

Do not delete any project with a different name or repository without a new explicit review.

## B. Rotate any credential exposed outside the vault

1. Identify only the provider and credential label; do not paste the plaintext value into chat, tickets, screenshots, URLs, or logs.
2. Open the provider’s official credential/security page from the [provider catalog](/providers).
3. Revoke or rotate the exposed credential using the provider’s official flow.
4. Confirm the provider reports the old credential as revoked or inactive.
5. Create the replacement credential only if needed, and enter it directly into the Vaultline browser form.
6. Verify the value is encrypted before persistence; do not copy it into server logs or analytics.
7. Delete the old ciphertext from Vaultline after provider-side revocation is confirmed.
8. Run a safe validation workflow and record only the provider name, timestamp, and result.
9. Review provider audit logs for unexpected use.

If an account, payment method, identity check, MFA, or CAPTCHA is involved, complete that step yourself. Vaultline does not bypass it.
