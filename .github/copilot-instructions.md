# WordSifter repository instructions

## Product

This repository contains the WordSifter marketing site: a writing-refinement product that helps creators compare, score, rewrite, cut, and keep their strongest material. The primary message is “Find what works.” Preserve that focused product story.

## Stack and structure

- React 19, TypeScript, and Next-compatible app routing compiled by Vinext/Vite.
- The primary route is `app/page.tsx`; global styling is in `app/globals.css`; metadata is in `app/layout.tsx`.
- The app must remain compatible with Cloudflare Worker ESM output.
- Do not replace the architecture, package manager, build scripts, `vite.config.ts`, worker entry point, or `.openai/hosting.json`.
- D1/Drizzle files are optional scaffolding. Do not introduce persistence unless explicitly requested.

## Design system

- Preserve the premium dark editorial SaaS aesthetic: near-black/navy surfaces, crisp white type, restrained borders, and a violet → magenta → orange brand gradient.
- Keep the first viewport focused on the headline, concise product value, clear CTA, and interactive product mockup.
- Reuse the existing CSS variables, spacing rhythm, rounded corners, and interface language before inventing new patterns.
- Keep writing concrete and specific. Avoid generic startup filler, exaggerated claims, stock-photo sections, excessive glassmorphism, or decorative gradients without a purpose.
- Mobile is not an afterthought. Every change must work at desktop, tablet, and phone widths without horizontal overflow.

## Implementation rules

- Prefer small, targeted edits. Do not rewrite the whole page when changing one section.
- Keep TypeScript strict and avoid `any`.
- Use semantic HTML, accessible names, keyboard-operable controls, visible focus states, and adequate contrast.
- Use buttons for actions and links for navigation. Do not use click handlers on non-interactive elements.
- Keep component state minimal and local unless a feature genuinely needs broader state.
- Use existing interface symbols/CSS decoration for simple UI visuals. Do not add a large icon or component library for a few icons.
- Do not add secrets, credentials, analytics keys, or environment-specific values to source.
- Do not remove the social metadata or `public/og.png`.

## Validation

For local cross-platform work:

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint:local`
4. `npm run build:local`

Use `npm run dev:local` for development. The hosted `npm run build` wrapper targets the Linux deployment environment.

Before finishing a task, summarize the exact files changed, confirm the validation performed, and call out any remaining limitation instead of hiding it.
