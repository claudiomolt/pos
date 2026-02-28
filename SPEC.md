# Mobile POS v2 — Remake Spec

> Análisis del repo original `lawalletio/mobile-pos` + spec para rebuild desde cero.

## 1. Funcionalidades del POS Original

### 1.1 Setup & Configuración
- **Ingreso de Lightning Address** — El operador ingresa una LN address (ej: `barra@lacrypta.ar`)
- **Resolución LUD-06** — Valida la address via LNURL, obtiene callback URL
- **Verificación LUD-21** — Verifica ownership de la address via firma Nostr
- **Detección de soporte NIP-57** — Determina si el destino acepta zaps nativos o necesita proxy

### 1.2 Menú de Productos
- **Menús hardcodeados por destino** — UI específica según la Lightning Address:
  | Address | Menú |
  |---------|------|
  | `barra@lacrypta.ar` | Bebidas (cerveza, fernet, agua, etc.) |
  | `comida@lacrypta.ar` | Comida (choripán, hamburguesa, etc.) |
  | `cafe@lacrypta.ar` | Café y bebidas calientes |
  | `bitnaria@lacrypta.ar` | Items bitnaria |
  | `merch@lacrypta.ar` | Merchandising |
  | Cualquier otra | Monto libre (sin menú) |
- **Selección de items** — Tap para agregar, contador de cantidad
- **Monto libre** — Teclado numérico para ingresar sats directamente
- **Conversión multi-moneda** — SAT ↔ ARS ↔ USD con cotización en tiempo real (via yadio.io API)

### 1.3 Flujo de Pago
1. Se crea **orden Nostr** (kind:1) con los items seleccionados
2. Se genera **zap request** (kind:9734) con el monto total
3. Se solicita **invoice Lightning** al LNURL callback
4. Se muestra **QR code** con el invoice (bolt11)
5. Se escucha por **zap receipt** (kind:9735) como confirmación
6. En caso de **timeout**, reintenta o muestra error

### 1.4 NFC — Pago con Tarjeta
- **Web NFC API** — Para navegadores que soportan (Chrome Android)
- **Android WebView Bridge** — Inyección via `window.Android.readNFC()` para app nativa
- **Lectura de tarjetas LaWallet** — Extrae datos de la tarjeta NFC para autorizar pago
- **Fallback** — Si NFC no disponible, solo QR

### 1.5 Modo Proxy (Original)
- **Cuándo se activa** — Cuando el destino no soporta NIP-57 (zaps)
- **Cómo funciona (ORIGINAL — DEPRECADO):**
  1. Se genera keypair efímero (almacenado en localStorage)
  2. El pago va al wallet proxy
  3. Proxy reenvía al destino via eventos internos (kind:1112) a `api.lawallet.ar/nostr/publish`
- **Satsback** — Tarjetas de `api.lacrypta.ar` reciben 30% de vuelta
- **Riesgo** — Keys en localStorage = pérdida de fondos si se borra el browser

### 1.5b Modo Proxy v2 (Remake — via lncurl/NWC)
- **Cuándo se activa** — Cuando el destino no soporta NIP-57 (zaps)
- **Cómo funciona:**
  1. Se crea una **wallet NWC descartable** via servicio compatible con lncurl
  2. Se genera invoice Lightning desde esa wallet descartable
  3. El cliente paga a la wallet descartable
  4. El POS detecta el pago via NWC (suscripción a eventos)
  5. La wallet descartable **reenvía los fondos** al destino original (Lightning Address)
  6. Wallet descartable se puede descartar después del forward
- **Ventajas sobre el original:**
  - No hay keys en localStorage → sin riesgo de pérdida de fondos
  - NWC estándar (NIP-47) → interoperable
  - Wallet descartable = aislamiento total por transacción
  - No depende de endpoints propietarios (`api.lawallet.ar`)

### 1.6 Impresión de Recibos
- **Android Bridge** — `window.Android.print(data)` envía a impresora térmica
- **Solo Android** — No disponible en web puro

