---
applyTo: "app/**/*.tsx,app/**/*.css"
---

# WordSifter interface instructions

- Preserve the existing dark navy, white, violet, magenta, orange, green, red, and blue color roles.
- Reuse current section widths and responsive breakpoints unless the task requires a deliberate layout change.
- All new sections need a clear hierarchy: eyebrow (optional), direct heading, short supporting copy, and one primary action at most.
- Test content at narrow widths conceptually: controls must wrap, grids must collapse, text must remain readable, and no element may rely on hover alone.
- Maintain the distinctive product-dashboard mockup rather than replacing it with a generic browser frame.
- Avoid inline style objects; place reusable visual rules in `app/globals.css`.
- Do not introduce remote fonts or imagery without an explicit request.
