// TODO: Exchange rates proxy — fetches fiat/BTC rates from yadio.io
import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: Implement rates fetching and caching
  return NextResponse.json({ rates: {} })
}
