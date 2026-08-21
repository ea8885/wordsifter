# WordSifter Retail Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google and email magic-link sign-in with account-linked retail license redemption and a secure desktop activation boundary.

**Architecture:** Supabase Auth owns Google OAuth, email magic links, browser sessions, and account recovery. WordSifter owns license redemption, entitlements, device activation, and signed activation results through server-side routes. The client never validates licenses or receives Supabase service-role credentials.

**Tech Stack:** React 19, TypeScript, Vinext/Vite, Vercel Nitro output, Supabase Auth, Drizzle/D1-compatible domain interfaces, Node test runner.

---

## File Map

- Create `lib/auth/config.ts`: environment-variable names and server/browser configuration validation.
- Create `lib/auth/supabase-browser.ts`: browser-safe Supabase client factory.
- Create `lib/auth/session.ts`: provider-neutral authenticated-user and safe-return-path types/helpers.
- Create `lib/licensing/types.ts`: license, entitlement, and device domain types.
- Create `lib/licensing/crypto.ts`: license normalization, hashing, and signed activation-token helpers.
- Create `lib/licensing/service.ts`: provider-neutral redemption and entitlement service interface.
- Create `lib/licensing/repository.ts`: persistence interface and first D1/Drizzle-compatible implementation boundary.
- Create `app/auth/callback/route.ts`: Supabase OAuth and magic-link callback.
- Create `app/auth/sign-out/route.ts`: server-side sign-out route.
- Create `app/license/redeem/route.ts`: authenticated license redemption endpoint.
- Create `app/activate/route.ts`: one-time desktop activation state endpoint.
- Modify `app/page.tsx`: replace placeholder login CTA with auth-aware links and a redemption entry point.
- Modify `app/globals.css`: add only the styles required by the auth controls and states.
- Modify `package.json`: add the Supabase client dependency and focused auth test scripts.
- Modify `.env.example` or create it if absent: document placeholders without credentials.
- Create `tests/auth-return-path.test.mjs`: safe callback path tests.
- Create `tests/licensing.test.mjs`: license and entitlement domain tests.
- Create `README.md`: local setup, Supabase dashboard setup, environment variables, and Vercel configuration.

## Task 1: Add Dependencies and Configuration Boundaries

**Files:**
- Modify `package.json`
- Modify `package-lock.json` through npm
- Create `.env.example`
- Create `lib/auth/config.ts`

- [ ] **Step 1: Add Supabase browser dependency**

Run:

```powershell
npm install @supabase/ssr @supabase/supabase-js
```

Expected: both packages appear in `dependencies` and `package-lock.json` changes only through npm.

- [ ] **Step 2: Define environment names without secrets**

Create `.env.example`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:5173
LICENSE_TOKEN_SECRET=replace-with-a-long-random-server-secret
```

- [ ] **Step 3: Add typed config accessors**

`lib/auth/config.ts` must export:

```ts
export function getSupabaseBrowserConfig(): {
  url: string;
  publishableKey: string;
};

export function getSupabaseServerConfig(): {
  url: string;
  publishableKey: string;
  serviceRoleKey: string;
};

export function getAppUrl(): URL;
```

Throw a clear configuration error when a required variable is absent. Never expose `SUPABASE_SERVICE_ROLE_KEY` through a browser module.

- [ ] **Step 4: Run typecheck**

Run:

```powershell
npm run typecheck
```

Expected: PASS.

## Task 2: Build the Auth Session Layer

**Files:**
- Create `lib/auth/supabase-browser.ts`
- Create `lib/auth/session.ts`
- Create `tests/auth-return-path.test.mjs`

- [ ] **Step 1: Write failing return-path tests**

Cover these cases:

```ts
safeReturnPath("/account") === "/account";
safeReturnPath("//evil.example") === "/";
safeReturnPath("https://evil.example") === "/";
safeReturnPath("/auth/callback") === "/";
safeReturnPath("/account?tab=licenses#active") === "/account?tab=licenses#active";
```

- [ ] **Step 2: Run the focused test**

Run:

```powershell
node --test tests/auth-return-path.test.mjs
```

Expected: FAIL because the helper does not exist yet.

- [ ] **Step 3: Implement safe session helpers**

Export:

```ts
export type AuthenticatedUser = {
  id: string;
  email: string | null;
  displayName: string | null;
};

