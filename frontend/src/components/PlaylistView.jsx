import TrackRow from './TrackRow'

export default function PlaylistView({ artist, playlist, spotifyToken, onSave, onRegenerate, onBack, saving }) {
  const unavailable = playlist.tracks.filter(t => t.spotify_match === null).length
  const hasAvailable = unavailable < playlist.tracks.length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-6 block">
          ← New Search
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">{artist.name}</h2>
          <p className="text-gray-400">{playlist.tour_name} · {playlist.total_shows} shows analysed</p>
          <p className="text-sm text-gray-500 mt-1">
            {playlist.tracks.length} songs
            {unavailable > 0 && ` · ${unavailable} unavailable`}
          </p>
        </div>

        {unavailable === playlist.tracks.length && (
          <div className="bg-yellow-900/40 border border-yellow-700 rounded-lg px-4 py-3 text-yellow-300 text-sm mb-4">
            None of these tracks are available on Spotify.
          </div>
        )}

        <div className="flex gap-3 mb-6">
          {spotifyToken ? (
            <button
              className="bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-5 py-2 rounded-full text-sm transition-colors"
              onClick={onSave}
              disabled={!hasAvailable || saving}
            >
              {saving ? 'Saving...' : 'Save to Spotify'}
            </button>
          ) : (
            <button
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-5 py-2 rounded-full text-sm transition-colors"
              onClick={onSave}
            >
              Connect Spotify & Save
            </button>
          )}
          <button
            className="border border-gray-600 hover:border-gray-400 px-5 py-2 rounded-full text-sm transition-colors"
            onClick={onRegenerate}
          >
            Regenerate
          </button>
        </div>

        <div className="divide-y divide-gray-800">
          {playlist.tracks.map((track, i) => (
            <TrackRow key={track.name} track={track} index={i + 1} />
          ))}
        </div>
      </div>
    </div>
  )
}
