'use client'

import Navbar from '@/components/shared/Navbar'

// Placeholder menu items for demo
const DEMO_CATEGORIES = [
  {
    name: 'Bebidas',
    items: [
      { id: 1, name: 'Cerveza', price: 4800, currency: 'ARS' },
      { id: 2, name: 'Gaseosa', price: 3100, currency: 'ARS' },
      { id: 3, name: 'Agua', price: 2000, currency: 'ARS' },
    ],
  },
  {
    name: 'Comida',
    items: [
      { id: 4, name: 'Choripán', price: 5500, currency: 'ARS' },
      { id: 5, name: 'Hamburguesa', price: 7000, currency: 'ARS' },
    ],
  },
  {
    name: 'Café',
    items: [
      { id: 6, name: 'Espresso', price: 2500, currency: 'ARS' },
      { id: 7, name: 'Cortado', price: 2800, currency: 'ARS' },
    ],
  },
]

export default function POSPage() {
  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      <Navbar title="⚡ POS" />

      {/* Currency Selector */}
      <div className="flex gap-2 px-4 py-3 border-b border-zinc-800">
        {['SAT', 'ARS', 'USD'].map((c) => (
          <button
            key={c}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              c === 'ARS'
                ? 'bg-[#f7931a] text-black'
                : 'bg-[#0f1729] text-zinc-400 hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Menu */}
      <div className="px-4 py-4 space-y-6">
        {DEMO_CATEGORIES.map((category) => (
          <div key={category.name}>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              {category.name}
            </h2>
            <div className="space-y-2">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#0f1729] px-4 py-3 hover:border-[#f7931a]/50 transition cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-zinc-500">Tap to add</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#f7931a] font-semibold">
                      ${item.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-600">{item.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f1729] border-t border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="rounded-lg bg-red-900/50 text-red-400 px-3 py-2.5 text-sm hover:bg-red-900 transition">
            🗑️ 0
          </button>
          <a
            href="/pos/demo-order-001"
            className="flex-1 rounded-lg bg-[#f7931a] px-4 py-2.5 font-semibold text-black text-center hover:bg-[#e8851a] transition"
          >
            Cobrar $0
          </a>
        </div>
      </div>
    </div>
  )
}
