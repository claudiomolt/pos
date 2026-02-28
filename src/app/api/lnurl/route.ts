import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

interface LnurlPayResponse {
  tag: string
  callback: string
  minSendable: number
  maxSendable: number
  metadata: string
  commentAllowed?: number
  nostrPubkey?: string
  allowsNostr?: boolean
  [key: string]: unknown
}

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
      { error: 'Invalid Lightning address format. Expected name@domain', code: 'INVALID_FORMAT' },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  const [name, domain] = parts
  const url = `https://${domain}/.well-known/lnurlp/${encodeURIComponent(name)}`

  let lnurlData: LnurlPayResponse
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

    lnurlData = (await res.json()) as LnurlPayResponse
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Could not reach ${domain}: ${message}`, code: 'UNREACHABLE' },
      { status: 502, headers: CORS_HEADERS }
    )
  }

  if (lnurlData.tag !== 'payRequest') {
    return NextResponse.json(
      { error: 'Address does not support LNURL-pay', code: 'NOT_LNURL_PAY' },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  if (!lnurlData.callback || typeof lnurlData.minSendable !== 'number' || typeof lnurlData.maxSendable !== 'number') {
    return NextResponse.json(
      { error: 'Invalid LNURL-pay response', code: 'INVALID_RESPONSE' },
      { status: 502, headers: CORS_HEADERS }
    )
  }

  return NextResponse.json(lnurlData, { headers: CORS_HEADERS })
}
