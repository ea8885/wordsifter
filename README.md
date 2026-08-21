# WordSifter

WordSifter is a responsive product landing page for a writing-refinement workspace. It presents the product through an interactive “Sift” demo, use-case cards, testimonials, calls to action, and a mobile-first layout.

Live site: https://wordsifter-landing.eaf709.chatgpt.site

## Open it with GitHub Copilot

### Windows quick start

1. Install [Node.js 22 LTS](https://nodejs.org/), [Git](https://git-scm.com/), and [Visual Studio Code](https://code.visualstudio.com/).
2. Install the recommended extensions when VS Code opens the project.
3. Sign into the **GitHub Copilot** extension.
4. In a PowerShell terminal at the project root, run:

   ```powershell
   npm ci
   npm run dev:local
   ```

5. Open the local address printed in the terminal.
6. Open Copilot Chat and choose **WordSifter Builder** from the agent picker.

The repository-wide instructions in `.github/copilot-instructions.md` load automatically. Type `/` in Copilot Chat to use the included prompts.

## Useful Copilot prompts

- `/add-landing-section` — add a polished new section without drifting from the design.
- `/refine-responsive-ui` — inspect and improve desktop, tablet, and mobile behavior.
- `/review-wordsifter-change` — review a change for design consistency, accessibility, and build safety.

You can also ask naturally:

> Add a pricing section between creator types and testimonials. Match the existing dark/gradient visual system and keep the mobile layout strong.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev:local` | Start local development on Windows, macOS, or Linux |
| `npm run typecheck` | Check TypeScript |
| `npm run lint:local` | Run ESLint |
| `npm run build:local` | Create a local production build |
| `npm run test:auth` | Run auth return-path tests |
| `npm run test:licensing` | Run license domain tests |
| `npm run check:local` | Run all three local checks |
| `npm run build` | Run the hosted Linux build wrapper |

## Where to edit

- `app/page.tsx` — all page content, demo behavior, and React markup.
- `app/globals.css` — the complete visual system and responsive layout.
- `app/layout.tsx` — title, description, and social metadata.
- `public/og.png` — the social sharing image.
- `.github/copilot-instructions.md` — permanent project guidance for Copilot.
- `app/auth-panel.tsx` — Google, magic-link, and retail license actions.
- `lib/auth` — Supabase configuration and safe session helpers.
- `lib/licensing` — provider-neutral license and entitlement rules.

## Design guardrails

- Keep the near-black/navy canvas and vivid violet–magenta–orange gradient.
- Preserve “Find what works.” as the primary message.
- Keep the first viewport focused on the value proposition and product demo.
- Use CSS and existing interface symbols for UI decoration.
- Maintain keyboard-friendly controls, visible focus states, and responsive behavior.
- Do not add generic stock photography, glassmorphism overload, or unrelated features.

## Architecture

- React 19 and TypeScript
- Next-compatible app structure compiled with Vinext/Vite
- Tailwind CSS 4 import plus custom CSS
- Cloudflare Worker-compatible production output
- Optional Drizzle/D1 starter files remain available but are not active

## Retail authentication setup

The retail flow uses Supabase Auth for Google OAuth and email magic links. License keys are redeemed only after sign-in; they are not passwords. WordSifter keeps the license and entitlement boundary server-side so the desktop app can later use signed activation tokens.

### Local setup

1. Create a Supabase project.
2. Enable Google in **Authentication > Providers**.
3. Enable the Email provider for magic links.
4. Add `http://localhost:5173/auth/callback` as an allowed redirect URL.
5. Add `https://wordsifter.vercel.app/auth/callback` as a production allowed redirect URL.
6. Copy `.env.example` to `.env.local` and fill in the Supabase URL, publishable key, service-role key, application URL, and a long random `LICENSE_TOKEN_SECRET`.
7. Run `npm run dev:local`.

The Supabase service-role key and license signing secret are server-only. Never place them in `NEXT_PUBLIC_*` variables or commit `.env.local`.

### Google OAuth redirect

Google Cloud Console must use the Supabase-provided callback URL as the OAuth redirect URI. Supabase then redirects the authenticated user to WordSifter's `/auth/callback` route.

### Vercel setup

Add these variables in Vercel Project Settings > Environment Variables for Preview and Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL=https://wordsifter.vercel.app`
- `LICENSE_TOKEN_SECRET`

Redeploy after saving the variables. The production Supabase license repository is defined in `supabase/migrations/20260821000000_license_entitlements.sql` and can be applied to the linked project with `npx supabase db push --linked`. Keep license creation administrative: store only hashes in `licenses.key_hash`, never raw keys.
