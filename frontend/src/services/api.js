const BASE = import.meta.env.VITE_API_BASE_URL || ''

export async function searchArtists(q) {
  const res = await fetch(`${BASE}/api/artists/search?q=${encodeURIComponent(q)}`)
  return res.json()
}

export async function getSetlists(mbid) {
  const res = await fetch(`${BASE}/api/setlists/${mbid}`)
  return res.json()
}

export async function generatePlaylist(mbid, tourName, artistName) {
  const res = await fetch(`${BASE}/api/playlist/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mbid, tour_name: tourName, artist_name: artistName }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}
