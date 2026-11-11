# Reel Store Design Language

> Status: v0.3, draft (adds app components for seller and buyer screens; v0.2 added marketing-site components, blue-hover and blue-tint tokens). Derived from decisions, not from built screens.
> "proposed" = suggested, awaiting review. "verified" = contrast checked.

## Visual Theme

Calm, trustworthy, plain-spoken tool.
Reel Store should feel like a dependable shop counter for small Indian sellers:
neutral surfaces, one confident blue, green only when money is confirmed.
Storefronts belong to sellers and carry their own theme; Reel Store's own look
appears around trust moments (pay page, receipts, tracking) and in the seller
dashboard, emails and marketing site.

## Color Palette

### Neutrals (slate scale, primitives)

| Token       | Value   | Role                          |
| ----------- | ------- | ----------------------------- |
| neutral-0   | #FFFFFF | Cards, inputs                 |
| neutral-50  | #F8FAFC | Page background ("Mist")      |
| neutral-200 | #E2E8F0 | Default borders               |
| neutral-300 | #CBD5E1 | Strong borders                |
| neutral-500 | #64748B | Muted text                    |
| neutral-900 | #0F172A | Text, "reel" wordmark ("Ink") |

Other steps (100, 400, 600, 700, 800) follow the standard slate scale; not yet adopted.

### Brand / Primary

| Token      | Value   | Role                                                                |
| ---------- | ------- | ------------------------------------------------------------------- |
| blue-600   | #1E4FD6 | Primary actions, links ("Trust blue")                               |
| blue-hover | #1A42B3 | Hover/pressed (white on it 8.49, verified)                          |
| blue-tint  | #E8EEFC | Selected/info background (blue-600 on it 5.75, Ink 15.36, verified) |

### Semantic

| Role           | Light                                                       | Dark        |
| -------------- | ----------------------------------------------------------- | ----------- |
| text-primary   | #0F172A                                                     | not defined |
| text-muted     | #64748B                                                     | not defined |
| bg-page        | #F8FAFC                                                     | not defined |
| bg-surface     | #FFFFFF                                                     | not defined |
| border-default | #E2E8F0                                                     | not defined |
| action-primary | #1E4FD6 (text #FFFFFF)                                      | not defined |
| status-success | #15803D, tint #DCFCE7                                       | not defined |
| status-warning | #F59E0B fill, text #0F172A; text-on-tint #92400E on #FEF3C7 | not defined |
| status-danger  | #DC2626 (text #FFFFFF)                                      | not defined |

### Verified contrast (WCAG ratios)

| Pair                     | Ratio                   |
| ------------------------ | ----------------------- |
| Ink on Mist              | 17.06                   |
| Muted #64748B on white   | 4.76                    |
| White on blue-600        | 6.68                    |
| White on success green   | 5.02                    |
| Success green on #DCFCE7 | 4.57                    |
| #92400E on #FEF3C7       | 6.37                    |
| White on danger red      | 4.83                    |
| Ink on saffron           | 8.31                    |
| White on saffron         | 2.15 (fails: never use) |

## Typography

**Families:** Inter + Noto Sans Devanagari (Hindi fallback). Both Google Fonts,
free, variable. Self-host, subset, `font-display: swap`.
**Weights:** 400 body, 500 labels/buttons, 600 headings and "reel" in wordmark.
**Numerals:** tabular figures for prices and order amounts.
**Scale ratio:** loose ~1.25 (proposed, not yet tested with Hindi)

| Token   | Size | rem   | Role                     | Line height |
| ------- | ---- | ----- | ------------------------ | ----------- |
| caption | 12px | 0.75  | Meta, helper text        | 16px        |
| body-sm | 14px | 0.875 | Dense UI, labels         | 20px        |
| body    | 16px | 1     | Forms, storefront text   | 24px        |
| h3      | 18px | 1.125 | Card/section titles      | 28px        |
| h2      | 22px | 1.375 | Page sections            | 30px        |
| h1      | 28px | 1.75  | Page titles              | 36px        |
| display | 36px | 2.25  | Wordmark, marketing hero | 44px        |

## Components

All planned, none built or observed yet.

