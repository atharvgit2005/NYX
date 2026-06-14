# NYX Studio — Full Frontend Design Report

**Date:** 2026-06-14
**Scope:** Entire site — public marketing (home, about, services, work, contact, glossary, clients/[slug]) + client/admin portal (login, signup, portal dashboard, admin dashboard, calendar-builder, posts workspace, brand forms).
**Method:** Source-code audit (all page + component files) **and** live-rendered inspection (dev server on :3000, computed-style + contrast measurement, screenshots).
**Lenses:** Visual design · Accessibility (WCAG 2.1 AA) · Design system · Responsive/mobile.

Items marked **✓ VERIFIED LIVE** were confirmed by measuring the running app, not just reading code.

---

## 1. Executive summary

NYX Studio has a **strong, distinctive visual identity** — a brutalist/zine aesthetic (sharp 0-radius corners, heavy Space-Grotesk display type, hard black borders + offset shadows, orange/peach/yellow accents on near-black). The hero pages look confident and on-brand.

Underneath, the frontend has **four systemic problems that affect nearly every page**:

1. **The design system is not actually a system.** The Tailwind token palette in `tailwind.config.ts` (a Material-Design-3 peach/coral set) is essentially **dead** — overridden by a hand-written **~2,080-line utility-class polyfill in `globals.css`** that redefines Tailwind utilities AND repaints the theme orange. Semantic class names **lie** (`.text-purple-*`, `.text-pink-*`, `from-purple-*` all resolve to orange hex). Pages then freely mix tokens with raw hex. There are **at least two different "brand oranges"** in production (`#E8441A` in marketing/auth vs `#f97316`/`#fb923c` from the polyfill) and **four uncoordinated font systems** (config Space Grotesk/Work Sans; globals `--font-outfit`; auth inline Space Grotesk/Work Sans; portal Playfair/Inter).

2. **Accessibility is broken in ways users will actually hit.** Focus indicators are globally suppressed (`globals.css .focus:outline-none` + `focus:ring-0` + `.brutal-input { outline:none }`); **✓ VERIFIED** the login submit button shows `outline:none` / no box-shadow on focus and inputs get a `2px solid transparent` (invisible) outline. Real headings are faked as `<div role="heading">` across auth + admin (**✓ VERIFIED** login has 0 `<h1>`). The admin posts workspace (drag-and-drop kanban/calendar) is **mouse-only** — no keyboard sensor. And there are **shipping contrast failures**: **✓ VERIFIED** the About "Quick Facts" block renders black text on a dark surface at **1.22:1** (needs 4.5:1) across 11 rows; the orange CTA button is white-on-orange at **3.98:1** site-wide.

3. **No shared component layer → pervasive drift.** Header, footer, nav, and the primary CTA are **hand-re-implemented on every page** with divergent link sets, casing, hover treatments, button colors, and landmark tags. **✓ VERIFIED** the logo is white on home but yellow on services; the CTA is peach on home but orange on services; "HOME" is missing from the nav on inner pages. The one real shared button (`NyxButton`) uses a *different* (rounded, theme-variable) design language and is used by none of the marketing pages.

4. **Content depends on JavaScript to be visible.** `GlobalAnimations.tsx` animates every `h1/h2/h3` site-wide from `opacity:0` with GSAP, with **no `prefers-reduced-motion` guard anywhere** in the codebase. **✓ VERIFIED** on first load 10 of 11 home-page headings sit at `opacity:0` and the page paints black until scroll triggers fire; the contact form fields and many sections also start at `opacity:0`. If JS fails/stalls, or a user requests reduced motion, the experience degrades badly.

**Bottom line:** the *look* is good; the *system, accessibility, and robustness* need real work. The highest-leverage fixes are not visual — they're (a) a real design-token + shared-component layer, (b) restoring focus indicators + real headings + keyboard support, and (c) reduced-motion + no-JS visibility fallbacks.

---

## 2. Severity snapshot

| Severity | Count (approx) | Theme |
|---|---|---|
| **Critical** | ~12 | Invisible focus, faked headings, keyboard-inaccessible drag-and-drop, 1.22:1 contrast section, JS-only-visible form, inaccessible custom dropdown |
| **High** | ~30 | Color/nav drift, hardcoded-hex sprawl, missing reduced-motion, unassociated form labels, no mobile nav for admin, fixed-width kanban/calendar |
| **Medium** | ~35 | Token misuse, duplicated patterns, status-color inconsistency, sub-44px touch targets, muted-text contrast |
| **Low** | ~20 | Stale copy/years, icon labels, container-width inconsistencies, dead CSS |

