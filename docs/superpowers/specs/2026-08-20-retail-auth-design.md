# WordSifter Retail Authentication Design

## Goal

Provide a low-friction account system for the retail desktop application and web app without making license keys the primary login mechanism.

## Scope

Launch authentication supports:

- Google OAuth
- Email magic-link sign-in
- Retail license-key redemption after sign-in
- Account-linked entitlements
- Device activation records
- Signed offline entitlement cache with periodic online refresh

Apple, Microsoft, password login, billing, and subscription automation are out of scope for this first implementation.

## Architecture

Supabase Auth is the identity provider. It owns OAuth, magic-link delivery, sessions, and account recovery.

WordSifter owns the entitlement boundary. A server-side route validates the authenticated Supabase user, accepts a retail key, atomically marks the key redeemed, and creates an entitlement linked to the user. License keys are never treated as passwords and are never validated solely in client code.

The current app remains compatible with Vercel and Cloudflare deployment. Supabase credentials are environment variables and are never committed.

## Data Model

The entitlement layer requires these records:

- `licenses`: hashed license key, product tier, status, redeemed user, redeemed time, and optional expiration
- `entitlements`: user id, product tier, source, status, and validity timestamps
- `devices`: user id, device identifier hash, platform, last seen time, and revoked time

The implementation may use the existing D1/Drizzle scaffolding or a Supabase-backed table layer, but it must expose a small provider-neutral service interface so identity and entitlement storage can change independently.

## User Flows

### Web sign-in

1. User selects Google or email magic link.
2. Supabase completes authentication and returns the user to WordSifter.
3. WordSifter creates or updates the local account projection.
4. The UI displays the current entitlement state.

### Retail activation

1. Authenticated user enters a retail key.
2. Server normalizes and hashes the key.
3. Server rejects unknown, already-redeemed, expired, or revoked keys.
4. Server creates the entitlement and records the redemption.
5. The desktop app can request an activation token for the signed-in account.

### Desktop activation

1. Desktop app opens the system browser to a WordSifter activation URL containing a one-time state value.
2. User signs in or redeems a key.
3. The browser callback exchanges the one-time state for a short-lived activation result.
4. Desktop app stores only a signed entitlement token and a device binding, never a provider secret.
5. The app refreshes the entitlement online periodically and permits a bounded offline grace period.

## Security Requirements

- Keep Supabase service-role credentials server-side only.
- Use PKCE/state protection for browser-to-desktop activation.
- Store only hashes of license keys at rest.
- Make redemption idempotent and transactional.
- Rate-limit sign-in callbacks, redemption attempts, and device activation.
- Never trust plan or entitlement values supplied by the client.
- Support device revocation and account recovery.
- Avoid logging access tokens, magic-link URLs, or raw license keys.

## Error Handling

Use user-safe messages for invalid, redeemed, expired, or revoked keys without revealing whether a guessed key is close to valid. Expired sessions redirect to sign-in while preserving a safe relative return path. Offline mode clearly distinguishes cached access from current entitlement status.

## Testing

Add focused tests for:

- License normalization and hashing
- Unknown, redeemed, expired, and revoked key rejection
- Idempotent redemption
- Entitlement lookup and device revocation
- Safe return-path handling
- Activation state expiry and replay rejection
- Offline grace-period boundaries

Provider calls should be isolated behind interfaces so domain tests do not depend on live Google, email, or Supabase services.

## Configuration

Required runtime configuration will be documented with placeholders only:

- Supabase project URL
- Supabase publishable/anon key for browser use
- Supabase service-role key for server use
- Application public URL
- Desktop activation callback configuration

No real credentials belong in source control.
