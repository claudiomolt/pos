'use client'

import { useState, useEffect, useRef } from 'react'
import type { NDKSubscription } from '@nostr-dev-kit/ndk'
import Navbar from '@/components/shared/Navbar'
import NostrLogin from '@/components/shared/NostrLogin'
import { useNostrStore } from '@/stores/nostr'
import { connectNDK } from '@/lib/nostr/ndk'
import { parseZapReceiptEvent, type ZapReceipt } from '@/lib/nostr/marketplace'

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function formatSats(sats: number): string {
  if (sats === 0) return '? sats'
  return `${sats.toLocaleString()} sats`
}

function shortenPubkey(pubkey: string): string {
  return `${pubkey.slice(0, 6)}...${pubkey.slice(-6)}`
}

// ISO date string for date inputs
function toDateInput(d: Date): string {
  return d.toISOString().split('T')[0]!
}

export default function SalesPage() {
  const { merchantPubkey } = useNostrStore()
  const [receipts, setReceipts] = useState<ZapReceipt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const subRef = useRef<NDKSubscription | null>(null)

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const [dateFrom, setDateFrom] = useState(toDateInput(thirtyDaysAgo))
  const [dateTo, setDateTo] = useState(toDateInput(now))

  useEffect(() => {
    if (!merchantPubkey) return

    setIsLoading(true)
    setError(null)
    setReceipts([])

    let stopped = false

    const start = async () => {
      try {
        const ndk = await connectNDK()

        const since = Math.floor(new Date(dateFrom).getTime() / 1000)
        const until = Math.floor(new Date(dateTo).getTime() / 1000) + 86400

        const sub = ndk.subscribe(
          {
            kinds: [9735 as number],
            '#p': [merchantPubkey],
            since,
            until,
          },
          { closeOnEose: false },
        )
        subRef.current = sub

        sub.on('event', (event) => {
          if (stopped) return
          const receipt = parseZapReceiptEvent(event)
          if (receipt) {
            setReceipts((prev) => {
              if (prev.find((r) => r.id === receipt.id)) return prev
              return [...prev, receipt].sort((a, b) => b.timestamp - a.timestamp)
            })
          }
        })

        sub.on('eose', () => {
          if (!stopped) setIsLoading(false)
        })
      } catch (err) {
        if (!stopped) {
          setError(err instanceof Error ? err.message : 'Failed to fetch sales')
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
  }, [merchantPubkey, dateFrom, dateTo])

  const totalSats = receipts.reduce((sum, r) => sum + r.amount, 0)

  if (!merchantPubkey) {
    return (
      <div className="min-h-screen bg-[#060a12] text-white">
        <Navbar title="Sales History" backHref="/admin" />
        <div className="px-4 py-6 max-w-lg mx-auto">
          <div className="rounded-xl border border-zinc-800 bg-[#0f1729] p-6 space-y-4">
            <p className="text-center text-zinc-400">Connect with Nostr to view sales</p>
            <NostrLogin />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      <Navbar title="Sales History" backHref="/admin" />

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Date filter */}
        <div className="rounded-xl border border-zinc-800 bg-[#0f1729] p-4 space-y-3">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Date Range</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">From</label>
              <input
                type="date"
                value={dateFrom}
                max={dateTo}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-[#060a12] px-3 py-2 text-sm text-white focus:border-[#f7931a] focus:outline-none transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">To</label>
              <input
                type="date"
                value={dateTo}
                min={dateFrom}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-[#060a12] px-3 py-2 text-sm text-white focus:border-[#f7931a] focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="rounded-xl border border-[#f7931a]/30 bg-[#f7931a]/5 p-4 text-center">
          <p className="text-xs text-zinc-400 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-[#f7931a]">{formatSats(totalSats)}</p>
          <p className="text-xs text-zinc-500 mt-1">{receipts.length} zap receipts</p>
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-lg border border-red-800/50 bg-red-900/10 px-3 py-2 text-xs text-red-400">{error}</p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="rounded-lg border border-zinc-800 bg-[#0f1729] p-6 text-center text-zinc-500 text-sm">
            Fetching zap receipts (kind:9735)...
          </div>
        )}

        {/* Empty */}
        {!isLoading && receipts.length === 0 && (
          <div className="rounded-lg border border-zinc-800 bg-[#0f1729] p-8 text-center text-zinc-500 text-sm">
            <p className="text-3xl mb-2">⚡</p>
            <p>No zap receipts found for this period.</p>
          </div>
        )}

        {/* List */}
        <div className="space-y-2">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              className="rounded-lg border border-zinc-800 bg-[#0f1729] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-400">{formatDate(receipt.timestamp)}</p>
                  {receipt.payerPubkey && (
                    <p className="text-xs text-zinc-600 font-mono mt-0.5">
                      from {shortenPubkey(receipt.payerPubkey)}
                    </p>
                  )}
                </div>
                <p className="text-[#f7931a] font-bold whitespace-nowrap">
                  {formatSats(receipt.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