### 1.7 Bloque Bitcoin
- **Display decorativo** — Muestra número de bloque actual (via mempool.space WebSocket)
- **Indicador visual** — El bloque anima al cambiar

### 1.8 Nostr Infrastructure
- **Relays:** `wss://relay.damus.io`, `wss://nostr-pub.wellorder.net` + relay de env
- **NDK** — Nostr Development Kit para manejo de eventos
- **Ledger pubkey** — Lee balances de wallet LaWallet (kind:31111)
- **Suscripciones** — Escucha zap receipts en tiempo real

---

## 2. Bugs & Problemas Detectados

### 2.1 Bug Crítico — Derivación de Public Key
```typescript
// Nostr.tsx — ACTUAL (BUG)
const _publicKey = privateKey || getPublicKey(hexToBytes(privateKey))
// Si privateKey existe, usa privateKey como publicKey (INCORRECTO)

// CORRECTO:
const _publicKey = getPublicKey(hexToBytes(privateKey))
```

### 2.2 Fondos en Riesgo — Proxy Keys en localStorage
- Keys del wallet proxy se almacenan en `localStorage`
- Si el usuario limpia datos del navegador, los fondos en tránsito se pierden
- **Solución:** Backup de keys + confirmación de transferencia antes de limpiar

### 2.3 UX Pobre — `alert()` para Errores
- Múltiples llamadas a `alert()` nativas del browser
- Bloquean el thread de UI
- **Solución:** Sistema de toasts/notificaciones

### 2.4 Menús Hardcodeados
- Cada nuevo destino requiere cambio de código
- No escalable
- **Solución:** NIP-15 (Nostr Marketplace) para menús dinámicos

### 2.5 Sin Tests
- Cero cobertura de testing
- **Solución:** Vitest + React Testing Library + E2E con Playwright

### 2.6 Sin Soporte Offline
- POS en eventos puede perder conectividad
- No hay Service Worker ni cache de datos
- **Solución:** PWA con offline-first para datos estáticos

### 2.7 Deuda Técnica
- Muchos `eslint-disable` comments
- Styled-components inline en archivos de page
- Falta tipado estricto en muchos lugares
- No hay manejo centralizado de errores

---

## 3. Spec del Remake — Mobile POS v2

### 3.1 Stack Tecnológico
| Componente | Original | v2 |
|-----------|----------|-----|
| Framework | Next.js 15 | Next.js 15 (App Router) |
| UI | styled-components (inline) | **shadcn/ui + Tailwind CSS** |
| Language | TypeScript (lax) | **TypeScript strict** |
| State | React Context (7 providers) | **Zustand** (stores modulares) |
| Nostr | NDK + nostr-tools | NDK + nostr-tools |
| Testing | ❌ ninguno | **Vitest + RTL + Playwright** |
| Menús | Hardcoded | **NIP-15 (Nostr Marketplace)** |
| Admin | ❌ no existe | **Panel de administración Nostr** |

### 3.2 Arquitectura — NIP-15 para Menús Dinámicos

#### Nostr Events para el Menú

**Stall (kind:30017)** — Representa un "local" o "puesto":
```json
{
  "kind": 30017,
  "pubkey": "<merchant_pubkey>",
  "content": {
    "id": "barra-lacrypta",
    "name": "Barra La Crypta",
    "description": "Bebidas y tragos",
    "currency": "SAT",
    "shipping": [
      { "id": "local", "name": "En el lugar", "cost": 0, "regions": ["event"] }
    ]
  },
  "tags": [
    ["d", "barra-lacrypta"],
    ["t", "bar"],
    ["t", "drinks"]
  ]
}
```

