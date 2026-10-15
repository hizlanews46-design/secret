# Human action required

Last audited: 2026-10-16. These actions require provider-console access or secrets that must not be sent in chat.

## 1. Google OAuth

1. Open [Google Auth Platform](https://console.cloud.google.com/auth/overview).
2. Configure Branding, Audience, and minimum scopes: `openid`, `userinfo.email`, and `userinfo.profile`.
3. Open Clients → Create Client → Web application.
4. Add Authorized JavaScript origin: `https://secret-iota-ten.vercel.app`.
5. Add Authorized redirect URI: `https://tqzchcbbkwycjhaegmgi.supabase.co/auth/v1/callback`.
6. Copy the Client ID and Client Secret only into Supabase Dashboard → Authentication → Providers → Google.
7. Enable Google and save.
8. Verify by opening `/login`, selecting Google, consenting, and confirming redirect to `/dashboard`.

Do not put either Google secret in GitHub, `.env.example`, `NEXT_PUBLIC_*`, browser code, or chat.

## 2. GitHub OAuth

1. Open [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers).
2. Select New OAuth App.
3. Homepage URL: `https://secret-iota-ten.vercel.app`.
4. Authorization callback URL: `https://tqzchcbbkwycjhaegmgi.supabase.co/auth/v1/callback`.
5. Register the app and generate a new client secret.
6. Copy the Client ID and Client Secret only into Supabase Dashboard → Authentication → Providers → GitHub.
7. Enable GitHub and save.
8. Verify by selecting GitHub from `/login`, authorizing, and confirming `/dashboard`.

## 3. Supabase Auth redirect configuration

1. Open [Supabase URL Configuration](https://supabase.com/dashboard/project/tqzchcbbkwycjhaegmgi/auth/url-configuration).
2. Site URL: `https://secret-iota-ten.vercel.app`.
3. Add exact Redirect URLs:
   - `https://secret-iota-ten.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`
4. Do not add broad wildcards to production.
5. Save and run both OAuth tests.

## 4. Production email delivery

Open Supabase Dashboard → Authentication → SMTP Settings. Choose an email provider, configure sender/domain verification, and set the SMTP values in the Supabase dashboard. Test confirmation and password-reset emails. Do not claim email verification complete until a real inbox receives both messages.

## 5. Human verification

If enabling auth abuse protection, create a Cloudflare Turnstile site at [Cloudflare Turnstile](https://dash.cloudflare.com/), add the production domain, then place only the public site key in the browser and the secret key in the server/provider configuration. Test signup, login-after-failures, reset, and public forms.

## 6. Custom domain (recommended before public launch)

Add the chosen domain in Vercel → Project `secret` → Settings → Domains, complete DNS verification, then update Supabase Site URL, redirect allow-list, Google origin, GitHub homepage, and OAuth callback testing. This is a configuration change, not automated here because the domain and DNS owner are unknown.

## Verification after human actions

Expected results: provider authorize endpoint does not report “provider is not enabled”; the browser returns to `/auth/callback`; server-side PKCE exchange succeeds; the user reaches `/dashboard`; Supabase Authentication → Users contains the identity; logout removes the session.
