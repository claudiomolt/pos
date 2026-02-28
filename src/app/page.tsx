'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const [lightningAddress, setLightningAddress] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (lightningAddress.includes('@')) {
      // Store address and navigate to POS
      localStorage.setItem('pos-destination', lightningAddress)
      router.push('/pos')
    }
  }

  return (
    <main className="min-h-screen bg-[#060a12] text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Title */}
        <div className="text-center space-y-2">
          <div className="text-5xl">⚡</div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Mobile POS</h1>
          <p className="text-sm text-zinc-400">Bitcoin Lightning · Powered by Nostr</p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="lightning-address" className="text-sm font-medium text-zinc-300">
              Lightning Address
            </label>
            <input
              id="lightning-address"
              type="email"
              placeholder="you@lawallet.ar"
              value={lightningAddress}
              onChange={(e) => setLightningAddress(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-[#0f1729] px-4 py-3 text-white placeholder-zinc-600 focus:border-[#f7931a] focus:outline-none focus:ring-1 focus:ring-[#f7931a] transition"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#f7931a] px-4 py-3 font-semibold text-black hover:bg-[#e8851a] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!lightningAddress.includes('@')}
          >
            Get Started
          </button>
        </form>

        {/* Navigation Links */}
        <div className="pt-4 border-t border-zinc-800 space-y-2">
          <p className="text-xs text-zinc-500 text-center mb-3">Quick Navigation</p>
          <div className="grid grid-cols-2 gap-2">
            <a href="/settings" className="rounded-lg border border-zinc-700 bg-[#0f1729] px-3 py-2.5 text-sm text-center text-zinc-300 hover:border-[#f7931a] hover:text-[#f7931a] transition">
              ⚙️ Settings
            </a>
            <a href="/admin" className="rounded-lg border border-zinc-700 bg-[#0f1729] px-3 py-2.5 text-sm text-center text-zinc-300 hover:border-[#f7931a] hover:text-[#f7931a] transition">
              🔧 Admin
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600">
          Your keys, your sats. No custodian.
        </p>
      </div>
    </main>
  )
}
