import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getStoredToken, storeToken, clearToken } from './spotifyAuth'

describe('token storage', () => {
  beforeEach(() => sessionStorage.clear())

  it('returns null when nothing stored', () => {
    expect(getStoredToken()).toBeNull()
  })

  it('returns token when stored and not expired', () => {
    storeToken('tok123', Date.now() + 3600000)
    expect(getStoredToken()).toBe('tok123')
  })

  it('returns null when token expired', () => {
    storeToken('tok123', Date.now() - 1000)
    expect(getStoredToken()).toBeNull()
  })

  it('clears token', () => {
    storeToken('tok123', Date.now() + 3600000)
    clearToken()
    expect(getStoredToken()).toBeNull()
  })
})

describe('generateLoginUrl', () => {
  it('returns a Spotify authorize URL', async () => {
    const { generateLoginUrl } = await import('./spotifyAuth')
    const url = await generateLoginUrl()
    expect(url).toContain('https://accounts.spotify.com/authorize')
    expect(url).toContain('code_challenge_method=S256')
    expect(url).toContain('response_type=code')
  })
})
