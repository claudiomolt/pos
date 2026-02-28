'use client'

import { useEffect, useRef, useState } from 'react'
import type { NDKSubscription } from '@nostr-dev-kit/ndk'
import { getNDK } from '@/lib/nostr/ndk'
import { parseStallEvent } from '@/lib/nostr/marketplace'
import { getFromCache, saveToCache } from '@/lib/cache/indexeddb'
import type { Stall } from '@/types/stall'

export function useStall(merchantPubkey: string | null) {
  const [stalls, setStalls] = useState<Stall[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const subRef = useRef<NDKSubscription | null>(null)

  useEffect(() => {
    if (!merchantPubkey) {
      setStalls([])
      return
    }

    setIsLoading(true)
    setError(null)
    setStalls([])

    let stopped = false
    // Accumulate relay results so we can persist on eose
    const relayStalls: Map<string, Stall> = new Map()

    const start = async () => {
      try {
        // 1. Load from cache immediately (stale-while-revalidate)
        const cached = await getFromCache(merchantPubkey)
        if (!stopped && cached.stalls.length > 0) {
          setStalls(cached.stalls)
          setIsLoading(false)
        }

        // 2. Subscribe to relay — use `since` if we have a lastSync
        const ndk = getNDK()
        await ndk.connect()

        const filter: Record<string, unknown> = {
          kinds: [30017 as number],
          authors: [merchantPubkey],
        }
        if (cached.lastSync) {
          filter.since = cached.lastSync
        }

        const sub = ndk.subscribe(filter as Parameters<typeof ndk.subscribe>[0], {
          closeOnEose: false,
        })
        subRef.current = sub

        sub.on('event', (event) => {
          if (stopped) return
          const stall = parseStallEvent(event)
          if (stall) {
            relayStalls.set(stall.id, stall)
            setStalls((prev) => {
              const exists = prev.find((s) => s.id === stall.id)
              if (exists) return prev.map((s) => (s.id === stall.id ? stall : s))
              return [...prev, stall]
            })
          }
        })

        sub.on('eose', () => {
          if (stopped) return
          setIsLoading(false)

          // Merge relay results with cached stalls and persist
          const mergedMap = new Map<string, Stall>(
            cached.stalls.map((s) => [s.id, s])
          )
          relayStalls.forEach((s, id) => mergedMap.set(id, s))
          const merged = Array.from(mergedMap.values())

          if (merged.length > 0) {
            // Persist merged result (fire-and-forget)
            void saveToCache(merchantPubkey, merged, [])
              .catch(() => {/* non-fatal */})
          }
        })
      } catch (err) {
        if (!stopped) {
          setError(err instanceof Error ? err.message : 'Failed to fetch stalls')
          setIsLoading(false)
        }
      }
    }

    start()

    // Fallback timeout
    const timeout = setTimeout(() => {
      if (!stopped) setIsLoading(false)
    }, 10000)

    return () => {
      stopped = true
      clearTimeout(timeout)
      subRef.current?.stop()
      subRef.current = null
    }
  }, [merchantPubkey])

  return { stalls, isLoading, error }
}
