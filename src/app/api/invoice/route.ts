// TODO: Invoice creation endpoint — generates Lightning invoice via LaWallet
import { NextResponse } from 'next/server'

export async function POST() {
  // TODO: Implement invoice creation
  return NextResponse.json({ status: 'ERROR', reason: 'Not implemented' }, { status: 501 })
}
