'use client'

import { useState } from 'react'
import { useNostrStore } from '@/stores/nostr'


function shortenPubkey(pubkey: string): string {
  if (pubkey.length <= 16) return pubkey
  return `${pubkey.slice(0, 8)}...${pubkey.slice(-8)}`
}

interface NostrLoginProps {
  onLogin?: (pubkey: string) => void
  onLogout?: () => void
}

export default function NostrLogin({ onLogin, onLogout }: NostrLoginProps) {
  const { merchantPubkey, setMerchantPubkey } = useNostrStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    setLoading(true)

    try {
      if (typeof window === 'undefined' || !window.nostr) {
        setError('No Nostr extension found. Install Alby or nos2x.')
        return
      }

      const pubkey = await window.nostr.getPublicKey()
      if (!pubkey) {
        setError('No pubkey returned from extension.')
        return
      }

      setMerchantPubkey(pubkey)
      onLogin?.(pubkey)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('denied')) {
        setError('Permission denied. Please allow access in your Nostr extension.')
      } else {
        setError(msg || 'Failed to connect Nostr extension.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setMerchantPubkey(null)
    setError(null)
    onLogout?.()
  }

  if (merchantPubkey) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-800/50 bg-green-900/10 px-4 py-3">
        <div className="flex-1">
          <p className="text-xs text-zinc-400">Connected as</p>
          <p className="font-mono text-sm text-white">{shortenPubkey(merchantPubkey)}</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-red-500 hover:text-red-400 transition"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full rounded-lg bg-[#f7931a] px-4 py-3 font-semibold text-black hover:bg-[#e8851a] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Connecting...' : '🦊 Login with Extension (NIP-07)'}
      </button>

      {error && (
        <p className="rounded-lg border border-red-800/50 bg-red-900/10 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
