export const DEFAULT_RELAYS = [
  process.env.NEXT_PUBLIC_RELAY_URL || 'wss://relay.lacrypta.ar',
  ...(process.env.NEXT_PUBLIC_EXTRA_RELAYS?.split(',') || [
    'wss://relay.damus.io',
    'wss://nostr-pub.wellorder.net',
  ]),
]

export const CURRENCY_API = process.env.NEXT_PUBLIC_CURRENCY_API || 'https://api.yadio.io'
export const LAWALLET_API = process.env.NEXT_PUBLIC_LAWALLET_API || 'https://api.lawallet.ar'
export const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'SAT'
export const RATE_UPDATE_INTERVAL = 60_000 // 60 seconds
