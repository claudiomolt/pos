'use client'

import Link from 'next/link'
import Navbar from '@/components/shared/Navbar'
import NostrLogin from '@/components/shared/NostrLogin'
import { useNostrStore } from '@/stores/nostr'
import { useStall } from '@/hooks/useStall'
import { useProducts } from '@/hooks/useProducts'

function shortenPubkey(pubkey: string): string {
  if (pubkey.length <= 20) return pubkey
  return `${pubkey.slice(0, 10)}...${pubkey.slice(-8)}`
}

function Dashboard({ pubkey }: { pubkey: string }) {
  const { stalls, isLoading: stallsLoading } = useStall(pubkey)
  const { products } = useProducts(pubkey)

  return (
    <div className="space-y-6">
      {/* Pubkey */}
      <div className="rounded-xl border border-zinc-800 bg-[#0f1729] p-4">
        <p className="text-xs text-zinc-500 mb-1">Merchant Pubkey</p>
        <p className="font-mono text-sm text-[#f7931a] break-all">{shortenPubkey(pubkey)}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-800 bg-[#0f1729] p-3 text-center">
          <p className="text-xl font-bold text-[#f7931a]">{stalls.length}</p>
          <p className="text-xs text-zinc-500">Stalls</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-[#0f1729] p-3 text-center">
          <p className="text-xl font-bold text-[#f7931a]">{products.length}</p>
          <p className="text-xs text-zinc-500">Products</p>
        </div>
        <Link
          href="/admin/sales"
          className="rounded-lg border border-zinc-800 bg-[#0f1729] p-3 text-center hover:border-[#f7931a]/50 transition"
        >
          <p className="text-xl font-bold text-[#f7931a]">⚡</p>
          <p className="text-xs text-zinc-500">Sales</p>
        </Link>
      </div>

      {/* Stalls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Your Stalls</h3>
          <Link href="/admin/stalls" className="text-xs text-[#f7931a] hover:underline">View all →</Link>
        </div>

        {stallsLoading && (
          <div className="rounded-lg border border-zinc-800 bg-[#0f1729] p-6 text-center text-zinc-500 text-sm">
            Loading stalls...
          </div>
        )}

        {!stallsLoading && stalls.length === 0 && (
          <div className="rounded-lg border border-zinc-800 bg-[#0f1729] p-6 text-center text-zinc-500 text-sm">
            No stalls found. Create your first one!
          </div>
        )}

        {stalls.slice(0, 4).map((stall) => {
          const stallProducts = products.filter((p) => p.stallId === stall.id)
          return (
            <Link
              key={stall.id}
              href={`/admin/stalls/${stall.id}`}
              className="block rounded-lg border border-zinc-800 bg-[#0f1729] px-4 py-3 hover:border-[#f7931a]/50 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{stall.name}</p>
                  <p className="text-xs text-zinc-500">{stallProducts.length} products · {stall.currency}</p>
                </div>
                <span className="text-zinc-600">→</span>
              </div>
            </Link>
          )
        })}

        <Link
          href="/admin/stalls/new"
          className="block w-full rounded-lg border border-dashed border-zinc-700 px-4 py-3 text-center text-sm text-zinc-500 hover:border-[#f7931a] hover:text-[#f7931a] transition"
        >
          + Create New Stall
        </Link>
      </div>

      {/* Nav */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/admin/stalls"
          className="rounded-lg border border-zinc-800 bg-[#0f1729] px-4 py-3 text-center text-sm hover:border-[#f7931a]/50 transition"
        >
          🏪 Stalls
        </Link>
        <Link
          href="/admin/sales"
          className="rounded-lg border border-zinc-800 bg-[#0f1729] px-4 py-3 text-center text-sm hover:border-[#f7931a]/50 transition"
        >
          ⚡ Sales History
        </Link>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { merchantPubkey } = useNostrStore()

  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      <Navbar title="Admin Panel" backHref="/" />

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {!merchantPubkey ? (
          <div className="rounded-xl border border-zinc-800 bg-[#0f1729] p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="text-5xl">🔐</div>
              <h2 className="text-lg font-semibold">Connect with Nostr</h2>
              <p className="text-sm text-zinc-400">Sign in with your Nostr key to manage your stalls and products</p>
            </div>
            <NostrLogin />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Dashboard</h2>
              <NostrLogin />
            </div>
            <Dashboard pubkey={merchantPubkey} />
          </>
        )}
      </div>
    </div>
  )
}
