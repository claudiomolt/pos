'use client'

import Navbar from '@/components/shared/Navbar'
import { useParams } from 'next/navigation'

export default function ProductEditPage() {
  const params = useParams()
  const productId = params.productId as string

  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      <Navbar title="Edit Product" backHref="/admin/stalls/demo" />

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        <form className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Product Name</label>
            <input
              type="text"
              defaultValue="Cerveza IPA"
              className="w-full rounded-lg border border-zinc-700 bg-[#0f1729] px-4 py-3 text-white focus:border-[#f7931a] focus:outline-none focus:ring-1 focus:ring-[#f7931a] transition"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Description</label>
            <textarea
              rows={2}
              defaultValue="Pinta de IPA artesanal 500ml"
              className="w-full rounded-lg border border-zinc-700 bg-[#0f1729] px-4 py-3 text-white focus:border-[#f7931a] focus:outline-none focus:ring-1 focus:ring-[#f7931a] transition resize-none"
            />
          </div>

          {/* Price + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">Price</label>
              <input
                type="number"
                defaultValue="4800"
                className="w-full rounded-lg border border-zinc-700 bg-[#0f1729] px-4 py-3 text-white focus:border-[#f7931a] focus:outline-none focus:ring-1 focus:ring-[#f7931a] transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">Currency</label>
              <select className="w-full rounded-lg border border-zinc-700 bg-[#0f1729] px-4 py-3 text-white focus:border-[#f7931a] focus:outline-none transition">
                <option>ARS</option>
                <option>SAT</option>
                <option>USD</option>
                <option>BRL</option>
                <option>EUR</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Categories (t tags)</label>
            <div className="flex flex-wrap gap-2">
              {['Con Alcohol', 'Cerveza'].map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-[#f7931a]/20 text-[#f7931a] px-3 py-1 text-sm">
                  {tag}
                  <button className="text-[#f7931a]/60 hover:text-[#f7931a]">✕</button>
                </span>
              ))}
              <button className="rounded-full border border-dashed border-zinc-700 px-3 py-1 text-sm text-zinc-500 hover:border-[#f7931a] hover:text-[#f7931a] transition">
                + tag
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Quantity</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="∞ unlimited"
                className="flex-1 rounded-lg border border-zinc-700 bg-[#0f1729] px-4 py-3 text-white placeholder-zinc-600 focus:border-[#f7931a] focus:outline-none focus:ring-1 focus:ring-[#f7931a] transition"
              />
              <span className="text-xs text-zinc-500">Leave empty for unlimited</span>
            </div>
          </div>

          {/* Image */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Image</label>
            <div className="rounded-lg border border-dashed border-zinc-700 bg-[#0f1729] p-6 text-center">
              <p className="text-2xl mb-1">📷</p>
              <p className="text-sm text-zinc-500">Upload to nostr.build</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              className="flex-1 rounded-lg border border-zinc-700 bg-[#0f1729] px-4 py-3 text-sm text-zinc-300 hover:border-red-500 hover:text-red-400 transition"
            >
              Delete
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-[#f7931a] px-4 py-3 font-semibold text-black hover:bg-[#e8851a] transition"
            >
              Publish (kind:30018)
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-zinc-600">
          Product ID: {productId} · Changes are published as Nostr events
        </p>
      </div>
    </div>
  )
}
