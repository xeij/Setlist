import { useState, useEffect } from 'react'
import SearchView from './components/SearchView'
import SetlistPreview from './components/SetlistPreview'
import PlaylistView from './components/PlaylistView'
import { getSetlists, generatePlaylist } from './services/api'
import { getStoredToken, generateLoginUrl, exchangeCode, storeToken } from './services/spotifyAuth'
import { getCurrentUser, savePlaylist } from './services/spotifyApi'

export default function App() {
  const [view, setView] = useState('search')
  const [artist, setArtist] = useState(null)
  const [setlistsData, setSetlistsData] = useState(null)
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [spotifyToken, setSpotifyToken] = useState(() => getStoredToken())
  const [error, setError] = useState(null)

  // Handle Spotify OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code) return
    exchangeCode(code)
      .then(({ accessToken, expiresAt }) => {
        storeToken(accessToken, expiresAt)
        setSpotifyToken(accessToken)
        window.history.replaceState({}, '', '/')
        if (playlist) triggerSave(accessToken)
      })
      .catch(() => setError('Spotify login failed. Please try again.'))
  }, [])

  async function handleSelectArtist(selected) {
    setArtist(selected)
    setLoading(true)
    setError(null)
    try {
      const data = await getSetlists(selected.mbid)
      setSetlistsData(data)
      setView('preview')
    } catch {
      setError('Failed to load setlists. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerate(tourName) {
    setLoading(true)
    setError(null)
    try {
      const data = await generatePlaylist(artist.mbid, tourName, artist.name)
      setPlaylist(data)
      setView('playlist')
    } catch (err) {
      setError(err.message || 'Failed to generate playlist.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    const token = spotifyToken || getStoredToken()
    if (!token) {
      const url = await generateLoginUrl()
      window.location.href = url
      return
    }
    await triggerSave(token)
  }

  async function triggerSave(token) {
    setSaving(true)
    try {
      const user = await getCurrentUser(token)
      const uris = playlist.tracks
        .filter(t => t.spotify_match)
        .map(t => t.spotify_match.uri)
      await savePlaylist(token, user.id, artist.name, playlist.tour_name, uris)
    } catch {
      setError('Failed to save playlist to Spotify.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-900 border border-red-700 text-red-200 px-4 py-2 rounded-lg text-sm z-50">
          {error}
          <button className="ml-3 text-red-400 hover:text-white" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {view === 'search' && (
        <SearchView onSelectArtist={handleSelectArtist} />
      )}
      {view === 'preview' && setlistsData && (
        <SetlistPreview
          artist={artist}
          setlistsData={setlistsData}
          onGenerate={handleGenerate}
          onBack={() => setView('search')}
          loading={loading}
        />
      )}
      {view === 'playlist' && playlist && (
        <PlaylistView
          artist={artist}
          playlist={playlist}
          spotifyToken={spotifyToken}
          onSave={handleSave}
          onRegenerate={() => setView('preview')}
          onBack={() => setView('search')}
          saving={saving}
        />
      )}
    </>
  )
}
