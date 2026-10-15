# Phase 1 — 3D premium visual trust layer

## Status

Implemented behind `NEXT_PUBLIC_ENABLE_3D_TRUST_LAYER`, default OFF when unset. No existing page behavior changes while the flag is absent.

## What shipped

- MIT-licensed `three`, `@react-three/fiber`, and `@react-three/drei` dependencies.
- Lazy client-only scene in `components/trust-scene.tsx`.
- Feature-gated wrapper in `components/trust-chamber.tsx`.
- Landing and authenticated dashboard integration.
- Dashboard state is based on real client observations:
  - RLS-backed Supabase reads mark RLS health as healthy/error.
  - queued and awaiting-consent workflows count as pending rotations.
  - local vault lock state reports sealed or verified.
- Static accessible fallback for WebGL-unavailable and reduced-motion users.
- Low-power WebGL settings, constrained DPR, no pan/zoom, and lazy loading.

## Flag behavior

```env
NEXT_PUBLIC_ENABLE_3D_TRUST_LAYER=false
```

The default is OFF. The flag is not provisioned in Vercel until performance and visual review are approved. To preview locally only, use an uncommitted shell value:

```bash
NEXT_PUBLIC_ENABLE_3D_TRUST_LAYER=true pnpm dev
```

Do not add a secret to this flag; it is a public UI feature flag.

## Verification

- Existing tests: 9 passed.
- Strict TypeScript: passed.
- Supabase migration verification: 5 migrations verified.
- Production build with the flag OFF: passed.
- Feature-on production build path: passed with a temporary shell-only flag.
- Diff check and secret scan: passed.
- `/api/health`: remains HTTP 200 on the current production deployment.

## Not yet claimed

Mobile Lighthouse ≥90 for the feature-on WebGL path has not been claimed. It requires a deployed flag-on preview and real-device Lighthouse measurement. The feature remains OFF by default pending that review.
