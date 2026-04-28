import TrackRow from './TrackRow'

export default function PlaylistView({ artist, playlist, onRegenerate, onBack }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-6 block">
          ← New Search
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">{artist.name}</h2>
          <p className="text-gray-400">{playlist.tour_name} · {playlist.total_shows} shows analysed</p>
          <p className="text-sm text-gray-500 mt-1">{playlist.tracks.length} songs</p>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            className="border border-gray-600 hover:border-gray-400 px-5 py-2 rounded-full text-sm transition-colors"
            onClick={onRegenerate}
          >
            ← Change Tour
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
