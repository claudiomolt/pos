// TODO: LNURL-pay endpoint — returns LN payment metadata
import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: Implement LNURL-pay response
  return NextResponse.json({ status: 'ERROR', reason: 'Not implemented' }, { status: 501 })
}
