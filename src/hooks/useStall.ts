'use client'

import { useEffect, useRef, useState } from 'react'
import type { NDKSubscription } from '@nostr-dev-kit/ndk'
import { getNDK } from '@/lib/nostr/ndk'
import { parseStallEvent } from '@/lib/nostr/marketplace'
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

    const start = async () => {
      try {
        const ndk = getNDK()
        await ndk.connect()

        const sub = ndk.subscribe(
          { kinds: [30017 as number], authors: [merchantPubkey] },
          { closeOnEose: false }
        )
        subRef.current = sub

        sub.on('event', (event) => {
          if (stopped) return
          const stall = parseStallEvent(event)
          if (stall) {
            setStalls((prev) => {
              const exists = prev.find((s) => s.id === stall.id)
              if (exists) return prev.map((s) => (s.id === stall.id ? stall : s))
              return [...prev, stall]
            })
          }
        })

        sub.on('eose', () => {
          if (!stopped) setIsLoading(false)
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