export function safeReturnPath(value: string | null | undefined): string;
```

Use the existing `chatgpt-auth.ts` relative-path behavior as the safety model. Reject absolute URLs, protocol-relative URLs, malformed paths, and reserved auth routes.

- [ ] **Step 4: Implement the browser client**

Create one browser Supabase client using the publishable key and URL. Do not use the service-role key in this module.

- [ ] **Step 5: Rerun the focused test and typecheck**

Expected: PASS for the focused test and `npm run typecheck`.

## Task 3: Implement License Domain Logic Before Persistence

**Files:**
- Create `lib/licensing/types.ts`
- Create `lib/licensing/crypto.ts`
- Create `tests/licensing.test.mjs`

- [ ] **Step 1: Write failing domain tests**

Test:

- `WS-ABCD-EFGH` normalizes consistently regardless of case or spaces.
- Hash output is deterministic and does not expose the raw key.
- Unknown, redeemed, expired, and revoked licenses are rejected.
- A successful redemption creates exactly one entitlement.
- Repeating the same redemption is idempotent for the same user and rejected for another user.
- Device revocation prevents future activation.

- [ ] **Step 2: Define domain types**

Create types for:

```ts
type LicenseStatus = "active" | "redeemed" | "expired" | "revoked";
type EntitlementStatus = "active" | "expired" | "revoked";
type ProductTier = "retail" | "beta";
```

Include `userId`, `licenseId`, timestamps, and optional expiration fields. Use `unknown` at external boundaries and validate before converting to domain types.

- [ ] **Step 3: Implement normalization and hashing**

Normalize by trimming, uppercasing, and removing separators only after validating the expected license shape. Hash with a server-only keyed digest. Do not log raw keys.

- [ ] **Step 4: Implement service interfaces**

Export repository methods for lookup-by-hash, atomic redemption, entitlement lookup, device registration, and device revocation. The service must receive the authenticated user ID explicitly.

- [ ] **Step 5: Run focused licensing tests**

Run:

```powershell
node --test tests/licensing.test.mjs
```

Expected: PASS.

## Task 4: Add Persistence and Server Routes

**Files:**
- Create `lib/licensing/repository.ts`
- Create `lib/licensing/service.ts`
- Create `app/auth/callback/route.ts`
- Create `app/auth/sign-out/route.ts`
- Create `app/license/redeem/route.ts`

- [ ] **Step 1: Define persistence schema/migrations**

Add `licenses`, `entitlements`, and `devices` tables to the existing Drizzle schema only if the active deployment has D1 configured. Keep the repository interface independent from Drizzle so a Supabase-backed implementation remains possible.

- [ ] **Step 2: Implement callback route**

The callback must:

1. Read and validate the authorization `code`.
2. Exchange it through Supabase server auth.
3. Read a safe relative `return_to` value.
4. Redirect only to the application origin.
5. Return a non-sensitive error page/status when exchange fails.

- [ ] **Step 3: Implement sign-out route**

Sign out the current Supabase session, then redirect to `/` or a validated relative return path.

- [ ] **Step 4: Implement redemption route**

Require an authenticated Supabase user. Accept JSON `{ licenseKey: string }`. Normalize and hash server-side, perform an atomic redemption, and return only:

```ts
{ ok: true, entitlement: { tier, status, expiresAt } }
```

For all invalid key states, use a generic `400` response such as `License key could not be redeemed.` Do not disclose whether the key exists.

- [ ] **Step 5: Run route and domain tests**

Run:

```powershell
node --test tests/auth-return-path.test.mjs tests/licensing.test.mjs
npm run typecheck
```

Expected: PASS.

## Task 5: Add Desktop Activation Boundary

**Files:**
- Create `app/activate/route.ts`
- Extend `lib/licensing/crypto.ts`
- Extend `lib/licensing/service.ts`
- Extend `tests/licensing.test.mjs`

- [ ] **Step 1: Test one-time activation state behavior**

Cover creation, expiry, replay rejection, wrong-state rejection, and revoked-device rejection.

- [ ] **Step 2: Implement activation state**

Create short-lived, single-use activation records. Bind each record to a requested device identifier hash and a server-generated state value. Never accept an unsigned entitlement object from the desktop client.

- [ ] **Step 3: Implement signed activation result**

Sign a minimal payload containing user ID, product tier, device binding, issued time, expiration time, and token ID. Keep the signing secret server-side.

- [ ] **Step 4: Implement activation route**

The route must support:

- `GET`: show or redirect the user to sign-in with a safe return path.
- `POST`: accept a one-time state after authentication, validate it, register the device, and return the signed activation result once.

- [ ] **Step 5: Run focused tests**

Expected: activation state tests PASS and typecheck PASS.

## Task 6: Add Auth and License UI

**Files:**
- Modify `app/page.tsx`
- Modify `app/globals.css`
- Follow `.github/instructions/ui.instructions.md`

- [ ] **Step 1: Add provider-neutral auth links**

Replace the placeholder `Log in` action with:

- `Continue with Google`
- `Email me a sign-in link`
- `Redeem a license`

Use real buttons/links with accessible labels. Keep auth state local and do not put provider secrets in client code.

- [ ] **Step 2: Add redemption form states**

Support idle, submitting, success, invalid key, expired/revoked key, network error, and signed-out states. Do not echo the entered license key after submission.

- [ ] **Step 3: Add responsive styles**

Keep the existing dark editorial design, visible focus states, adequate contrast, and mobile wrapping. Do not add a UI library for these controls.

- [ ] **Step 4: Run typecheck and lint**

Run:

```powershell
npm run typecheck
npm run lint:local
```

Expected: PASS.

## Task 7: Configure Supabase, Local Environment, and Vercel

**Files:**
- Modify `README.md`
- Modify `vercel.json` only if runtime routes require additional configuration
- Do not commit `.env.local`

- [ ] **Step 1: Create/configure Supabase project**

In Supabase Dashboard:

1. Create a project.
2. Enable Google under Authentication > Providers.
3. Enable Email provider and magic links.
4. Add local callback URL: `http://localhost:5173/auth/callback`.
5. Add production callback URL: `https://wordsifter.vercel.app/auth/callback`.
6. Set the site URL to `https://wordsifter.vercel.app`.
7. Create a publishable/anon key and keep the service-role key server-only.