---

## 3. Cross-cutting systemic issues (fix these first — they fix many pages at once)

### 3.1 Design tokens & the globals.css polyfill — **High**
- `tailwind.config.ts` defines MD3 tokens (`primary #ffb4a2`, `secondary #ffd65b`, `surface #131313`, …) but `globals.css` (lines ~300–2082) re-implements Tailwind utilities by hand and overrides the palette to orange. The config tokens are largely **dead weight**.
- `.text-purple-*` / `.text-pink-*` / `from-purple-*` → orange (globals.css:1774–1801). **Class names actively mislead** every future developer.
- Two brand oranges (`#E8441A` vs `#f97316`/`#fb923c`); one-off colors invented per page (`#F2A7C3`, `#76dc83`, `#1a0a05`, `#ab8981`, `#5b403a`, `#E91E8C`, `#1A2A5E`).
- **Fix:** pick ONE source of truth. Either commit to Tailwind tokens (delete the polyfill, let Tailwind generate utilities) or formalize the CSS-variable theme. Rename or remove the lying purple/pink classes. Define semantic tokens (`--brand`, `--surface`, `--text-muted`, `--status-*`) and migrate hex literals to them.

### 3.2 Focus indication globally removed — **Critical (WCAG 2.4.7 / 1.4.11)**
- `globals.css:1225 .focus:outline-none` ships a `2px solid transparent` outline; inputs/buttons add `focus:ring-0`; `.brutal-input` sets `outline:none`. **✓ VERIFIED**: focused login button = `outline:none`, `box-shadow:none`; focused input = invisible transparent outline, border stays black.
- **Fix:** add a single global `:focus-visible` ring (e.g. `outline: 2px solid var(--brand); outline-offset: 2px`) and stop stripping it. This one change fixes keyboard visibility across the whole app.

### 3.3 Faked headings — **Critical (WCAG 1.3.1 / 2.4.6)**
- Auth + admin screens use `<div role="heading" aria-level=n>` (and even bare `<div>` for section heads) to dodge a global GSAP `h1` animation bug. **✓ VERIFIED**: `/portal/login` has **0** `<h1>` elements. Screen-reader heading navigation is broken across the portal.
- **Fix:** use real `<h1>`/`<h2>`; **scope** the GSAP selector (e.g. `.animate-heading`) instead of targeting all headings globally.

### 3.4 No reduced-motion / no-JS fallback — **Critical/High (WCAG 2.3.3)**
- `GlobalAnimations.tsx` animates all headings from `opacity:0`; `page.css` has infinite marquee + `animate-pulse`; contact form + many sections start `opacity:0`. **✓ VERIFIED**: 10/11 home headings load at `opacity:0`; page is black until scroll.
- `GlobalAnimations.tsx:71–90` also attaches `mouseenter/mouseleave` listeners to **every** button/nav-svg imperatively and **never removes them** (leak on client navigation) and globally forces `scale:1.05` hover, fighting per-button styles.
- **Fix:** wrap all motion in `@media (prefers-reduced-motion: reduce)` + a JS guard; default initial state to **visible** and treat animation as progressive enhancement; remove the imperative hover listeners (use CSS) or clean them up.

### 3.5 No shared layout/components → drift — **High**
- Header/footer/nav/CTA re-implemented per page. **✓ VERIFIED** drift: logo white (home) vs yellow (services); CTA peach `#ffb4a2` (home/work) vs orange `#E8441A` (services); nav link set differs (no "HOME" on inner pages); hover is orange-bg on home, yellow-text on about, orange-text on glossary; active state shown 3 different ways; footer is 2-col on home, 1-row on about, **absent** on glossary.
- Header-offset padding disagrees even on desktop (`md:pt-28` vs `md:pt-32` vs `pt-[72px] md:pt-24`).
- `<header>` vs `<nav>` used inconsistently as the top-bar landmark.
- **Fix:** extract `<SiteHeader activePage>`, `<SiteFooter>`, `<FounderCard>`, a button component, and a layout wrapper that owns the fixed-header offset. Add a skip-to-content link there too (none exists on any page).

### 3.6 Recurring contrast failures — **High (WCAG 1.4.3)**
- **✓ VERIFIED** About "Quick Facts" `<dl>`: `#000` and `#000`/60% on `#1c1b1b` → **1.22:1** × 11 rows (`about/page.tsx:218–243`).
- **✓ VERIFIED** Primary orange CTA button: white text on `#E8441A` → **3.98:1** (fails for the ≤16px label) — appears on services, glossary, about, etc.
- Code-flagged (verify per theme): muted `#ab8981` on `#0e0e0e` ≈ 3.3–3.6:1 used for body/hint text in glossary + admin; `gray-500` excluded-item text on services; status pills (`#0e0e0e` on `#3da452`) ≈ 3.8:1.
- **Fix:** never use `on-*`/black tokens as text on dark surfaces; darken the orange or use black label text on it; lift muted text to meet 4.5:1.

