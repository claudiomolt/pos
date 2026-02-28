'use client'

import Navbar from '@/components/shared/Navbar'

const DEMO_STALLS = [
  { id: 'barra', name: 'Barra', description: 'Bebidas y tragos', products: 8, currency: 'ARS', status: 'active' },
  { id: 'comida', name: 'Comida', description: 'Choripán, hamburguesas, panchos', products: 5, currency: 'ARS', status: 'active' },
  { id: 'cafe', name: 'Café', description: 'Cafetería y bebidas calientes', products: 3, currency: 'ARS', status: 'active' },
  { id: 'merch', name: 'Merch', description: 'Merchandising La Crypta', products: 23, currency: 'SAT', status: 'active' },
  { id: 'bitnaria', name: 'Bitnaria', description: 'Items bitnaria', products: 2, currency: 'ARS', status: 'draft' },
]

export default function StallsPage() {
  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      <Navbar title="Stalls" backHref="/admin" />

      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
        {DEMO_STALLS.map((stall) => (
          <a
            key={stall.id}
            href={`/admin/stalls/${stall.id}`}
            className="block rounded-lg border border-zinc-800 bg-[#0f1729] px-4 py-4 hover:border-[#f7931a]/50 transition"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{stall.name}</p>
                  {stall.status === 'draft' && (
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">draft</span>
                  )}
                </div>
                <p className="text-sm text-zinc-400">{stall.description}</p>
                <p className="text-xs text-zinc-600">{stall.products} products · {stall.currency}</p>
              </div>
              <span className="text-zinc-600 mt-1">→</span>
            </div>
          </a>
        ))}

        <button className="w-full rounded-lg border border-dashed border-zinc-700 px-4 py-4 text-center text-sm text-zinc-500 hover:border-[#f7931a] hover:text-[#f7931a] transition">
          + Create New Stall (kind:30017)
        </button>
      </div>
    </div>
  )
}
