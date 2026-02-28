import NDK from '@nostr-dev-kit/ndk'
import NDKCacheAdapterDexie from '@nostr-dev-kit/cache-dexie'
import { DEFAULT_RELAYS } from '@/config/constants'

let ndkInstance: NDK | null = null

export function getNDK(): NDK {
  if (!ndkInstance) {
    const cacheAdapter = new NDKCacheAdapterDexie({ dbName: 'mobile-pos' })
    ndkInstance = new NDK({
      explicitRelayUrls: DEFAULT_RELAYS,
      cacheAdapter,
    })
  }
  return ndkInstance
}

export async function connectNDK(): Promise<NDK> {
  const ndk = getNDK()
  await ndk.connect()
  return ndk
}

export function resetNDK(): void {
  ndkInstance = null
}
