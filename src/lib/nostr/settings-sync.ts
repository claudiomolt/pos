/**
 * Nostr Settings Sync — kind:30078 (app-specific data)
 *
 * Publishes and fetches settings as NIP-78 app data events.
 * kind:30078 with d-tag = "pos-settings"
 */

import NDK, { NDKEvent, NDKFilter, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'

const APP_TAG = 'mobile-pos-v2'
const SETTINGS_KIND = 30078

export interface SyncableSettings {
  activeCurrencies: string[]
  defaultCurrency: string
  relays: string[]
  display: {
    showBlockHeight: boolean
    showQRFullscreen: boolean
    theme: 'light' | 'dark' | 'system'
  }
  updatedAt: number
}

/**
 * Publish settings to Nostr as kind:30078
 */
export async function publishSettings(
  ndk: NDK,
  privateKey: string,
  settings: Omit<SyncableSettings, 'updatedAt'>
): Promise<void> {
  try {
    const signer = new NDKPrivateKeySigner(privateKey)
    ndk.signer = signer

    const event = new NDKEvent(ndk)
    event.kind = SETTINGS_KIND
    event.tags = [['d', APP_TAG]]
    event.content = JSON.stringify({
      ...settings,
      updatedAt: Date.now(),
    } satisfies SyncableSettings)

    await event.publish()
    console.log('[settings-sync] Published settings to Nostr')
  } catch (err) {
    console.warn('[settings-sync] Failed to publish settings:', err)
  }
}

/**
 * Fetch latest settings from Nostr for a given pubkey.
 * Returns null if not found or on error.
 */
export async function fetchRemoteSettings(
  ndk: NDK,
  pubkey: string
): Promise<SyncableSettings | null> {
  try {
    const filter: NDKFilter = {
      kinds: [SETTINGS_KIND as number],
      authors: [pubkey],
      '#d': [APP_TAG],
      limit: 1,
    }

    const events = await ndk.fetchEvents(filter)
    const eventArray = Array.from(events)
    if (eventArray.length === 0) return null

    // Sort by created_at desc, get newest
    const latest = eventArray.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0))[0]
    if (!latest) return null
    const parsed = JSON.parse(latest.content) as SyncableSettings
    return parsed
  } catch (err) {
    console.warn('[settings-sync] Failed to fetch remote settings:', err)
    return null
  }
}

/**
 * Merge local and remote settings, preferring whichever is newer.
 * Local settings are always the base; remote only wins if strictly newer.
 */
export function mergeSettings(
  local: SyncableSettings,
  remote: SyncableSettings | null
): SyncableSettings {
  if (!remote) return local
  if (remote.updatedAt > local.updatedAt) {
    console.log('[settings-sync] Remote settings are newer, using remote')
    return remote
  }
  return local
}
