'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/shared/Navbar'
import NostrLogin from '@/components/shared/NostrLogin'
import { useNostrStore } from '@/stores/nostr'
import { useStall } from '@/hooks/useStall'
import { useProducts } from '@/hooks/useProducts'

export default function StallsPage() {
  const router = useRouter()
  const { merchantPubkey } = useNostrStore()
  const { stalls, isLoading } = useStall(merchantPubkey)
  const { products } = useProducts(merchantPubkey)

  useEffect(() => {
    if (!merchantPubkey) router.replace('/admin')
  }, [merchantPubkey, router])

  if (!merchantPubkey) {
    return (
      <div className="min-h-screen bg-[#060a12] text-white">
        <Navbar title="Stalls" backHref="/admin" />
        <div className="px-4 py-6 max-w-lg mx-auto">
          <div className="rounded-xl border border-zinc-800 bg-[#0f1729] p-6 space-y-4">
            <p className="text-center text-zinc-400">Connect with Nostr to manage stalls</p>
            <NostrLogin />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      <Navbar title="Stalls" backHref="/admin" />

      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
        {isLoading && (
          <div className="rounded-lg border border-zinc-800 bg-[#0f1729] p-6 text-center text-zinc-500 text-sm">
            Loading stalls...
          </div>
        )}

        {!isLoading && stalls.length === 0 && (
          <div className="rounded-lg border border-zinc-800 bg-[#0f1729] p-6 text-center text-zinc-500 text-sm">
            No stalls found. Create your first one!
          </div>
        )}

        {stalls.map((stall) => {
          const stallProducts = products.filter((p) => p.stallId === stall.id)
          return (
            <Link
              key={stall.id}
              href={`/admin/stalls/${stall.id}`}
              className="block rounded-lg border border-zinc-800 bg-[#0f1729] px-4 py-4 hover:border-[#f7931a]/50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-semibold">{stall.name}</p>
                  {stall.description && (
                    <p className="text-sm text-zinc-400 line-clamp-1">{stall.description}</p>
                  )}
                  <p className="text-xs text-zinc-600">
                    {stallProducts.length} products · {stall.currency}
                  </p>
                </div>
                <span className="text-zinc-600 mt-1">→</span>
              </div>
            </Link>
          )
        })}

        <Link
          href="/admin/stalls/new"
          className="block w-full rounded-lg border border-dashed border-zinc-700 px-4 py-4 text-center text-sm text-zinc-500 hover:border-[#f7931a] hover:text-[#f7931a] transition"
        >
          + Create New Stall (kind:30017)
        </Link>
      </div>
    </div>
  )
}
