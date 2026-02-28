'use client'

import Navbar from '@/components/shared/Navbar'
import { useParams } from 'next/navigation'

const DEMO_PRODUCTS = [
  { id: 1, name: 'Cerveza IPA', category: 'Con Alcohol', price: 4800, currency: 'ARS', available: true },
  { id: 2, name: 'Cerveza Lager', category: 'Con Alcohol', price: 4200, currency: 'ARS', available: true },
  { id: 3, name: 'Fernet con Cola', category: 'Con Alcohol', price: 5500, currency: 'ARS', available: true },
  { id: 4, name: 'Gaseosa', category: 'Sin Alcohol', price: 3100, currency: 'ARS', available: true },
  { id: 5, name: 'Agua', category: 'Sin Alcohol', price: 2000, currency: 'ARS', available: false },
]

export default function StallDetailPage() {
  const params = useParams()
  const stallId = params.stallId as string

  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      <Navbar title={`Stall: ${stallId}`} backHref="/admin/stalls" />

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Stall Info */}
        <div className="rounded-lg border border-zinc-800 bg-[#0f1729] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold capitalize">{stallId}</h2>
            <button className="text-xs text-[#f7931a] border border-[#f7931a]/30 rounded px-2 py-1 hover:bg-[#f7931a]/10 transition">
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-zinc-500 text-xs">Currency</p>
              <p>ARS</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Products</p>
              <p>{DEMO_PRODUCTS.length}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">NIP-15 Kind</p>
              <p className="font-mono text-xs">30017</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Status</p>
              <p className="text-green-400">Active</p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Products</h3>
            <button className="text-xs text-[#f7931a] hover:underline">+ Add Product</button>
          </div>

          {DEMO_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className={`rounded-lg border bg-[#0f1729] px-4 py-3 ${
                product.available ? 'border-zinc-800' : 'border-zinc-800 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{product.name}</p>
                    {!product.available && (
                      <span className="text-xs bg-red-900/50 text-red-400 px-1.5 py-0.5 rounded">Agotado</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">{product.category} · kind:30018</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[#f7931a] font-semibold">${product.price.toLocaleString()}</p>
                  <div
                    className={`w-8 h-4 rounded-full relative cursor-pointer ${
                      product.available ? 'bg-green-600' : 'bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition ${
                        product.available ? 'right-0.5' : 'left-0.5'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 rounded-lg border border-zinc-700 bg-[#0f1729] px-4 py-2.5 text-sm text-zinc-300 hover:border-[#f7931a] transition">
            📤 Export JSON
          </button>
          <button className="flex-1 rounded-lg border border-zinc-700 bg-[#0f1729] px-4 py-2.5 text-sm text-zinc-300 hover:border-[#f7931a] transition">
            👁️ Preview as POS
          </button>
        </div>
      </div>
    </div>
  )
}
