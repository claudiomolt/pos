import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock nostr-tools before importing the module under test
vi.mock('nostr-tools', async () => {
  const actual = await vi.importActual<typeof import('nostr-tools')>('nostr-tools')
  return {
    ...actual,
    generateSecretKey: vi.fn(() => new Uint8Array(32).fill(1)),
    getPublicKey: vi.fn(() => 'mock-pubkey'),
    finalizeEvent: vi.fn((template: Record<string, unknown>) => ({
      ...template,
      id: 'mock-event-id',
      pubkey: 'mock-pubkey',
      sig: 'mock-sig',
    })),
  }
})

import { createZapRequest } from '@/lib/nostr/zap'

describe('createZapRequest', () => {
  it('returns a URL-encoded JSON string', async () => {
    const result = await createZapRequest({
      amount: 1000000, // 1000 sats in msats
      recipientPubkey: 'recipient-pubkey',
      relays: ['wss://relay.example.com'],
    })

    expect(typeof result).toBe('string')
    // Should be URL-encoded
    const decoded = JSON.parse(decodeURIComponent(result))
    expect(decoded).toBeTruthy()
    expect(decoded.kind).toBe(9734)
  })

  it('includes amount and recipient in tags', async () => {
    const result = await createZapRequest({
      amount: 21000,
      recipientPubkey: 'pubkey-alice',
      relays: ['wss://relay.damus.io'],
    })
    const event = JSON.parse(decodeURIComponent(result))
    const pTag = event.tags.find((t: string[]) => t[0] === 'p')
    const amountTag = event.tags.find((t: string[]) => t[0] === 'amount')
    expect(pTag?.[1]).toBe('pubkey-alice')
    expect(amountTag?.[1]).toBe('21000')
  })

  it('includes eventId tag when provided', async () => {
    const result = await createZapRequest({
      amount: 1000,
      recipientPubkey: 'pk',
      relays: [],
      eventId: 'event-abc',
    })
    const event = JSON.parse(decodeURIComponent(result))
    const eTag = event.tags.find((t: string[]) => t[0] === 'e')
    expect(eTag?.[1]).toBe('event-abc')
  })

  it('works without eventId', async () => {
    const result = await createZapRequest({
      amount: 5000,
      recipientPubkey: 'pk2',
      relays: ['wss://r1.example.com'],
    })
    const event = JSON.parse(decodeURIComponent(result))
    const eTag = event.tags.find((t: string[]) => t[0] === 'e')
    expect(eTag).toBeUndefined()
  })
})
