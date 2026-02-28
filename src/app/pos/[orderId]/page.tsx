import Navbar from '@/components/shared/Navbar'

interface Props {
  params: Promise<{ orderId: string }>
}

export default async function OrderPage({ params }: Props) {
  const { orderId } = await params
  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      <Navbar title="Payment" backHref="/pos" />

      <div className="flex flex-col items-center justify-center px-6 py-12 space-y-8">
        {/* QR Placeholder */}
        <div className="w-64 h-64 rounded-2xl bg-white flex items-center justify-center">
          <div className="text-center text-black">
            <p className="text-6xl mb-2">📱</p>
            <p className="text-sm font-medium">QR Code</p>
            <p className="text-xs text-zinc-500">Scan to pay</p>
          </div>
        </div>

        {/* Amount */}
        <div className="text-center space-y-1">
          <p className="text-3xl font-bold text-[#f7931a]">5,000 sats</p>
          <p className="text-sm text-zinc-400">≈ $4,800 ARS</p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-2 h-2 rounded-full bg-[#f7931a] animate-pulse" />
          <p className="text-sm">Waiting for payment...</p>
        </div>

        {/* NFC */}
        <div className="w-full max-w-xs rounded-lg border border-zinc-800 bg-[#0f1729] px-4 py-3 text-center">
          <p className="text-sm text-zinc-400">📡 NFC ready — tap card to pay</p>
        </div>

        {/* Order Info */}
        <div className="w-full max-w-xs text-xs text-zinc-600 text-center space-y-1">
          <p>Order: {orderId}</p>
          <p>Invoice expires in 4:59</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <a href="/pos" className="rounded-lg border border-zinc-700 bg-[#0f1729] px-4 py-2 text-sm text-zinc-400 hover:text-white transition">
            Cancel
          </a>
          <button className="rounded-lg bg-[#0f1729] border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-white transition">
            Copy Invoice
          </button>
        </div>
      </div>
    </div>
  )
}
