# NYX Studio Client Portal — Onboarding Guide

This portal lives at `/clients/[slug]` and is data-driven. Adding a new client takes 2 minutes.

## How to onboard a new client

### 1. Create a config file

Duplicate `src/app/clients/data/dessertino.config.json` and rename it to match the client slug.

**File naming:** use lowercase, hyphens for spaces. The filename = the URL path segment.

```
src/app/clients/data/
  dessertino.config.json     → /clients/dessertino
  frullato.config.json       → /clients/frullato
  shakes-and-more.config.json → /clients/shakes-and-more
```

### 2. Fill in the config

Update these fields in the new JSON:

| Field | What to change |
|---|---|
| `client.*` | Name, contact, products, operations |
| `brand.primary/secondary/accent` | Hex colors from brand kit |
| `auth.password` | Unique client password |
| `campaign.*` | Pack name, period, post totals |
| `posts[]` | All scheduled posts with captions, hashtags, directions |
| `packB.*` | In-store screen content brief (if applicable) |
| `agency.*` | Keep as-is (NYX Studio details) |

### 3. Share the link

Hand the client:
- **URL:** `https://www.nyxstudio.tech/clients/[their-slug]`
- **Password:** whatever you set in `auth.password`

No other setup needed. The portal renders automatically from the config.

---

## Post structure

Each post in the `posts[]` array:

```json
{
  "id": 1,
  "title": "Short hook title",
  "date": "2026-05-05",
  "day": "Tuesday",
  "type": "Reel",
  "status": "Idea",
  "caption": "Full IG caption text\n\nWith line breaks\n\n📍 Location info",
  "hashtags": ["Tag1", "Tag2"],
  "visualDirection": "Shot-by-shot instructions for the production team.",
  "productionNotes": "REEL #1 — Crew-facing notes."
}
```

**Supported content types:** `Reel` · `Carousel` · `Photo` · `Reel + Story` · `Story`

**Status pipeline:** `Idea` → `Drafting` → `Needs Approval` → `Needs Revision` → `Approved` → `Posted`

---

## Brand color customization

Each client config has a `brand` object that controls all accent colors in the portal:

```json
"brand": {
  "primary": "#E91E8C",   // CTAs, accents, calendar dots
  "secondary": "#00AEEF", // hashtag pills, status badges
  "accent": "#1A2A5E"     // headers, body text
}
```

---

## Security note

Auth is client-side (sessionStorage). The password lives in the config JSON, which is bundled into the page. This is intentional — the portal is a convenience tool for clients, not a system handling sensitive data. For higher-security use cases, move auth to middleware or a server action.

---

## Adding new content types

Edit `src/app/clients/types.ts`:
- Add the new type to `TYPE_COLORS`
- Add the gradient to `TYPE_GRADIENTS`

The calendar, cards, feed preview, and modal all pick up the new type automatically.
