'use client'

import Navbar from '@/components/shared/Navbar'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      <Navbar title="Admin Panel" />

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Login */}
        <div className="rounded-xl border border-zinc-800 bg-[#0f1729] p-6 text-center space-y-4">
          <div className="text-4xl">🔐</div>
          <h2 className="text-lg font-semibold">Connect with Nostr</h2>
          <p className="text-sm text-zinc-400">Sign in with your Nostr key to manage your stalls and products</p>
          <div className="space-y-2">
            <button className="w-full rounded-lg bg-[#f7931a] px-4 py-3 font-semibold text-black hover:bg-[#e8851a] transition">
              🦊 Login with Extension (NIP-07)
            </button>
            <button className="w-full rounded-lg border border-zinc-700 bg-[#0f1729] px-4 py-3 text-sm text-zinc-300 hover:border-[#f7931a] transition">
              🔑 nsecBunker
            </button>
          </div>
        </div>

        {/* Dashboard Preview (would show after login) */}
        <div className="space-y-4 opacity-60">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Your Stalls</h3>

          {[
            { name: 'Barra', products: 8, currency: 'ARS' },
            { name: 'Comida', products: 5, currency: 'ARS' },
            { name: 'Merch', products: 23, currency: 'SAT' },
          ].map((stall) => (
            <a
              key={stall.name}
              href="/admin/stalls/demo"
              className="block rounded-lg border border-zinc-800 bg-[#0f1729] px-4 py-3 hover:border-[#f7931a]/50 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{stall.name}</p>
                  <p className="text-xs text-zinc-500">{stall.products} products · {stall.currency}</p>
                </div>
                <span className="text-zinc-600">→</span>
              </div>
            </a>
          ))}

          <a
            href="/admin/stalls"
            className="block w-full rounded-lg border border-dashed border-zinc-700 px-4 py-3 text-center text-sm text-zinc-500 hover:border-[#f7931a] hover:text-[#f7931a] transition"
          >
            + Create New Stall
          </a>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Stalls', value: '3' },
            { label: 'Products', value: '36' },
            { label: 'Sales Today', value: '12' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-zinc-800 bg-[#0f1729] p-3 text-center">
              <p className="text-xl font-bold text-[#f7931a]">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
