// TODO: NIP-05 well-known handler — returns nostr.json for identity verification
import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: Implement NIP-05 /.well-known/nostr.json response
  return NextResponse.json({ names: {} })
}
