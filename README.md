# MalluImposter

**One word. One imposter. Can you find them?**

A premium, mobile-first Malayalam + English imposter party game for one phone. Players pass the phone around, everyone secretly sees the same word — except the Imposter, who (optionally) gets only a weak clue. Discuss, vote, reveal.

- Live URL: `https://malluimposter.vercel.app/` (configured via `NEXT_PUBLIC_APP_URL`)
- Frontend only. No backend, no accounts, no analytics. Everything runs in the browser and works offline after the first visit (PWA).

## Stack

- Next.js 16 (App Router, Turbopack, static output), React 19, TypeScript (strict)
- Tailwind CSS v4 (CSS-first tokens, dark + light themes)
- Zustand 5 (+ `persist` for preferences only — secrets never touch storage)
- framer-motion 13 (`LazyMotion` + `m` — loaded only on game routes)
- Vitest for logic, dataset and persistence tests
- Fonts: Manrope (Latin) + Anek Malayalam (Malayalam), self-hosted via `next/font`

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # typecheck + lint + tests
npm run build && npm start
```

Environment:

```env
# .env (committed, non-secret) / .env.example
NEXT_PUBLIC_APP_URL=https://malluimposter.vercel.app/
```

Deploy to Vercel as-is (`npm run build`). No environment secrets are required.

## Project structure

```
src/
  app/                    routes: / (home), /game, /how-to-play, manifest, sw.js, error, not-found
    (play)/               route group: game + rules screens get the animation provider
    sw.js/route.ts        build-versioned service worker (offline support)
  components/
    brand/                Logo + Wordmark (temporary mark — replace when assets arrive)
    game/                 Setup, Reveal, Discussion, Voting, Result, Timer, pickers…
    home/                 Home (server component), HowToPlay, LanguageSwitcher, ThemeToggle
    i18n/I18nText.tsx     server-renderable bilingual text (no hydration needed)
    layout/               StoreHydrator, ServiceWorkerRegistration, MotionProvider, HydrationGate
    ui/                   Button, IconButton, Toggle, SegmentedControl, Card, Dialog, Screen, icons…
  data/
    types.ts              WordEntry / Category / Language types
    categories.ts         category config (names in both languages, which languages have words)
    translations.ts       ALL UI copy (en + ml, type-checked to be complete)
    words/                one dataset file per language × category (580 curated words + clues)
    english.ts, malayalam.ts, index.ts
  store/game-store.ts     settings (persisted) + round state machine (memory only)
  lib/                    game logic (pure), crypto randomness, dataset validation, storage, site
  hooks/                  useTranslation, useCountdown, useMediaQuery, useWakeLock
  test/                   vitest suites
scripts/generate-icons.mjs  rasterises the SVG mark into PWA icons + OG image (uses Next's bundled sharp)
```

## Player names

Setup lists one optional name field per player (persisted with preferences, max 24 chars). Names are frozen into the round when it starts and shown on the reveal, voting and result screens; blank seats fall back to "Player N". The Imposter is always chosen with `crypto.getRandomValues()` — names never influence it.

## Game flow

`setup → revealing → discussion → voting → result` (explicit phases in the store). The whole round lives on `/game` as a state-driven flow; the secret word is never in the URL, document title, or localStorage. The imposter's reveal UI only ever receives `{ kind: "imposter", clue }` (see `selectCurrentReveal`), so it cannot render the word.

## Datasets & clue philosophy

Each entry is `{ id, word, category, clue, difficulty }`. Clues are deliberately **low-information associations** (e.g. `കട്ടിൽ → മരം`, `Pizza → Oven`, `Elephant → Safari`): enough for the imposter to bluff, not enough to guess the word. `npm test` validates every dataset (ids, categories, no duplicates, clue ≠ word, script checks, repetition limits).

To add words: append to the relevant `src/data/words/*.ts` file. To add a new Malayalam category: add the words file, include it in `src/data/malayalam.ts`, and add `"ml"` to that category's `languages` in `src/data/categories.ts` (a test enforces consistency).

## Branding

`src/components/brand/Logo.tsx` holds the temporary SVG mark and the two-tone wordmark. Replace the SVG paths there and in `scripts/generate-icons.mjs`, then run `npm run icons` to regenerate `public/icons/*`, `public/og.png`, `src/app/icon.png` and `src/app/apple-icon.png`.

## Localisation

All copy lives in `src/data/translations.ts`. The Malayalam table is typed against the English keys, so a missing Malayalam string is a compile error. Static screens (home, rules) render both languages server-side and CSS shows the active one from `<html lang>` — set before first paint from the persisted preference — so there is no language flash and no hydration wait.

## PWA / offline

`/sw.js` is generated at build time with a per-build version. Navigations are network-first (fallback to cache), hashed `/_next/static` assets are cache-first, RSC payloads are never cached. Installable via `/manifest.webmanifest` (standalone, portrait, maskable icon).

## Accessibility & motion

Semantic headings, labelled controls, `role="switch"` / `radiogroup`, visible focus rings, ≥44px touch targets, `aria-live` only where it helps (timer end, reveal), and reduced-motion support via `MotionConfig reducedMotion="user"` plus a global CSS media query.
