'use client'

import { useEffect, useRef, useState } from 'react'
import type { NDKSubscription } from '@nostr-dev-kit/ndk'
import { getNDK } from '@/lib/nostr/ndk'
import { parseProductEvent, extractCategories } from '@/lib/nostr/marketplace'
import type { Product } from '@/types/product'

export function useProducts(merchantPubkey: string | null, stallId?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const subRef = useRef<NDKSubscription | null>(null)

  useEffect(() => {
    if (!merchantPubkey) {
      setProducts([])
      setCategories([])
      return
    }

    setIsLoading(true)
    setError(null)
    setProducts([])
    setCategories([])

    let stopped = false

    const start = async () => {
      try {
        const ndk = getNDK()
        await ndk.connect()

        const sub = ndk.subscribe(
          { kinds: [30018 as number], authors: [merchantPubkey] },
          { closeOnEose: false }
        )
        subRef.current = sub

        sub.on('event', (event) => {
          if (stopped) return
          const product = parseProductEvent(event)
          if (!product) return
          if (stallId && product.stallId !== stallId) return

          const cats = extractCategories(event)

          setProducts((prev) => {
            const exists = prev.find((p) => p.id === product.id)
            if (exists) return prev.map((p) => (p.id === product.id ? product : p))
            return [...prev, product]
          })

          if (cats.length > 0) {
            setCategories((prev) => {
              const next = [...prev]
              cats.forEach((c) => { if (!next.includes(c)) next.push(c) })
              return next
            })
          }
        })

        sub.on('eose', () => {
          if (!stopped) setIsLoading(false)
        })
      } catch (err) {
        if (!stopped) {
          setError(err instanceof Error ? err.message : 'Failed to fetch products')
          setIsLoading(false)
        }
      }
    }

    start()

    const timeout = setTimeout(() => {
      if (!stopped) setIsLoading(false)
    }, 10000)

    return () => {
      stopped = true
      clearTimeout(timeout)
      subRef.current?.stop()
      subRef.current = null
    }
  }, [merchantPubkey, stallId])

  return { products, categories, isLoading, error }
}