| Component                 | Hierarchy | Purpose                                                                                                                                                                                                                                                                                                                                             | Key variants                                                                                                                                           |
| ------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Wordmark                  | Primitive | "reel" 600 Ink + "store" 400 neutral-500                                                                                                                                                                                                                                                                                                            | Light bg; dark/mono TBD                                                                                                                                |
| Button                    | Primitive | Actions                                                                                                                                                                                                                                                                                                                                             | Primary, secondary, destructive; default/hover/focus/disabled/loading                                                                                  |
| Input / OTP field         | Primitive | Email, OTP, address, UPI ID                                                                                                                                                                                                                                                                                                                         | Default, focus, error, disabled                                                                                                                        |
| Status badge              | Primitive | Order state in words + colour                                                                                                                                                                                                                                                                                                                       | Placed (neutral), awaiting payment (warning), payment submitted (blue), paid (success), packed/shipped (blue), delivered (success), cancelled (danger) |
| Product card              | Component | Storefront listing                                                                                                                                                                                                                                                                                                                                  | Classic, Insta Aesthetic (seller-themed)                                                                                                               |
| Share panel               | Component | Copy link, WhatsApp, QR poster                                                                                                                                                                                                                                                                                                                      | Dashboard, post-setup                                                                                                                                  |
| Pay page                  | Pattern   | UPI app buttons, QR, 10-min expiry, "I've paid" + UTR                                                                                                                                                                                                                                                                                               | Mobile, desktop                                                                                                                                        |
| Checkout form             | Pattern   | Single-page guest checkout (pincode auto-fill)                                                                                                                                                                                                                                                                                                      | UPI, COD                                                                                                                                               |
| Order timeline            | Pattern   | Placed to delivered, shipping details                                                                                                                                                                                                                                                                                                               | Buyer, seller                                                                                                                                          |
| Setup checklist           | Pattern   | Seller onboarding progress                                                                                                                                                                                                                                                                                                                          | New, partial, complete                                                                                                                                 |
| Suspended-store page      | Template  | Clear "store unavailable" (not 404)                                                                                                                                                                                                                                                                                                                 | Closed, ended, suspended                                                                                                                               |
| Email template            | Template  | Receipts, payment, shipping updates                                                                                                                                                                                                                                                                                                                 | Buyer, seller                                                                                                                                          |
| Link                      | Primitive | Text links, always underlined                                                                                                                                                                                                                                                                                                                       | Default (blue-600), muted; hover blue-hover; visible focus ring                                                                                        |
| Button (update, v0.2)     | Primitive | Adds `onBlue` variant: white fill, blue-600 text (6.68), for use on blue bands                                                                                                                                                                                                                                                                      | onBlue                                                                                                                                                 |
| SiteHeader                | Component | Sticky marketing header: wordmark, "Log in" link (768px+), primary CTA                                                                                                                                                                                                                                                                              | default, scrolled (1px bottom border)                                                                                                                  |
| SectionHeading            | Component | Section title + short intro                                                                                                                                                                                                                                                                                                                         | align: left, center                                                                                                                                    |
| Hero                      | Pattern   | Headline, subtext, primary + secondary CTA, visual slot                                                                                                                                                                                                                                                                                             | stacked (mobile), split (1024px+)                                                                                                                      |
| StepList                  | Component | Numbered steps (3)                                                                                                                                                                                                                                                                                                                                  | stacked, row (768px+)                                                                                                                                  |
| FAQ                       | Component | Question (h3) + answer (body) list; no accordion in v0.2                                                                                                                                                                                                                                                                                            | list                                                                                                                                                   |
| CtaBand                   | Pattern   | Final signup band: blue-600 background, white heading, `onBlue` Button                                                                                                                                                                                                                                                                              | default                                                                                                                                                |
| Footer                    | Component | Wordmark, link groups, legal row (Privacy, Terms)                                                                                                                                                                                                                                                                                                   | default                                                                                                                                                |
| Card                      | Primitive | Base container: white, 1px neutral-200 border, 12px radius, 16px padding                                                                                                                                                                                                                                                                            | default                                                                                                                                                |
| Field                     | Primitive | Label above input (14/500), 44px input, 16px text, helper text below                                                                                                                                                                                                                                                                                | default, focus, error, disabled; text, tel, email, file, color, date, select, textarea                                                                 |
| RadioOption / CheckOption | Primitive | 44px row with radio or checkbox + label; checkboxes are used for on/off settings                                                                                                                                                                                                                                                                    | on, off, disabled                                                                                                                                      |
| StatCard                  | Component | Label + large number                                                                                                                                                                                                                                                                                                                                | default                                                                                                                                                |
| OrderRow                  | Component | Order ID, customer, amount, status badge, Open link                                                                                                                                                                                                                                                                                                 | by status                                                                                                                                              |
| ProductRow                | Component | 56px photo, name, price and stock, status badge, Edit link                                                                                                                                                                                                                                                                                          | Live, Hidden                                                                                                                                           |
| FilterLinks               | Component | Row of text links to filter a list; current item bold                                                                                                                                                                                                                                                                                               | default                                                                                                                                                |
| AppHeader                 | Component | Wordmark, store name, nav (Dashboard, Orders, Products, Settings), View store, Log out; current link bold with aria-current                                                                                                                                                                                                                         | seller, admin                                                                                                                                          |
| Stepper                   | Component | Onboarding progress; every step has a word (Done, Now) as well as a marker                                                                                                                                                                                                                                                                          | 5 steps                                                                                                                                                |
| ThemeOption               | Component | Radio card with live preview                                                                                                                                                                                                                                                                                                                        | selected, unselected                                                                                                                                   |
| Alert                     | Primitive | Inline error or info banner for API failures (rate limit, store unavailable, stock)                                                                                                                                                                                                                                                                 | error, info                                                                                                                                            |
| CartRow                   | Component | 56px photo, name, variant, quantity stepper (44px buttons), price, Remove; unavailable lines show "No longer available"                                                                                                                                                                                                                             | available, unavailable                                                                                                                                 |
| StoreCard                 | Component | Store name, link, Open/Closed and Setup-incomplete badges, "Open store" action; used on the Switch store page                                                                                                                                                                                                                                       | current, other                                                                                                                                         |
| Consent checkbox          | Primitive | Required checkbox at checkout; the API requires `consent: true`                                                                                                                                                                                                                                                                                     | unchecked, checked, error                                                                                                                              |
| Status: expired           | Rule      | Order status `expired` uses the danger badge; the pay page then offers "Get a new payment window"                                                                                                                                                                                                                                                   | n/a                                                                                                                                                    |
| ProductGallery            | Component | Square main photo with "1 / 4" counter; Classic adds 72px thumbnails, Insta Aesthetic adds position dots (counter always shown)                                                                                                                                                                                                                     | Classic, Insta                                                                                                                                         |
| Chip (variant option)     | Primitive | 44px radio chip for size/colour; selected = 2px theme-button border                                                                                                                                                                                                                                                                                 | selected, unselected, focus                                                                                                                            |
| Insta Aesthetic theme     | Theme     | Seller-themed storefront: round logo with accent ring, highlight circles, 3-column square product grid with accent price chips, product page with dots. Driven by three seller tokens: theme-button (default #1E4FD6), theme-accent (#F59E0B), theme-background (#F8FAFC). Text on accent is Ink; check contrast when a seller picks custom colours | storefront, product                                                                                                                                    |

## Layout

**Grid:** single column on mobile, 2-column product grid; 12-column on desktop (proposed)
**Base unit:** 4px (proposed)
**Spacing scale:** xs=4px, sm=8px, md=12px, lg=16px, xl=24px, 2xl=32px (proposed)
**Radius:** 8px controls, 12px cards, full for badges (as used in the draft previews)
**Touch targets:** at least 44px

## Depth

| Level     | Value                             | Used for              |
| --------- | --------------------------------- | --------------------- |
| 0 Flat    | 1px neutral-200 border, no shadow | Cards, inputs, panels |
| 1 Overlay | TBD, define before modals/sheets  | Sheets, dialogs       |

## Do's and Don'ts

### Do

- Use green only for confirmed money or success (paid, delivered).
- Put dark ink text on saffron, always.
- Show order status in words plus colour.
- Format prices as ₹ with tabular figures and Indian grouping (₹1,24,900).
- Keep storefronts seller-themed; use Reel Store colours at trust moments.

### Don't

- Don't use white text on saffron (fails contrast).
- Don't use purple or bright cyan as brand colours (they read as other payment apps).
- Don't fill large areas with saffron or red; it reads as sale or alarm.
- Don't use colour alone to signal status.
- Don't use pure black (#000); use Ink.

## Responsive

Mobile-first, 360px baseline; most buyers arrive from Instagram or WhatsApp on phones.
Breakpoints proposed: 768px (tablet), 1024px (desktop). Adaptations not yet observed;
define per screen before handoff.

## Agent Prompt Guide

- Use semantic tokens only; never raw hex values in components.
- Base unit is 4px; spacing comes from the scale.
- Inter + Noto Sans Devanagari; weights 400/500/600 only; wordmark is "reel" 600 + "store" 400.
- Green means paid/success only; saffron means waiting; text on saffron is Ink.
- Platform tokens apply to dashboard, emails, pay and tracking pages; storefronts use the seller's theme with a small "Powered by Reel Store" footer.
- Design mobile-first at 360px; touch targets at least 44px.

## Open items

Dark mode, full blue scale (hover/tint), overlay shadow, motion, final SVG
wordmark, icon set, Hindi type check, seller-theme token contract.