---

## 4. Cluster findings

> Condensed; every item below has a file:line in the working notes. `✓` = verified live.

### 4.1 Marketing — Home / Layout / About / Glossary
- **[A11Y/Crit]** About "Quick Facts" 1.22:1 contrast ✓; black `<h2>` on `#0e0e0e` in Founders section; home Card 3 uses foreground token `on-surface` as a background.
- **[A11Y/High]** Decorative Material-Symbols icons render as literal ligature text with no `aria-hidden` (SR reads "star emergency add add"); marquee duplicates copy as real DOM text read twice; `↗`/`•` glyphs read aloud.
- **[A11Y/High]** `GlobalAnimations` hides all headings ✓; `ThemeProvider` ignores system `prefers-color-scheme` despite the comment, and applies theme in `useEffect` → light-theme FOUC.
- **[Visual/High]** Three divergent navs/footers ✓; logo wordmark size/element differs per page.
- **[DS/High]** Token+hex mix; `about` uses Tailwind `dark:` variants that never fire (theme is `[data-theme]`, not class strategy); glossary applies fonts via repeated inline `style` CSS-vars instead of `font-headline`; `NyxButton` is the only real shared button and nobody uses it.
- **[Resp/Med]** Hero `text-[6rem]` may collide with the star visual right after the `md` breakpoint; inconsistent long-title wrapping across bento cards.

### 4.2 Marketing — Services / Work / Contact / Clients
- **[A11Y/Crit]** Contact "MISSION_OBJECTIVE" dropdown is a custom `<div role=listbox>` with **no keyboard model** (no Arrow/Enter/Esc, trigger goes `opacity-0` when open) — replace with native `<select>` (also fixes mobile). Form fields start `opacity-0` → invisible if JS fails. Focus is border-color-only.
- **[A11Y/High]** Validation is a silent `return` with no feedback; error state lives only in an `sr-only` live region (sighted users see nothing).
- **[A11Y/Med]** Services "Brand-Growth" rows look clickable (`cursor-pointer` + arrow) but are plain non-interactive `<div>`s; FAQ uses good `<dl>` semantics but suspect contrast on the answer text.
- **[Visual/Med]** Stale "2024" eyebrow ✓ (footer says © 2026); Q3/Q4 messaging inconsistent across work vs contact; ad-hoc heading scale (`text-7xl/8xl/9xl`) for equal-hierarchy tiers; footer wordmark font differs.
- **[DS/High]** Same header re-implemented 3×; brand orange as `#E8441A` / `bg-primary` / `text-primary` interchangeably; one-off `#76dc83`/`#F2A7C3`/`#1a0a05`; container width `max-w-[1600px]` vs `max-w-7xl`.
- **[Resp/Med]** `break-all` on contact email forces ugly mid-word wraps; only the first service tier has `min-h-screen`.
- **[Note]** `clients/[slug]` loads a 3rd font world (Playfair/Inter) — fine if intentional, but undocumented; correctly `noindex`.

### 4.3 Portal — Auth (login / signup / portal client / AuthProvider)
- **[A11Y/Crit]** No focus indicator on inputs, "remember" checkbox, or both submit buttons ✓; headings faked as `<div role=heading>` and the giant hero text isn't a heading at all ✓ (0 `<h1>`).
- **[A11Y/High]** Login + signup errors funnel into one uppercased top banner — no `aria-invalid`, no field association, no focus move; raw NextAuth codes can leak (`OAUTHCALLBACK`). Signup re-implements password/confirm/textarea/Google button by hand → already drifted (confirm-password has no show/hide toggle).
- **[Visual/Crit]** The no-brand `[clientSlug]` fallback is a **third** design language (cream `#FAF7F2`, magenta `#E91E8C`, navy `#1A2A5E`, rounded) unrelated to the auth screens or the Playfair/Inter portal it sits inside.
- **[Visual/Med]** Heavy "ENTER THE VOID / SECURE_CHANNEL / IDENTITY@DOMAIN.VOID" cyberpunk tone clashes with a calm B2B partner portal; footer `© NYX STUDIO` + HOME link at `opacity-40` is near-invisible.
- **[DS/High]** Dozens of hardcoded hex; ~15+ inline `fontFamily` style declarations; orange `#E8441A` ≠ globals orange; `VERSION_2.4.0`/`BUILD 2.4.0`/`Q3'26` hardcoded & stale; Google button duplicated between login/signup.
- **[Resp/Low]** Password toggle + checkbox below 44px target; auth panel `justify-center` can clip tall signup form on short viewports.

