import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

interface CacheEntry {
  pubkey: string
  relays?: string[]
  expiresAt: number
}

interface NostrJson {
  names: Record<string, string>
  relays?: Record<string, string[]>
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests', code: 'RATE_LIMITED' },
      { status: 429, headers: CORS_HEADERS }
    )
  }

  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json(
      { error: 'Missing address parameter', code: 'MISSING_PARAM' },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  const parts = address.split('@')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return NextResponse.json(
      { error: 'Invalid NIP-05 address format. Expected name@domain', code: 'INVALID_FORMAT' },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  const [name, domain] = parts

  // Check cache
  const cached = cache.get(address)
  if (cached && Date.now() < cached.expiresAt) {
    const { expiresAt: _, ...data } = cached
    return NextResponse.json(data, { headers: CORS_HEADERS })
  }

  const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(name)}`

  let nostrJson: NostrJson
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${res.status}`, code: 'UPSTREAM_ERROR' },
        { status: 502, headers: CORS_HEADERS }
      )
    }

    nostrJson = (await res.json()) as NostrJson
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Could not reach ${domain}: ${message}`, code: 'UNREACHABLE' },
      { status: 502, headers: CORS_HEADERS }
    )
  }

  if (!nostrJson.names || typeof nostrJson.names !== 'object') {
    return NextResponse.json(
      { error: 'Invalid nostr.json format', code: 'INVALID_RESPONSE' },
      { status: 502, headers: CORS_HEADERS }
    )
  }

  const pubkey = nostrJson.names[name]
  if (!pubkey) {
    return NextResponse.json(
      { error: `Name '${name}' not found at ${domain}`, code: 'NOT_FOUND' },
      { status: 404, headers: CORS_HEADERS }
    )
  }

  const relays = nostrJson.relays?.[pubkey]
  const entry: CacheEntry = { pubkey, relays, expiresAt: Date.now() + CACHE_TTL_MS }
  cache.set(address, entry)

  const response: { pubkey: string; relays?: string[] } = { pubkey }
  if (relays) response.relays = relays

  return NextResponse.json(response, { headers: CORS_HEADERS })
}
