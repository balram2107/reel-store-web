# Reel Store web

Next.js (App Router, TypeScript, no UI library) frontend for the Reel Store API. Design source: `DESIGN.md` and the design canvas.

## Run
```
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL = deployed Rails origin (no /api/v1)
npm install
npm run dev
```
The Rails app must allow CORS from this origin for the headers Authorization, X-Store-ID, Idempotency-Key and Content-Type.

## Routes
Marketing: `/`, `/privacy`, `/terms`, 404 (`app/not-found.tsx`, footer links to both legal pages)
Buyer: `/[slug]` (Classic and Insta Aesthetic themes), `/[slug]/p/[id]`, `/[slug]/cart`, `/[slug]/checkout`, `/pay/[token]`, `/track/[token]`
Auth: `/login` (email code), `/stores` (switch store)
Seller: `/onboarding/[step]` (1 to 5), `/dashboard`, `/orders`, `/orders/[id]`, `/products`, `/products/new`, `/products/[id]` (multi-photo), `/settings` (details, delivery, payments, WhatsApp, status, look)
Admin: `/admin/stores`, `/admin/stores/new`, `/admin/stores/[id]` (edit, suspend, reinstate)

## Code map
`lib/api.ts` fetch wrapper (bearer token, X-Store-ID, error shape), `lib/types.ts`, `lib/cart.ts` (cart lives in localStorage; server quotes prices), `lib/format.ts` (paise to rupees, theme text colour, statuses), `components/` shared UI, `app/globals.css` design tokens.

## Assumptions that need backend changes
See `API_CHANGES_PROMPT.md`. Until they land: `/stores` calls `GET /seller/stores`; seller order buttons are chosen from status plus `can_cancel`; image uploads send `images[]`, logo/banner send `file`; cleared optional fields can't be unset.
