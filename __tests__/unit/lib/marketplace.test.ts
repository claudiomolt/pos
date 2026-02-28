import { describe, it, expect, vi } from 'vitest'
import { parseStallEvent, parseProductEvent, extractCategories } from '@/lib/nostr/marketplace'

// Minimal NDKEvent mock
function makeEvent(content: object, tags: string[][] = [], extra: Partial<{ pubkey: string; created_at: number; id: string }> = {}) {
  return {
    content: JSON.stringify(content),
    tags,
    pubkey: extra.pubkey ?? 'test-pubkey',
    created_at: extra.created_at ?? 1700000000,
    id: extra.id ?? 'test-event-id',
  } as unknown as import('@nostr-dev-kit/ndk').NDKEvent
}

describe('parseStallEvent', () => {
  it('parses a basic stall event', () => {
    const stall = parseStallEvent(makeEvent(
      { name: 'La Barra', description: 'Bar items', currency: 'SAT', shipping: [] },
      [['d', 'stall-01']],
    ))
    expect(stall).not.toBeNull()
    expect(stall?.name).toBe('La Barra')
    expect(stall?.currency).toBe('SAT')
    expect(stall?.id).toBe('stall-01')
  })

  it('falls back to content.id when no d-tag', () => {
    const stall = parseStallEvent(makeEvent(
      { id: 'content-id', name: 'Test', currency: 'ARS', shipping: [] },
      [],
    ))
    expect(stall?.id).toBe('content-id')
  })

  it('parses shipping entries', () => {
    const stall = parseStallEvent(makeEvent(
      {
        name: 'Store', currency: 'SAT', shipping: [
          { id: 's1', name: 'Local', cost: 0, regions: ['AR'] },
        ]
      },
      [['d', 'stall-02']],
    ))
    expect(stall?.shipping).toHaveLength(1)
    expect(stall?.shipping[0].name).toBe('Local')
    expect(stall?.shipping[0].cost).toBe(0)
  })

  it('returns null for invalid JSON content', () => {
    const event = { content: 'not-json', tags: [], pubkey: 'pk', created_at: 0, id: 'x' } as unknown as import('@nostr-dev-kit/ndk').NDKEvent
    expect(parseStallEvent(event)).toBeNull()
  })

  it('sets pubkey from event', () => {
    const stall = parseStallEvent(makeEvent(
      { name: 'P', currency: 'SAT', shipping: [] },
      [['d', 'x']],
      { pubkey: 'merchant-pubkey-abc' }
    ))
    expect(stall?.pubkey).toBe('merchant-pubkey-abc')
  })
})

describe('parseProductEvent', () => {
  it('parses a complete product event', () => {
    const product = parseProductEvent(makeEvent(
      {
        id: 'prod-01',
        stall_id: 'stall-01',
        name: 'Cerveza',
        description: 'Artesanal',
        images: ['https://img.example.com/beer.jpg'],
        currency: 'SAT',
        price: 1000,
        quantity: 10,
        specs: [['size', '330ml']],
        shipping: ['s1'],
      },
      [['d', 'prod-01']],
    ))
    expect(product).not.toBeNull()
    expect(product?.name).toBe('Cerveza')
    expect(product?.price).toBe(1000)
    expect(product?.specs[0].spec).toBe('size')
    expect(product?.specs[0].value).toBe('330ml')
    expect(product?.images).toHaveLength(1)
  })

  it('defaults quantity to -1 when not set', () => {
    const product = parseProductEvent(makeEvent(
      { name: 'Item', stall_id: 'st1', currency: 'SAT', price: 500 },
      [['d', 'prod-02']],
    ))
    expect(product?.quantity).toBe(-1)
  })

  it('returns null for invalid JSON', () => {
    const event = { content: '{bad}', tags: [], pubkey: 'pk', created_at: 0, id: 'x' } as unknown as import('@nostr-dev-kit/ndk').NDKEvent
    expect(parseProductEvent(event)).toBeNull()
  })
})

describe('extractCategories', () => {
  it('extracts t-tags as categories', () => {
    const event = makeEvent({}, [['t', 'drinks'], ['t', 'food'], ['d', 'stall-01']])
    const cats = extractCategories(event)
    expect(cats).toEqual(['drinks', 'food'])
  })

  it('returns empty array when no t-tags', () => {
    const event = makeEvent({}, [['d', 'stall-01']])
    expect(extractCategories(event)).toEqual([])
  })

  it('ignores t-tags without a value', () => {
    const event = makeEvent({}, [['t', 'food'], ['t']])
    const cats = extractCategories(event)
    expect(cats).toEqual(['food'])
  })
})
