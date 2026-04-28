const SLOT_PILLS = { opener: 'OPENER', encore: 'ENCORE' }

export default function TrackRow({ track, index }) {
  const pill = SLOT_PILLS[track.slot]
  const pct = Math.round(track.frequency * 100)

  return (
    <div className="flex items-center gap-4 py-3 px-4">
      <span className="w-6 text-right text-sm text-gray-400 shrink-0">{index}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{track.name}</span>
          {pill && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 shrink-0">
              {pill}
            </span>
          )}
        </div>
      </div>

      <span className="text-sm text-gray-400 shrink-0">{pct}%</span>
    </div>
  )
}
