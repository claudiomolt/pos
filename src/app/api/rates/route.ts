import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

interface YadioResponse {
  BTC: {
    [currency: string]: number
  }
  timestamp?: number
}

interface RatesCache {
  rates: Record<string, number>
  timestamp: number
  expiresAt: number
}

const CACHE_TTL_MS = 60 * 1000 // 60 seconds
const SATS_PER_BTC = 100_000_000

let ratesCache: RatesCache | null = null

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
  const currenciesParam = searchParams.get('currencies')
  const requestedCurrencies = currenciesParam
    ? currenciesParam.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean)
    : null

  // Check cache validity
  const now = Date.now()
  if (!ratesCache || now >= ratesCache.expiresAt) {
    // Fetch fresh data
    try {
      const res = await fetch('https://api.yadio.io/exrates/btc', {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      })

      if (!res.ok) {
        throw new Error(`Yadio returned ${res.status}`)
      }

      const data = (await res.json()) as YadioResponse

      if (!data.BTC || typeof data.BTC !== 'object') {
        throw new Error('Invalid response from Yadio')
      }

      // Convert BTC rates to per-satoshi rates
      const rates: Record<string, number> = {}
      for (const [currency, btcRate] of Object.entries(data.BTC)) {
        if (typeof btcRate === 'number') {
          rates[currency] = btcRate / SATS_PER_BTC
        }
      }

      ratesCache = {
        rates,
        timestamp: data.timestamp ?? Math.floor(now / 1000),
        expiresAt: now + CACHE_TTL_MS,
      }
    } catch (err) {
      // If we have stale cache, return it with a warning
      if (ratesCache) {
        const filteredRates = filterRates(ratesCache.rates, requestedCurrencies)
        return NextResponse.json(
          { rates: filteredRates, timestamp: ratesCache.timestamp, stale: true },
          { headers: CORS_HEADERS }
        )
      }

      const message = err instanceof Error ? err.message : 'Unknown error'
      return NextResponse.json(
        { error: `Could not fetch rates: ${message}`, code: 'RATES_UNAVAILABLE' },
        { status: 502, headers: CORS_HEADERS }
      )
    }
  }

  const filteredRates = filterRates(ratesCache.rates, requestedCurrencies)

  return NextResponse.json(
    { rates: filteredRates, timestamp: ratesCache.timestamp },
    { headers: CORS_HEADERS }
  )
}

function filterRates(
  rates: Record<string, number>,
  currencies: string[] | null
): Record<string, number> {
  if (!currencies || currencies.length === 0) return rates

  const filtered: Record<string, number> = {}
  for (const currency of currencies) {
    const rate = rates[currency]
    if (rate !== undefined) {
      filtered[currency] = rate
    }
  }
  return filtered
}