**Product (kind:30018)** — Cada item del menú:
```json
{
  "kind": 30018,
  "pubkey": "<merchant_pubkey>",
  "content": {
    "id": "cerveza-ipa",
    "stall_id": "barra-lacrypta",
    "name": "Cerveza IPA",
    "description": "Pinta de IPA artesanal",
    "images": ["https://example.com/ipa.jpg"],
    "currency": "SAT",
    "price": 5000,
    "quantity": null,
    "specs": [["size", "500ml"], ["type", "IPA"]]
  },
  "tags": [
    ["d", "cerveza-ipa"],
    ["t", "beer"],
    ["t", "drinks"]
  ]
}
```

#### Flujo
1. Operador ingresa Lightning Address (`barra@lacrypta.ar`)
2. Se resuelve NIP-05 → obtiene pubkey del merchant
3. Se buscan stalls (kind:30017) del merchant en relays
4. Se buscan products (kind:30018) asociados al stall
5. Se renderiza el menú dinámicamente
6. Si no hay stall → fallback a monto libre

### 3.3 Panel de Administración (`/admin` — página separada)

**Login:** NIP-07 (extensión de browser como Alby/nos2x) o nsecBunker

**Ruta:** `/admin` — completamente separada del POS, su propia sección

#### Modelo de Datos (compatibilidad con formato actual)

El formato JSON actual del POS:

**Categories:**
```json
[
  { "id": 1, "name": "Tragos" },
  { "id": 9, "name": "Con Alcohol" },
  { "id": 10, "name": "Sin Alcohol" },
  { "id": 20, "name": "Cafeteria" }
]
```

**Products (ej: barra.json):**
```json
[
  {
    "id": 1,
    "category_id": 10,
    "name": "Gaseosa",
    "description": "",
    "price": { "value": 3100, "currency": "ARS" }
  },
  {
    "id": 2,
    "category_id": 9,
    "name": "Cerveza",
    "description": "",
    "price": { "value": 4800, "currency": "ARS" }
  }
]
```

#### Mapeo a NIP-15

| Concepto POS | NIP-15 Event | Mapeo |
|-------------|-------------|-------|
| Menú (barra, comida, etc.) | **Stall** (kind:30017) | Un stall por menú/puesto |
| Categoría (Tragos, Con Alcohol) | **Tag `t`** en products | Categories como tags |
| Producto (Cerveza, Gaseosa) | **Product** (kind:30018) | Un event por producto |
| Precio multi-moneda | `price` + `currency` | NIP-15 soporta currency nativo |

**Stall (kind:30017)** — mapea a un menú:
```json
{
  "kind": 30017,
  "content": {
    "id": "barra",
    "name": "Barra",
    "description": "Bebidas y tragos",
    "currency": "ARS",
    "shipping": [{ "id": "local", "name": "En el lugar", "cost": 0, "regions": ["event"] }]
  },
  "tags": [["d", "barra"]]
}
```

**Product (kind:30018)** — mapea a un item del menú:
```json
{
  "kind": 30018,
  "content": {
    "id": "cerveza",
    "stall_id": "barra",
    "name": "Cerveza",
    "description": "",
    "images": [],
    "currency": "ARS",
    "price": 4800,
    "quantity": null,
    "specs": [["size", "500ml"]]
  },
  "tags": [
    ["d", "cerveza"],
    ["t", "Con Alcohol"]
  ]
}
```

**Mapeo de categorías:** Los `category_id` numéricos se reemplazan por tags `t` con el nombre de la categoría. El admin permite crear/editar categorías que se almacenan como tags.

**Multi-moneda:** Cada producto tiene `currency` (ARS, SAT, USD). El POS convierte al vuelo según la moneda del stall o del producto.

#### Funcionalidades del Admin

- **CRUD de Stalls (Menús)** — Crear/editar/eliminar menús (barra, comida, café, merch, etc.)
- **CRUD de Products** — Agregar/editar/eliminar items dentro de cada stall
  - Nombre, descripción, precio, moneda (ARS/SAT/USD), categoría(s), imagen
