# Shecluded color accessibility · reference site

A documentation site in the shape of material.io for the Shecluded accessible color system.

- **Live:** https://claude.ai/artifact/RQjFmkbvVr9wshbUheoaRW
- **Figma:** https://www.figma.com/design/CjkuZ1iutgScOiU62Lgw9P

Every demo is the real component from the loan application (aliased as `@app`), and every ratio comes from `pairings.json` (aliased as `@tokens`), the file `build_tokens.py` writes after measuring each pairing.

So this repo builds on its own, both are copied into `vendor/`:

- `vendor/loan-app/src` ← `../shecluded-loan-app/src`
- `vendor/tokens/` ← `../tokens/pairings.json` and `source.json`

After changing the loan app or the tokens, run `npm run sync` from the design-system workspace and commit the updated `vendor/`. Don't edit `vendor/` by hand.

```bash
npm install
npm run sync    # refresh vendor/ (needs the sibling folders)
npm run dev     # http://localhost:5180
npm run build   # dist/ plus dist/artifact.html, a self-contained page for publishing
```

Pages: overview, how to use the system, tonal scale, color roles, contrast pairings (with a live checker), status without color (with color-vision simulation), tokens, eight component pages (Overview / Color & contrast / Accessibility tabs), before and after, annotated screen, architecture, resources.
