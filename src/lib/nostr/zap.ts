import { generateSecretKey, getPublicKey, finalizeEvent } from 'nostr-tools'

export interface ZapRequestParams {
  amount: number // in millisats
  recipientPubkey: string
  relays: string[]
  content?: string
  eventId?: string
}

/**
 * Creates a NIP-57 zap request (kind:9734) and returns it as a URL-encoded JSON string
 * suitable for use as the `nostr` param in LNURL callback.
 */
export async function createZapRequest(params: ZapRequestParams): Promise<string> {
  const { amount, recipientPubkey, relays, content = '', eventId } = params

  // Use NIP-07 if available, otherwise use ephemeral key
  const useNip07 =
    typeof window !== 'undefined' &&
    'nostr' in window &&
    typeof (window as { nostr?: unknown }).nostr === 'object'

  const tags: string[][] = [
    ['p', recipientPubkey],
    ['amount', String(amount)],
    ['relays', ...relays],
  ]

  if (eventId) {
    tags.push(['e', eventId])
  }

  const eventTemplate = {
    kind: 9734,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content,
  }

  let signedEvent: ReturnType<typeof finalizeEvent>

  if (useNip07) {
    try {
      const nip07 = ((window as unknown) as { nostr: { signEvent: (e: typeof eventTemplate) => Promise<ReturnType<typeof finalizeEvent>> } }).nostr
      signedEvent = await nip07.signEvent(eventTemplate)
    } catch {
      // Fall back to ephemeral key
      signedEvent = signWithEphemeralKey(eventTemplate)
    }
  } else {
    signedEvent = signWithEphemeralKey(eventTemplate)
  }

  return encodeURIComponent(JSON.stringify(signedEvent))
}

function signWithEphemeralKey(
  eventTemplate: { kind: number; created_at: number; tags: string[][]; content: string }
): ReturnType<typeof finalizeEvent> {
  const sk = generateSecretKey()
  // finalizeEvent adds pubkey automatically from the secret key
  return finalizeEvent(eventTemplate, sk)
}
