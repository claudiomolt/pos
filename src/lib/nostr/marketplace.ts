import type { NDKEvent } from '@nostr-dev-kit/ndk'
import type { Stall, StallShipping } from '@/types/stall'
import type { Product, ProductSpec } from '@/types/product'

export function parseStallEvent(event: NDKEvent): Stall | null {
  try {
    const content = JSON.parse(event.content)
    const dTag = event.tags.find((t) => t[0] === 'd')?.[1] ?? content.id ?? event.id

    const shipping: StallShipping[] = (content.shipping ?? []).map((s: Record<string, unknown>) => ({
      id: String(s.id ?? ''),
      name: String(s.name ?? ''),
      cost: Number(s.cost ?? 0),
      regions: Array.isArray(s.regions) ? s.regions.map(String) : [],
    }))

    return {
      id: dTag,
      name: String(content.name ?? ''),
      description: String(content.description ?? ''),
      currency: String(content.currency ?? 'SAT'),
      shipping,
      pubkey: event.pubkey,
      createdAt: event.created_at,
    }
  } catch {
    return null
  }
}

export function parseProductEvent(event: NDKEvent): Product | null {
  try {
    const content = JSON.parse(event.content)
    const dTag = event.tags.find((t) => t[0] === 'd')?.[1] ?? content.id ?? event.id

    const specs: ProductSpec[] = (content.specs ?? []).map((s: unknown[]) => ({
      spec: String(s[0] ?? ''),
      value: String(s[1] ?? ''),
    }))

    return {
      id: dTag,
      stallId: String(content.stall_id ?? ''),
      name: String(content.name ?? ''),
      description: String(content.description ?? ''),
      images: Array.isArray(content.images) ? content.images.map(String) : [],
      currency: String(content.currency ?? 'SAT'),
      price: Number(content.price ?? 0),
      quantity: content.quantity !== undefined ? Number(content.quantity) : -1,
      specs,
      shipping: Array.isArray(content.shipping) ? content.shipping.map(String) : [],
      pubkey: event.pubkey,
      createdAt: event.created_at,
    }
  } catch {
    return null
  }
}

export function extractCategories(event: NDKEvent): string[] {
  return event.tags
    .filter((t) => t[0] === 't' && t[1])
    .map((t) => t[1] as string)
}