- **CRUD de Categorías** — Crear/editar tags de categoría
- **Toggle de disponibilidad** — Marcar items como "agotado" (quantity: 0) sin eliminar
- **Precios multi-moneda** — Definir precio en ARS, SAT o USD por producto
- **Preview en vivo** — Ver cómo se ve el menú en el POS antes de publicar
- **Historial de ventas** — Zap receipts del merchant (solo lectura)
- **Import/Export JSON** — Importar menús del formato actual (barra.json, etc.) y exportar

#### Publicación
- Cada cambio publica un evento Nostr (kind:30017/30018) firmado con la key del merchant
- Los POS suscritos al merchant ven los cambios **en tiempo real** (suscripción a relay)
- Delete de productos via kind:5 (NIP-09)

### 3.3b Optimizaciones de Menú

#### Cache Local
- **IndexedDB** para almacenar stalls y products offline
- Al abrir el POS: mostrar menú cacheado **inmediatamente**, luego sincronizar con relay en background
- Timestamp de último sync → solo pedir eventos más nuevos (`since` filter)
- Resultado: menú carga en <100ms incluso sin conexión

#### Carga Eficiente desde Relays
- **Filter preciso:** `{ kinds: [30017, 30018], authors: [merchantPubkey] }` — un solo request
- **Replaceable events:** kind:30017/30018 son replaceable (NIP-33), siempre se obtiene la versión más reciente
- **Suscripción en vivo:** después del fetch inicial, mantener suscripción abierta para updates en tiempo real
- **Deduplicación:** NDK maneja duplicados entre relays automáticamente

#### Renderizado Optimizado
- **Virtualización de lista** — Para menús grandes (merch tiene 23+ items), usar virtualización (react-window o similar) para no renderizar todo el DOM
- **Agrupación por categoría** — Mantener el patrón actual de agrupar por `t` tags, pero con lazy rendering por sección
- **Imágenes lazy load** — Products con imágenes cargan con `loading="lazy"` + placeholder blur
- **Memoización** — `React.memo` en ProductCard, recalcular totales solo cuando cambia el carrito

#### Búsqueda y Filtrado
- **Filtro por categoría** — Tabs o chips para filtrar por tag `t`
- **Búsqueda de texto** — Search bar para buscar producto por nombre (client-side, sobre datos cacheados)
- **Ordenamiento** — Por precio (asc/desc), por nombre, por categoría

#### Multi-moneda Inteligente

**Layout actual respetado:** El POS ya tiene selector de moneda en la UI. Se mantiene ese patrón pero se expande.

**Original:** Solo 3 monedas hardcodeadas (`SAT`, `USD`, `ARS`)
**v2:** Monedas configurables desde Settings, soportando las **126 monedas** de la API yadio.io

**Flujo de configuración (`/settings`):**
1. El operador abre Settings
2. Sección "Monedas" muestra las monedas activas (default: SAT, USD, ARS)
3. Botón "Agregar moneda" → dropdown/search con las 126 monedas disponibles
4. Selecciona las que quiere (ej: BRL, EUR, CLP, MXN, COP)
5. Puede reordenar y elegir moneda default de display
6. Se guarda en config local + opcionalmente en Nostr (kind:30078 app-specific data)

**Monedas disponibles (126 via yadio.io):**
AED, ARS, AUD, BOB, BRL, CAD, CHF, CLP, CNY, COP, CRC, CZK, DOP, EUR, GBP, GTQ, HNL, HUF, IDR, ILS, INR, JPY, KRW, MXN, MYR, NGN, NIO, NOK, NZD, PAB, PEN, PHP, PKR, PLN, PYG, RON, RUB, SAR, SEK, SGD, THB, TRY, TWD, UAH, USD, UYU, VES, ZAR, y 78 más...

**Implementación:**
- `AvailableCurrencies` pasa de type literal a **dinámico** (basado en config)
- `CurrenciesList` se lee de settings, no hardcodeado
- `useCurrencyConverter` se adapta para N monedas (fetch solo las activas)
- Selector de moneda en el POS muestra solo las configuradas
- **Cobro siempre en SAT** — Independiente de la moneda de display
- **Cache de cotización** — Se actualiza cada 60s, fallback a última cacheada
- **Cotización por moneda activa** — Solo se piden rates de las monedas configuradas

