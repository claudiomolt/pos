# ROADMAP — Mobile POS v2

## Phase 1 — Foundation
| # | Issue | Priority | Est. |
|---|-------|----------|------|
| 1 | Scaffold Next.js 15 + shadcn/ui + Tailwind + TypeScript strict | P0 | 1d |
| 2 | Zustand stores: `nostr`, `pos`, `currency`, `nfc`, `settings` | P0 | 1d |
| 3 | NDK setup + relay configuration | P0 | 0.5d |
| 4 | API route: `/api/nip05` — NIP-05 resolution proxy | P0 | 0.5d |
| 5 | API route: `/api/lnurl` — LUD-06/LUD-16 resolution proxy | P0 | 0.5d |
| 6 | API route: `/api/invoice` — Invoice request proxy | P0 | 0.5d |
| 7 | API route: `/api/rates` — Currency rates proxy (yadio.io) with 60s cache | P0 | 0.5d |
| 8 | Setup page: Lightning Address input + LUD-16 validation | P0 | 1d |
| 9 | PWA manifest + Service Worker + offline shell | P1 | 1d |

## Phase 2 — NIP-15 Menus
| # | Issue | Priority | Est. |
|---|-------|----------|------|
| 10 | Fetch stalls (kind:30017) from Nostr by merchant pubkey | P0 | 1d |
| 11 | Fetch products (kind:30018) by stall_id | P0 | 1d |
| 12 | Dynamic menu rendering with category grouping (by `t` tags) | P0 | 1d |
| 13 | IndexedDB cache for stalls/products + background sync | P1 | 1d |
| 14 | Category filter (tabs/chips) + text search | P1 | 0.5d |
| 15 | Fallback to free amount (numpad) when no stall found | P0 | 0.5d |

## Phase 3 — Payment Flow
| # | Issue | Priority | Est. |
|---|-------|----------|------|
| 16 | Cart component + order total calculation | P0 | 1d |
| 17 | Zap request (kind:9734) generation | P0 | 1d |
| 18 | Invoice request via LNURL callback + QR display (bolt11) | P0 | 1d |
| 19 | Zap receipt (kind:9735) subscription + payment confirmation | P0 | 1d |
| 20 | NFC reading: Web NFC API + Android WebView bridge | P0 | 1.5d |
| 21 | Proxy mode via lncurl/NWC disposable wallet | P1 | 2d |
| 22 | usePrint hook + receipt printing via Android bridge | P1 | 0.5d |
| 23 | Bitcoin block display (mempool.space WebSocket) | P2 | 0.5d |

## Phase 4 — Settings & Multi-currency
| # | Issue | Priority | Est. |
|---|-------|----------|------|
| 24 | Settings page: currency management (add/remove/reorder from 126 available) | P0 | 1d |
| 25 | useCurrency hook: dynamic currencies, conversion, 60s cache with fallback | P0 | 1d |
| 26 | Currency display selector in POS (respecting current layout pattern) | P0 | 0.5d |
| 27 | Settings persistence: localStorage + optional Nostr (kind:30078) | P1 | 0.5d |

## Phase 5 — Admin Panel
| # | Issue | Priority | Est. |
|---|-------|----------|------|
| 28 | Nostr login: NIP-07 (browser extension) + nsecBunker support | P0 | 1d |
| 29 | Admin dashboard layout + navigation | P0 | 0.5d |
| 30 | CRUD stalls: create/edit/delete (publish kind:30017) | P0 | 1.5d |
| 31 | CRUD products: create/edit/delete (publish kind:30018) | P0 | 1.5d |
| 32 | Product image upload (nostr.build or similar) | P1 | 0.5d |
| 33 | Availability toggle (quantity management) | P1 | 0.5d |
| 34 | Menu preview (live render as POS would show) | P1 | 1d |
| 35 | Import/Export JSON (migrate from old POS format) | P1 | 1d |
| 36 | Sales history: read zap receipts for merchant | P2 | 1d |

## Phase 6 — Testing & Polish
| # | Issue | Priority | Est. |
|---|-------|----------|------|
| 37 | Unit tests: lib functions (nostr, lnurl, currency, nfc) | P0 | 2d |
| 38 | Integration tests: menu loading, payment flow | P1 | 2d |
| 39 | E2E tests: setup → POS → checkout (Playwright) | P1 | 2d |
| 40 | Error handling: sonner toasts, no more alert() | P0 | 0.5d |
| 41 | Accessibility audit + keyboard navigation | P2 | 1d |
| 42 | Performance: virtualized lists, lazy images, memoization | P1 | 1d |
| 43 | Documentation: README, contributing guide, deployment docs | P1 | 1d |

---

**Total estimated: ~40 days**
**Priority P0 (MVP): ~22 days**
