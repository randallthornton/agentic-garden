---
kind: graft
name: tailwind-union
version: 0.1.0
requires: ["angular-spa@^0.1.0"]
stage: seedling
genetics:
  - tailwindcss@4
  - "@tailwindcss/postcss"
  - postcss
feed: []
soundness: "build, test, and boot with Tailwind utilities and Material components"
fit: "Tailwind owns layout; Material owns component appearance"
value: "utility-first layout without forking Material's component idioms"
---

# Tailwind union

This graft joins Tailwind CSS 4 onto an Angular SPA grown from `angular-spa@^0.1.0`. The plant becomes a chimera: Angular and Material keep their genetics; Tailwind contributes utility-first layout. The union is explicit so the two idioms do not leak into each other.

## Union contract

- **Material owns components.** Use Material components for buttons, form fields, dialogs, navigation, tables, and accessibility. Do not restyle Material internals with Tailwind utilities.
- **Tailwind owns layout.** Use Tailwind for page composition, spacing, flex/grid, responsive breakpoints, and utility classes on wrapper elements.
- **No Tailwind Preflight.** Material owns the base layer. Import only `tailwindcss/theme.css` and `tailwindcss/utilities.css`; do not import `tailwindcss/preflight.css`.
- **Tokens bridge, not duplicate.** Map Tailwind theme tokens to Material system variables (`--mat-sys-*`) so `bg-primary` and `text-on-surface` follow the Material theme. Do not define a second color palette.
- **No `@apply` on Material internals.** Use Material's theming API for Material components. `@apply` is allowed only in component styles for non-Material elements, and even then prefer utility classes in templates.
- **One styling system per concern.** If a choice belongs to Material, use Material. If it belongs to layout, use Tailwind. Do not mix both on the same concern.

## Sowing

Apply this graft after the Angular SPA has germinated. Work in the bed (for example `apps/web`).

1. Install Tailwind 4 and its PostCSS plugin:

   ```bash
   pnpm add -D tailwindcss @tailwindcss/postcss postcss
   # or: npm install -D tailwindcss @tailwindcss/postcss postcss
   ```

2. Create `.postcssrc.json` in the bed root:

   ```json
   {
     "plugins": {
       "@tailwindcss/postcss": {}
     }
   }
   ```

3. Create `src/tailwind.css`:

   ```css
   @layer theme, base, components, utilities;

   /* Material owns the base layer. Skip Tailwind Preflight. */
   @import "tailwindcss/theme.css" layer(theme);
   @import "tailwindcss/utilities.css" layer(utilities);

   @theme {
     --color-primary: var(--mat-sys-primary);
     --color-on-primary: var(--mat-sys-on-primary);
     --color-surface: var(--mat-sys-surface);
     --color-on-surface: var(--mat-sys-on-surface);
   }
   ```

4. Add `src/tailwind.css` to the `styles` array in `angular.json`, after `src/styles.scss`:

   ```json
   "styles": [
     "src/styles.scss",
     "src/tailwind.css"
   ]
   ```

5. Verify the union with one page that uses both systems:

   ```html
   <div class="flex flex-col gap-4 p-4">
     <mat-card>
       <mat-card-content>Material owns this component.</mat-card-content>
     </mat-card>
   </div>
   ```

   The wrapper uses Tailwind for layout. The card stays Material. Do not put Tailwind utilities on the card internals to restyle them.

6. Record the graft in the plant's journal:

   ```text
   seed:  angular-spa@0.1.0
   graft: tailwind-union@0.1.0
   union: Material components / Tailwind layout / no Preflight
   ```

   Do not edit the seed.

## Germination bar

- Install.
- Build.
- Test.
- Boot a page that uses a Tailwind layout utility and a Material component.
- Confirm the built CSS contains the Tailwind utility and the Material theme variables (`--mat-sys-*`).

If Tailwind utilities are missing, or Material styles are broken, the union failed. Stop and report it. Do not paper over the failure with a workaround.

## What this graft is not

- It is not a replacement for Material. If you want Tailwind-only, that is a different seed or cultivar, not this graft.
- It is not a second design system. Do not define a parallel palette or spacing scale; bridge to Material tokens.
- It is not a license to put utility classes on Material internals.

## Graduation

If the variety always uses Tailwind, the graft graduates into the next seed generation as a major bump. Until then, the seed stays Material-only and this graft stays in the journal.