#### Disponibilidad en Tiempo Real
- **Stock dinámico** — Si `quantity` no es null, decrementar al confirmar venta
- **Items agotados** — Se muestran griseados con badge "Agotado", no se ocultan (para que el operador sepa que existen)
- **Actualización instantánea** — Cambio de disponibilidad desde admin se refleja en POS sin refresh

### 3.4 Estructura del Proyecto

```
mobile-pos-v2/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + providers
│   │   ├── page.tsx                # Setup (ingreso de LN address)
│   │   ├── pos/
│   │   │   ├── page.tsx            # POS principal (menú + numpad)
│   │   │   └── [orderId]/
│   │   │       └── page.tsx        # Checkout (QR + NFC)
│   │   ├── settings/
│   │   │   └── page.tsx            # Settings (monedas, relays, display)
│   │   └── admin/
│   │       ├── page.tsx            # Dashboard admin
│   │       ├── stalls/
│   │       │   ├── page.tsx        # Lista de stalls
│   │       │   └── [stallId]/
│   │       │       └── page.tsx    # Editar stall + products
│   │       └── products/
│   │           └── [productId]/
│   │               └── page.tsx    # Editar product
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── pos/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Numpad.tsx
│   │   │   ├── QRPayment.tsx
│   │   │   └── NFCReader.tsx
│   │   ├── admin/
│   │   │   ├── StallForm.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductList.tsx
│   │   │   └── SalesHistory.tsx
│   │   └── shared/
│   │       ├── CurrencyDisplay.tsx
│   │       ├── BitcoinBlock.tsx
│   │       └── NostrLogin.tsx
│   ├── stores/
│   │   ├── pos.ts                  # Cart, selected stall, order
│   │   ├── nostr.ts                # Connection, keys, relays
│   │   ├── nfc.ts                  # NFC state
│   │   └── currency.ts             # Exchange rates
│   ├── hooks/
│   │   ├── useStall.ts             # Fetch stall from Nostr (kind:30017)
│   │   ├── useProducts.ts          # Fetch products from Nostr (kind:30018)
│   │   ├── usePayment.ts           # Invoice generation + zap flow
│   │   ├── useNFC.ts               # NFC reading (Web API + Android bridge)
│   │   ├── useCurrency.ts          # SAT/ARS/USD conversion
│   │   └── usePrint.ts             # Receipt printing
│   ├── lib/
│   │   ├── nostr/
│   │   │   ├── ndk.ts              # NDK singleton + relay config
│   │   │   ├── marketplace.ts      # NIP-15 helpers (publish stall/product)
│   │   │   ├── zap.ts              # Zap request/receipt logic
│   │   │   └── nip05.ts            # NIP-05 resolution
│   │   ├── lnurl/
│   │   │   ├── resolve.ts          # LUD-06 resolution
│   │   │   └── invoice.ts          # Invoice request
│   │   ├── nfc/
│   │   │   ├── web.ts              # Web NFC API
│   │   │   └── android.ts          # Android bridge
│   │   └── currency/
│   │       └── rates.ts            # Exchange rate fetching
│   ├── types/
│   │   ├── stall.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── payment.ts
│   │   └── nfc.ts
│   └── config/
│       └── constants.ts            # Relays, API URLs, defaults
├── __tests__/
│   ├── unit/
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── lib/
│   ├── integration/
│   │   ├── payment-flow.test.ts
│   │   └── menu-loading.test.ts
│   └── e2e/
│       ├── setup.spec.ts
│       ├── pos-flow.spec.ts
│       └── admin.spec.ts
├── public/
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

### 3.5 Mejoras sobre el Original

| Área | Original | v2 |
|------|----------|-----|
| Menús | Hardcoded en código | **NIP-15 dinámico desde Nostr** |
| Admin | No existe | **Panel completo con login Nostr** |
| UI | styled-components inline | **shadcn/ui + Tailwind** |
| State | 7 Context providers anidados | **Zustand stores modulares** |
| Errores | `alert()` | **Toast notifications (sonner)** |
| Proxy | localStorage keys (riesgo) | **lncurl NWC descartable (sin estado local)** |
| Pubkey bug | privateKey como pubkey | **Derivación correcta** |
| Testing | Ninguno | **Unit + Integration + E2E** |
| Offline | Ninguno | **PWA Service Worker** |
| Tipos | TypeScript lax | **Strict mode** |
| Lint | eslint-disable everywhere | **ESLint + Prettier strict** |

### 3.6 Roadmap

#### Phase 1 — Foundation (Week 1-2)
- [ ] Scaffolding Next.js 15 + shadcn/ui + Tailwind
- [ ] TypeScript strict config
- [ ] Zustand stores (nostr, pos, currency)
- [ ] NDK setup + relay config
- [ ] NIP-05 resolution
- [ ] LUD-06/LNURL resolution
- [ ] Basic POS: LN address input → menu → amount → invoice QR
- [ ] Unit tests for lib functions

#### Phase 2 — NIP-15 Integration (Week 3)
- [ ] Fetch stalls (kind:30017) from Nostr
- [ ] Fetch products (kind:30018) from Nostr
- [ ] Dynamic menu rendering from Nostr data
- [ ] Category filtering (by `t` tags)
- [ ] Fallback to free amount if no stall found
- [ ] Integration tests for menu loading

#### Phase 3 — Payment Flow (Week 4)
- [ ] Zap request (kind:9734) generation
- [ ] Invoice request via LNURL callback
- [ ] QR code display (bolt11)
- [ ] Zap receipt (kind:9735) subscription
- [ ] Payment confirmation screen
- [ ] NFC reading (Web API + Android bridge)
- [ ] Proxy mode for non-NIP-57 destinations
- [ ] Integration tests for payment flow

#### Phase 4 — Admin Panel (Week 5-6)
- [ ] Nostr login (NIP-07 / nsecBunker)
- [ ] CRUD stalls (publish kind:30017)
- [ ] CRUD products (publish kind:30018)
- [ ] Image upload (via nostr.build or similar)
- [ ] Availability toggle
- [ ] Menu preview
- [ ] Sales history (read zap receipts)

#### Phase 5 — Polish & Testing (Week 7-8)
- [ ] PWA + Service Worker (offline menu cache)
- [ ] Receipt printing (Android bridge)
- [ ] Bitcoin block display
- [ ] Multi-currency (SAT/ARS/USD)
- [ ] Error handling (sonner toasts)
- [ ] Accessibility audit
- [ ] E2E tests (Playwright)
- [ ] Performance optimization
- [ ] Documentation

### 3.7 PWA & Printing

#### Progressive Web App
- **Service Worker** — Cache de assets estáticos + menú (IndexedDB) para uso offline
- **Web App Manifest** — `manifest.json` con nombre, iconos, colores, `display: standalone`
- **Install prompt** — Banner de instalación en Android/iOS
- **Offline-first** — Menú cacheado funciona sin conexión; pagos requieren red (Lightning)
- **Background sync** — Cola de órdenes pendientes para enviar cuando vuelva la conexión

#### Printing API (usePrint — respetada 100%)

La API de impresión via Android WebView Bridge se mantiene intacta:

```typescript
// src/hooks/usePrint.ts
interface PrintData {
  title: string
  items: Array<{
    name: string
    qty: number
    price: number
    currency: string
  }>
  total: {
    value: number
    currency: string
  }
  orderId: string
  timestamp: number
  destination: string // Lightning Address
}

