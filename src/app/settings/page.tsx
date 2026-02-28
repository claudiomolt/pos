'use client'

import Navbar from '@/components/shared/Navbar'

const ACTIVE_CURRENCIES = ['SAT', 'ARS', 'USD']
const AVAILABLE_CURRENCIES = ['BRL', 'EUR', 'CLP', 'MXN', 'COP', 'GBP', 'JPY', 'CHF', 'PEN', 'UYU', 'BOB', 'PYG']

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      <Navbar title="Settings" />

      <div className="px-4 py-6 space-y-8 max-w-lg mx-auto">
        {/* Active Currencies */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Active Currencies</h2>
          <div className="space-y-2">
            {ACTIVE_CURRENCIES.map((c, i) => (
              <div key={c} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#0f1729] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-600 text-xs">{i + 1}</span>
                  <span className="font-medium">{c}</span>
                  {i === 0 && <span className="text-xs bg-[#f7931a]/20 text-[#f7931a] px-2 py-0.5 rounded">default</span>}
                </div>
                <button className="text-zinc-600 hover:text-red-400 transition text-sm">✕</button>
              </div>
            ))}
          </div>
        </section>

        {/* Add Currency */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Add Currency</h2>
          <div className="grid grid-cols-3 gap-2">
            {AVAILABLE_CURRENCIES.map((c) => (
              <button
                key={c}
                className="rounded-lg border border-zinc-800 bg-[#0f1729] px-3 py-2.5 text-sm text-zinc-400 hover:border-[#f7931a] hover:text-[#f7931a] transition"
              >
                + {c}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-600">126 currencies available via yadio.io</p>
        </section>

        {/* Relays */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Nostr Relays</h2>
          {['wss://relay.lacrypta.ar', 'wss://relay.damus.io', 'wss://nostr-pub.wellorder.net'].map((relay) => (
            <div key={relay} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#0f1729] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-zinc-300 font-mono">{relay}</span>
              </div>
              <button className="text-zinc-600 hover:text-red-400 transition text-sm">✕</button>
            </div>
          ))}
        </section>

        {/* Display */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Display</h2>
          <div className="rounded-lg border border-zinc-800 bg-[#0f1729] px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-zinc-300">Show Bitcoin Block</span>
            <div className="w-10 h-5 rounded-full bg-[#f7931a] relative">
              <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