Google Cloud Console requires an OAuth web client whose authorized redirect URI is the Supabase callback URL shown by Supabase, not the WordSifter callback URL directly.

- [ ] **Step 2: Create local environment file**

Copy `.env.example` to `.env.local` and fill in the Supabase URL, publishable key, service-role key, app URL, and random token secret. Do not paste any secret into source files or chat.

- [ ] **Step 3: Configure Vercel environment variables**

Add the same variables in Vercel Project Settings > Environment Variables for Production and Preview. Redeploy after saving.

- [ ] **Step 4: Document setup and recovery**

Add dashboard URLs, callback URLs, environment variable names, license provisioning instructions, and device revocation behavior to `README.md` without including credentials.

## Task 8: End-to-End Verification

**Files:**
- No production source changes unless a verification failure identifies one.

- [ ] **Step 1: Run the full local check**

```powershell
npm run check:local
```

Expected: PASS.

- [ ] **Step 2: Run the production Vercel build**

```powershell
$env:VERCEL='1'; npm run build:vercel
```

Expected: Nitro generates `.vercel/output` with static assets and a server function.

- [ ] **Step 3: Deploy**

```powershell
npx vercel --prod --yes --name wordsifter
```

Expected: deployment receives the `wordsifter.vercel.app` alias.

- [ ] **Step 4: Verify public availability**

```powershell
Invoke-WebRequest https://wordsifter.vercel.app -UseBasicParsing
```

Expected: HTTP `200`.

- [ ] **Step 5: Manually verify auth**

Check Google sign-in, email magic-link sign-in, sign-out, license redemption, duplicate redemption, and activation callback in both local and production environments. Do not claim auth is ready until each configured provider has been tested with real credentials.