interface UsePrintReturn {
  isPrintAvailable: boolean   // true si window.Android?.print existe
  print: (data: PrintData) => void
}

// Detección del bridge Android
const isPrintAvailable = typeof window !== 'undefined' 
  && 'Android' in window 
  && typeof (window as any).Android.print === 'function'

// Llamada al bridge
const print = (data: PrintData) => {
  if (!isPrintAvailable) return
  (window as any).Android.print(JSON.stringify(data))
}
```

**Comportamiento:**
- Si `window.Android.print` existe → botón "Imprimir" visible en pantalla de confirmación
- Si no existe (browser normal) → botón oculto, sin error
- La impresora térmica recibe el JSON y formatea el ticket
- Compatible con el bridge Android existente del POS original

### 3.8 API Routes Internas (CORS Proxy)

**Problema:** Los endpoints LNURL/LUD-16 de terceros no envían headers CORS. El browser no puede hacer fetch directo a `https://lacrypta.ar/.well-known/lnurlp/barra` desde client-side.

**Solución:** API routes server-side en Next.js que actúan como proxy. El browser pega al propio backend, el server hace el fetch sin restricción CORS.

```
src/app/api/
├── lnurl/
│   └── route.ts          # Proxy LUD-06/LUD-16 resolution
│                          # GET /api/lnurl?address=barra@lacrypta.ar
│                          # → Server fetches /.well-known/lnurlp/barra
│                          # → Returns LNURL response to client
├── invoice/
│   └── route.ts          # Proxy invoice request
│                          # POST /api/invoice { callback, amount, ... }
│                          # → Server fetches callback URL with params
│                          # → Returns bolt11 invoice to client
├── nip05/
│   └── route.ts          # Proxy NIP-05 resolution
│                          # GET /api/nip05?address=barra@lacrypta.ar
│                          # → Server fetches /.well-known/nostr.json
│                          # → Returns pubkey to client
└── rates/
    └── route.ts          # Proxy cotizaciones
                           # GET /api/rates?currencies=ARS,USD,BRL
                           # → Server fetches yadio.io
                           # → Returns rates (with server-side cache 60s)
```

