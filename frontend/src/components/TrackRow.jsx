function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const SLOT_PILLS = { opener: 'OPENER', encore: 'ENCORE' }

export default function TrackRow({ track, index }) {
  const available = track.spotify_match !== null
  const pill = SLOT_PILLS[track.slot]

  return (
    <div className={`flex items-center gap-4 py-3 px-4 ${available ? '' : 'opacity-40'}`}>
      <span className="w-6 text-right text-sm text-gray-400 shrink-0">{index}</span>

      {available ? (
        <img
          src={track.spotify_match.album_art}
          alt={track.spotify_match.album}
          className="w-10 h-10 rounded shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded bg-gray-700 shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{track.name}</span>
          {pill && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 shrink-0">
              {pill}
            </span>
          )}
        </div>
        {available && (
          <p className="text-sm text-gray-400 truncate">
            {track.spotify_match.artists.join(', ')} — {track.spotify_match.album}
          </p>
        )}
      </div>

      <div className="text-sm text-gray-400 shrink-0">
        {available ? formatDuration(track.spotify_match.duration_ms) : (
          <span className="text-xs text-gray-500 border border-gray-600 rounded px-1.5 py-0.5">
            Not on Spotify
          </span>
        )}
      </div>
    </div>
  )
}
