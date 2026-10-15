# Phase 4 — proof-of-hygiene badge

## Status

`GET /api/badge/[project].svg` is live and returns a metadata-only SVG suitable for a README or status page.

Example:

```markdown
![Vaultline hygiene](https://secret-iota-ten.vercel.app/api/badge/secret.svg)
```

The badge includes only the sanitized project label, an RLS status label, and the last-rotation metadata label. It never includes a secret, ciphertext, access token, or database row contents. Until a reviewed public-status source is configured, it honestly displays `RLS: review required` and `Last rotation: not recorded`.

Optional public metadata variables are deliberately not provisioned by default:

```text
VAULTLINE_PUBLIC_RLS_STATUS
VAULTLINE_PUBLIC_LAST_ROTATION
```

Do not populate these values unless the owner has an auditable source and a separate review confirms that they disclose no sensitive information.