**Runtime:** Las API routes corren server-side (Node.js en Vercel, o Bun en self-host).

**Bun compatibility:** Next.js 15 corre sobre Bun para desarrollo local (`bun run dev`). En producción:
- **Vercel** → Node.js runtime (automático)
- **Self-host** → Bun o Node.js (elección del operador)
- Las API routes funcionan igual en ambos runtimes

**Rate limiting:** Las API routes incluyen rate limiting básico para evitar abuso (IP-based, 60 req/min).

**Caching server-side:**
- Cotizaciones: cache 60s en memoria
- NIP-05: cache 5min (las pubkeys no cambian seguido)
- LNURL: sin cache (puede cambiar entre requests)

---

## 4. Environment Variables

```env
# Nostr
NEXT_PUBLIC_RELAY_URL=wss://relay.lacrypta.ar
NEXT_PUBLIC_EXTRA_RELAYS=wss://relay.damus.io,wss://nostr-pub.wellorder.net

# LaWallet
NEXT_PUBLIC_LAWALLET_API=https://api.lawallet.ar
NEXT_PUBLIC_LEDGER_PUBKEY=<lawallet_ledger_pubkey>

# Currency
NEXT_PUBLIC_CURRENCY_API=https://api.yadio.io

# App
NEXT_PUBLIC_APP_NAME=Mobile POS
NEXT_PUBLIC_DEFAULT_CURRENCY=SAT
```

---

## 5. Key Dependencies

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "@nostr-dev-kit/ndk": "^2.x",
    "nostr-tools": "^2.x",
    "bolt11": "^1.x",
    "zustand": "^5.x",
    "qrcode.react": "^4.x",
    "sonner": "^2.x",
    "@radix-ui/react-*": "latest"
  },
  "devDependencies": {
    "vitest": "^3.x",
    "@testing-library/react": "^16.x",
    "@playwright/test": "^1.x",
    "tailwindcss": "^4.x",
    "typescript": "^5.x",
    "eslint": "^9.x",
    "prettier": "^3.x"
  }
}
```
