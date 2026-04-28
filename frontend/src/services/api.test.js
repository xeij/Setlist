import { describe, it, expect, vi } from 'vitest'
import { searchArtists, getSetlists, generatePlaylist } from './api'

beforeEach(() => {
  global.fetch = vi.fn()
})

describe('searchArtists', () => {
  it('calls /api/artists/search with query', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    await searchArtists('Radiohead')
    expect(global.fetch).toHaveBeenCalledWith('/api/artists/search?q=Radiohead')
  })
})

describe('getSetlists', () => {
  it('calls /api/setlists/{mbid}', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ tours: [], current_leg: null }) })
    await getSetlists('abc123')
    expect(global.fetch).toHaveBeenCalledWith('/api/setlists/abc123')
  })
})

describe('generatePlaylist', () => {
  it('POSTs to /api/playlist/generate', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ tracks: [] }) })
    await generatePlaylist('abc123', 'OK Tour', 'Radiohead')
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/playlist/generate',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ mbid: 'abc123', tour_name: 'OK Tour', artist_name: 'Radiohead' }),
      })
    )
  })

  it('throws on non-ok response', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ detail: 'Not found' }),
    })
    await expect(generatePlaylist('abc123', 'Bad Tour', 'Artist')).rejects.toThrow('Not found')
  })
})
