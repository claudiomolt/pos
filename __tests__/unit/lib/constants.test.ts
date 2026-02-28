import { describe, it, expect, beforeEach } from 'vitest'

describe('constants', () => {
  beforeEach(() => {
    // Clear env overrides
    delete process.env.NEXT_PUBLIC_RELAY_URL
    delete process.env.NEXT_PUBLIC_EXTRA_RELAYS
    delete process.env.NEXT_PUBLIC_CURRENCY_API
    delete process.env.NEXT_PUBLIC_LAWALLET_API
    delete process.env.NEXT_PUBLIC_DEFAULT_CURRENCY
  })

  it('DEFAULT_RELAYS contains lacrypta relay as first relay by default', async () => {
    const { DEFAULT_RELAYS } = await import('@/config/constants')
    expect(DEFAULT_RELAYS[0]).toContain('lacrypta.ar')
  })

  it('CURRENCY_API defaults to yadio.io', async () => {
    const { CURRENCY_API } = await import('@/config/constants')
    expect(CURRENCY_API).toContain('yadio.io')
  })

  it('LAWALLET_API defaults to api.lawallet.ar', async () => {
    const { LAWALLET_API } = await import('@/config/constants')
    expect(LAWALLET_API).toContain('lawallet.ar')
  })

  it('DEFAULT_CURRENCY is SAT', async () => {
    const { DEFAULT_CURRENCY } = await import('@/config/constants')
    expect(DEFAULT_CURRENCY).toBe('SAT')
  })

  it('RATE_UPDATE_INTERVAL is 60 seconds in ms', async () => {
    const { RATE_UPDATE_INTERVAL } = await import('@/config/constants')
    expect(RATE_UPDATE_INTERVAL).toBe(60_000)
  })

  it('DEFAULT_RELAYS is an array', async () => {
    const { DEFAULT_RELAYS } = await import('@/config/constants')
    expect(Array.isArray(DEFAULT_RELAYS)).toBe(true)
    expect(DEFAULT_RELAYS.length).toBeGreaterThan(0)
  })
})
