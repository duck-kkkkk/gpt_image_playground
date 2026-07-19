import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildApiUrl, shouldUseApiProxy } from './devProxy'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('buildApiUrl', () => {
  it('uses the same-origin proxy prefix when API proxy is enabled', () => {
    expect(buildApiUrl('http://api.example.com/v1', 'images/edits', null, true)).toBe(
      '/api-proxy/images/edits',
    )
  })

  it('leaves API versioning to the proxy target when proxying', () => {
    expect(buildApiUrl('http://api.example.com', 'images/generations', null, true)).toBe(
      '/api-proxy/images/generations',
    )
  })

  it('uses a configured proxy prefix when one is available', () => {
    expect(
      buildApiUrl(
        'http://api.example.com/v1',
        'responses',
        {
          enabled: true,
          prefix: '/openai-proxy',
          target: 'http://api.example.com/v1',
          changeOrigin: true,
          secure: false,
        },
        true,
      ),
    ).toBe('/openai-proxy/responses')
  })

  it('uses the configured API URL directly when API proxy is disabled', () => {
    expect(buildApiUrl('http://api.example.com/v1', 'responses', null, false)).toBe(
      'http://api.example.com/v1/responses',
    )
  })

  it('can bypass a deployment-locked proxy for an explicitly direct profile', () => {
    vi.stubEnv('VITE_API_PROXY_LOCKED', 'true')
    const proxyConfig = {
      enabled: true,
      prefix: '/api-proxy',
      target: 'https://site.example/v1',
      changeOrigin: true,
      secure: true,
    }

    expect(shouldUseApiProxy(false, proxyConfig)).toBe(true)
    expect(shouldUseApiProxy(false, proxyConfig, false)).toBe(false)
  })
})
