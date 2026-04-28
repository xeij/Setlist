import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCurrentUser, savePlaylist } from './spotifyApi'

const TOKEN = 'test_token'

describe('getCurrentUser', () => {
  it('fetches /v1/me and returns user', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'user123', display_name: 'Test User' }),
    })
    const user = await getCurrentUser(TOKEN)
    expect(user.id).toBe('user123')
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/me',
      expect.objectContaining({ headers: { Authorization: 'Bearer test_token' } })
    )
  })
})

describe('savePlaylist', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'playlist123', external_urls: { spotify: 'https://open.spotify.com/playlist/123' } }),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
  })

  it('creates playlist then adds tracks', async () => {
    const result = await savePlaylist(TOKEN, 'user123', 'Radiohead', 'OK Tour', ['spotify:track:abc'])
    expect(result.id).toBe('playlist123')
    expect(global.fetch).toHaveBeenCalledTimes(2)
    const [createCall] = global.fetch.mock.calls
    expect(createCall[0]).toContain('/users/user123/playlists')
  })

  it('batches tracks in groups of 100', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'p1', external_urls: { spotify: 'url' } }),
      })
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })

    const uris = Array.from({ length: 150 }, (_, i) => `spotify:track:${i}`)
    await savePlaylist(TOKEN, 'user123', 'Artist', 'Tour', uris)
    // 1 create + 2 add-tracks batches
    expect(global.fetch).toHaveBeenCalledTimes(3)
  })
})
