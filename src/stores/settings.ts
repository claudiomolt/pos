import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_RELAYS, DEFAULT_CURRENCY } from '@/config/constants'

interface DisplayPreferences {
  showBlockHeight: boolean
  showQRFullscreen: boolean
  theme: 'light' | 'dark' | 'system'
}

interface SettingsState {
  // Lightning / setup
  lightningAddress: string
  merchantName: string

  // Nostr relay config
  relays: string[]

  // Product catalog
  stallId: string | null

  // Currency preferences
  defaultCurrency: string
  activeCurrencies: string[]

  // Display preferences
  display: DisplayPreferences

  // Actions
  setLightningAddress: (address: string) => void
  setMerchantName: (name: string) => void
  setRelays: (relays: string[]) => void
  addRelay: (url: string) => void
  removeRelay: (url: string) => void
  resetRelays: () => void
  setStallId: (id: string | null) => void
  setDefaultCurrency: (currency: string) => void
  setActiveCurrencies: (currencies: string[]) => void
  setDisplay: (prefs: Partial<DisplayPreferences>) => void
  reset: () => void
}

const DEFAULT_DISPLAY: DisplayPreferences = {
  showBlockHeight: true,
  showQRFullscreen: false,
  theme: 'system',
}

const INITIAL_STATE = {
  lightningAddress: '',
  merchantName: '',
  relays: DEFAULT_RELAYS,
  stallId: null,
  defaultCurrency: DEFAULT_CURRENCY,
  activeCurrencies: ['SAT', 'ARS', 'USD'],
  display: DEFAULT_DISPLAY,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setLightningAddress: (address) => set({ lightningAddress: address }),
      setMerchantName: (name) => set({ merchantName: name }),

      setRelays: (relays) => set({ relays }),
      addRelay: (url) =>
        set((state) => ({
          relays: state.relays.includes(url) ? state.relays : [...state.relays, url],
        })),
      removeRelay: (url) =>
        set((state) => ({
          relays: state.relays.filter((r) => r !== url),
        })),
      resetRelays: () => set({ relays: DEFAULT_RELAYS }),

      setStallId: (id) => set({ stallId: id }),
      setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),
      setActiveCurrencies: (currencies) => set({ activeCurrencies: currencies }),

      setDisplay: (prefs) =>
        set((state) => ({ display: { ...state.display, ...prefs } })),

      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'pos-settings',
      version: 1,
    }
  )
)
