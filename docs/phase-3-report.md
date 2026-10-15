# Phase 3 — `vaultline` CLI

## Status

A publish-ready CLI entrypoint is included at `bin/vaultline.mjs`. It is not published to npm. Public package publication remains a separate explicit action.

## Commands

```bash
pnpm exec vaultline init
pnpm exec vaultline login
pnpm exec vaultline run -- printenv
pnpm exec vaultline rotate API_KEY
```

`init` and `rotate` maintain a local mode-0600 AES-256-GCM vault using Node's built-in `scrypt` key derivation. `run -- <cmd>` decrypts values only in memory and injects them into the child process environment. The CLI never prints decrypted values.

`login` is deliberately honest: the production device-code endpoint is not enabled yet. It opens the approved login surface conceptually and refuses to claim a server-backed session. A future reviewed device-code route can replace this branch without changing local encryption behavior.

## Safety

The local vault file is ignored by the repository's `.gitignore` rules through the `.vaultline/` pattern added for this phase. No session token or secret is committed, logged, or sent to the server by this CLI.

## Verification

The repository quality gate remains green. The CLI script is syntax-checked with Node and the feature does not change the browser default experience.
