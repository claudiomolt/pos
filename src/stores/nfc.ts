import { create } from 'zustand'

type NFCCardData = {
  url: string
  rawRecords: string[]
}

interface NFCState {
  isAvailable: boolean
  isReading: boolean
  lastCard: NFCCardData | null
  error: string | null
  setAvailable: (available: boolean) => void
  setReading: (reading: boolean) => void
  setLastCard: (card: NFCCardData | null) => void
  setError: (error: string | null) => void
  reset: () => void
}

function detectNFCAvailability(): boolean {
  if (typeof window === 'undefined') return false
  // Web NFC API
  if ('NDEFReader' in window) return true
  // Android WebView bridge
  if ('Android' in window && typeof (window as Record<string, unknown>).Android === 'object') {
    const androidBridge = (window as Record<string, unknown>).Android as Record<string, unknown>
    if (typeof androidBridge.readNFC === 'function') return true
  }
  return false
}

export const useNFCStore = create<NFCState>((set) => ({
  isAvailable: detectNFCAvailability(),
  isReading: false,
  lastCard: null,
  error: null,

  setAvailable: (available) => set({ isAvailable: available }),
  setReading: (reading) => set({ isReading: reading }),
  setLastCard: (card) => set({ lastCard: card, error: null }),
  setError: (error) => set({ error, isReading: false }),
  reset: () => set({ isReading: false, lastCard: null, error: null }),
}))