### 4.4 Portal — Admin (dashboard / calendar-builder / posts / brand forms)
- **[A11Y/Crit]** Drag-and-drop (KanbanView, CalendarView) uses `PointerSensor` only — **no KeyboardSensor, no dnd-kit announcements** → core workflow is mouse-only & silent to SR. Post cards / day chips are clickable `<div>`s with no role/tabindex/key handler. "Add post" buttons are `opacity-0 group-hover` → hover-only, invisible to keyboard/touch.
- **[A11Y/Crit]** Real headings faked everywhere; Approve/Reject modal has no `role=dialog`/`aria-modal`/focus-trap/Esc/focus-restore; destructive Archive guarded only by `window.confirm()`.
- **[A11Y/High]** Calendar-builder slot grid is `<div>`s not a table; per-row date/select inputs have **no labels**. Brand-form labels not associated (`htmlFor`/`id` missing); platform/package toggle buttons have no `aria-pressed`/group semantics; validation is toast-only.
- **[Visual/Med]** Two icon systems in sibling screens (lucide in calendar-builder, material-symbols elsewhere — the dashboard code comment even says to avoid lucide); Kanban vs Calendar define **different** `STATUS_ACCENT` colors for the same statuses; status-pill text contrast borderline.
- **[DS/Med]** `HEAD`/`BODY` font objects + `.brutal-input` + color constants duplicated across 5–7 files; `.brutal-input` defined twice as styled-jsx globals; form container width `max-w-7xl` (new) vs `max-w-3xl` (edit) for the same form.
- **[Resp/High]** Desktop-only `<aside>` sidebar with **no mobile nav**; fixed-width kanban (~1320px), calendar (7-col `min-h-[120px]`), and slot grid (~490px fixed cols) only horizontally scroll on mobile; many `text-[10px]` action buttons ~30–32px tall (sub-44px).

---

## 5. Prioritized remediation roadmap

**P0 — Accessibility blockers (ship-stoppers):**
1. Restore a global `:focus-visible` indicator; remove `outline:none`/`ring-0`/`.brutal-input{outline:none}`.
2. Replace all `<div role="heading">` with real `<h1>/<h2>`; scope the GSAP heading animation.
3. Fix the About "Quick Facts" 1.22:1 contrast and the 3.98:1 CTA; sweep muted-text colors to ≥4.5:1.
4. Add `KeyboardSensor` + dnd-kit announcements to kanban/calendar; make cards/chips real buttons; provide a non-drag fallback.
5. Replace the custom contact dropdown with a native `<select>`; surface visible validation + error states.

**P1 — Robustness & motion:**
6. Add `prefers-reduced-motion` handling everywhere; default content to visible (no JS-only `opacity:0`); add no-JS fallback for hero/form.
7. Remove the leaking imperative hover listeners in `GlobalAnimations`.
8. Add a skip-to-content link and consistent landmarks; add a mobile nav for the admin sidebar.

**P2 — Design system consolidation:**
9. Choose one token source; delete or fully adopt the globals.css polyfill; rename the lying purple/pink classes; unify the brand orange.
10. Consolidate to one type system (or document the marketing/portal split intentionally).
11. Extract `SiteHeader`/`SiteFooter`/`FounderCard`/button/field components; route every form field through shared `Field*` components; unify icon library and `STATUS_ACCENT`.

**P3 — Responsive & polish:**
12. Stack/scroll-contain the fixed-width admin grids; enforce 44px min touch targets.
13. Fix stale copy (2024 eyebrow, Q3/Q4, hardcoded version strings); standardize container widths and header-offset padding.

---

## 6. Methodology & caveats
- Code audit covered all 16 routes and their co-located client components.
- Live checks ran against `npm run dev` on :3000 at 1280px (desktop) and the mobile breakpoint, using computed-style + WCAG contrast math and DOM inspection. Contrast/focus/heading claims marked ✓ were measured.
- Pixel screenshots were unreliable on the marketing pages because the heavy GSAP reveal animations repaint during capture; DOM measurement (used for the verified claims) showed layouts are actually full-width, so the narrow-capture artifact was **not** reported as a layout bug.
- Auth-gated admin pages were audited primarily via source; the systemic issues verified on public pages (focus, headings, tokens, motion) apply to them by shared code.
