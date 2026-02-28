/**
 * Proxy mode via lncurl/NWC disposable wallet (Issue #21)
 *
 * When the destination Lightning Address does NOT support NIP-57 (Zap), we can
 * route payments through a disposable NWC wallet acting as an intermediate hop:
 *
 *   1. Create a disposable NWC wallet (via lncurl.lol or any NWC provider)
 *   2. Generate an invoice from the disposable wallet
 *   3. Customer pays the disposable wallet invoice
 *   4. Detect the incoming payment via NWC event subscription
 *   5. Forward funds to the real destination Lightning Address
 *   6. Dispose (discard) the wallet
 *
 * STATUS: Stub implementation.
 *   - The interface and wiring are in place for when lncurl.lol is available.
 *   - Currently falls back to direct LNURL payment flow with a console warning.
 */

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ProxyWallet {
  /** NWC connection URI for the disposable wallet */
  nwcUri: string

  /**
   * Generate a BOLT-11 invoice for `amount` millisats from the disposable wallet.
   */
  invoiceCallback: (amountMsats: number) => Promise<string>

  /**
   * Register a callback that fires when a payment is received by the disposable wallet.
   */
  onPayment: (callback: (payment: unknown) => void) => void

  /**
   * Forward `amountMsats` to a destination Lightning Address.
   * Returns true on success, false on failure.
   */
  forward: (destination: string, amountMsats: number) => Promise<boolean>

  /**
   * Tear down the disposable wallet and release resources.
   */
  dispose: () => void
}

// ─── Stub implementation ────────────────────────────────────────────────────

/**
 * Creates a disposable NWC proxy wallet.
 *
 * @throws {Error} When the actual lncurl service is not yet integrated.
 *   Callers should catch this and fall back to direct LNURL flow.
 */
export async function createProxyWallet(): Promise<ProxyWallet> {
  console.warn(
    '[ProxyWallet] lncurl.lol integration not yet available. ' +
      'Falling back to direct LNURL flow. ' +
      'Implement `createProxyWallet` once lncurl.lol is accessible.'
  )

  // TODO: Replace with real implementation:
  //
  // const res = await fetch('https://api.lncurl.lol/wallet/create', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ttl: 600 }),
  // })
  // const { nwcUri } = await res.json()
  //
  // Then use @getalby/sdk or a custom NWC client to:
  //   - make_invoice → invoiceCallback
  //   - subscribe to notifications → onPayment
  //   - pay_invoice to destination → forward

  throw new ProxyNotAvailableError(
    'Proxy wallet is not yet implemented. Use direct LNURL flow.'
  )
}

export class ProxyNotAvailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProxyNotAvailableError'
  }
}

// ─── NIP-57 support detection ───────────────────────────────────────────────

/**
 * Checks whether a resolved LNURL endpoint supports NIP-57 zap receipts.
 * This is the same check we do in the order page, extracted here for reuse.
 */
export function supportsNip57(lnurlData: {
  allowsNostr?: boolean
  nostrPubkey?: string
}): boolean {
  return Boolean(lnurlData.allowsNostr && lnurlData.nostrPubkey)
}
