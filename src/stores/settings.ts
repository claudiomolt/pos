// TODO: Settings store — relay URL, wallet config, stall ID, currency prefs
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  lightningAddress: string
  relayUrl: string
  stallId: string | null
  currency: string
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (): SettingsState => ({
      lightningAddress: '',
      relayUrl: 'wss://relay.lacrypta.ar',
      stallId: null,
      currency: 'SAT',
    }),
    { name: 'pos-settings' }
  )
)
