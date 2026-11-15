---
kind: seed
name: angular-spa
version: 0.1.0
stage: seedling
genetics:
  - angular@22
  - angular-material@22
  - typescript
  - rxjs
  - angular-router
  - signals
  - vitest
feed:
  - package-manager
soundness: "install, build, test, and boot in a clean bed"
fit: "an Angular SPA shell in the plot's idiom, with Angular Material as the house UI"
value: "a working SPA shell that a feature leaf can grow into"
---

# Angular SPA

A standalone, signals-first Angular single-page application with Angular Material as the house UI. This seed grows the shell only. Features are grown by leaves from the shell.

## Hardiness

- Node.js 22 LTS or newer.
- A package manager. Use the plot's existing package manager if it has one: `packageManager` in `package.json`, or a lockfile (`pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`). Otherwise use pnpm.
- If pnpm is not installed, install it with `npm install -g pnpm` or use npm as the fallback. Record which manager was used in the journal.
- Do not ask the user to choose a package manager, UI framework, theme, or test runner. Those choices are either inherited from the plot or fixed by this seed.
- If the plot already uses a different UI system (Tailwind, Bootstrap, PrimeNG, NG-ZORRO, etc.), stop. This seed is Angular Material. Mixing UI systems is a failed union, not a variation.

## Choices

This seed is opinionated on genetics and flexible only on feed.

| Choice | Decision | Why |
| --- | --- | --- |
| Package manager | Inherit the plot's; otherwise pnpm | Feed: it changes lockfiles and scripts, not architecture. |
| UI framework | Angular Material | Genetics: it changes component idioms, theming, and every leaf's output. |
| Angular major | 22 | Genetics: major versions change the plant. |
| Style | SCSS | Genetics: Material theming. |
| Test runner | Vitest | Genetics: it shapes how leaves write tests. |
| SSR | Off | This is an SPA. |
| Zoneless | On | Signals-first Angular 22. |
| State | Signals and services; no global store | Keep the shell lean; add a store as a graft if a feature needs it. |
| File naming | Angular 2025 style guide | House idiom. |

## Sowing

Sow into a clean bed, not the plot root. Example: `apps/web`.

1. Verify Node: `node --version` is 22 or newer.
2. Detect the package manager from the plot. If none exists, use pnpm.
3. Scaffold with Angular CLI 22, non-interactively.

   pnpm:

   ```bash
   pnpm dlx @angular/cli@22 new web \
     --directory apps/web \
     --routing \
     --style scss \
     --ssr false \
     --zoneless \
     --strict \
     --test-runner vitest \
     --file-name-style-guide 2025 \
     --package-manager pnpm \
     --skip-git \
     --skip-install \
     --ai-config none \
     --defaults
   ```

   npm:

   ```bash
   npx @angular/cli@22 new web \
     --directory apps/web \
     --routing \
     --style scss \
     --ssr false \
     --zoneless \
     --strict \
     --test-runner vitest \
     --file-name-style-guide 2025 \
     --package-manager npm \
     --skip-git \
     --skip-install \
     --ai-config none \
     --defaults
   ```

   yarn:

   ```bash
   yarn dlx @angular/cli@22 new web \
     --directory apps/web \
     --routing \
     --style scss \
     --ssr false \
     --zoneless \
     --strict \
     --test-runner vitest \
     --file-name-style-guide 2025 \
     --package-manager yarn \
     --skip-git \
     --skip-install \
     --ai-config none \
     --defaults
   ```

   `--skip-git` is deliberate: the plot already has a repository. `--skip-install` is deliberate: install with the chosen manager so the lockfile is the plot's.

4. Install dependencies in the bed:

   ```bash
   pnpm install
   # or: npm install
   # or: yarn install
   ```

5. Add Angular Material:

   ```bash
   pnpm exec ng add @angular/material --theme=azure-blue --skip-confirmation
   # or: npx ng add @angular/material --theme=azure-blue --skip-confirmation
   # or: yarn ng add @angular/material --theme=azure-blue --skip-confirmation
   ```

   Do not ask for a theme. Azure/Blue is the house theme for this generation.

6. Shape the shell. Keep it a shell; do not grow features.

   ```text
   src/app/
   ├── core/        singletons: auth, config, HTTP interceptors
   ├── shared/      reusable UI, pipes, directives
   └── features/    lazy-loaded feature routes
   ```

   - Keep standalone components. Do not add NgModules.
   - Keep the Material schematic's providers in `app.config.ts`.
   - Add `provideRouter` and `provideHttpClient(withFetch())` if they are not already present.
   - Use signals for local state. Do not add NgRx or another global store in this generation.
   - Add one lazy home route in `app.routes.ts` and a `router-outlet` in `app.ts`.
   - Keep the Material theme in `styles.scss`.
   - Write `AGENTS.md` with the house conventions: standalone components, signals, feature folders, Material, no NgModules, no global store unless a graft is approved.

7. Germinate. All three checks must pass in the bed.

   ```bash
   pnpm exec ng build
   pnpm exec ng test --watch=false
   pnpm exec ng serve --port 4200
   # in another shell:
   curl -fsS http://localhost:4200/ >/dev/null
   ```

   Use `npx` instead of `pnpm exec` for npm, or `yarn` for yarn. Kill the dev server after the boot check.

   If any step fails, the seed is sterile. Stop and report it. Do not paper over the failure with a workaround.

8. Record the packet generation and the package manager in the plant's journal. Do not edit this seed.

## What this seed is not

- It is not a feature.
- It is not a design system. Angular Material is the house UI.
- It is not a state-management decision. Signals and services are enough for the shell; add a store as a graft only when a feature needs it.
- It is not a monorepo layout. If the plot needs multiple apps, that is a different seed or a mutation.

## Seed saving

Do not save seed at germination. If the shell needs a different UI system, package manager default, or Angular major, release a new generation. The old generation stays in the bank.
