import { useState } from 'react'

export default function SetlistPreview({ artist, setlistsData, onGenerate, onBack, loading }) {
  const [selectedTour, setSelectedTour] = useState(setlistsData.current_leg || setlistsData.tours[0]?.name || '')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-8">
      <button onClick={onBack} className="absolute top-6 left-6 text-gray-400 hover:text-white text-sm">
        ← Back
      </button>

      <h2 className="text-3xl font-bold mb-1">{artist.name}</h2>
      <p className="text-gray-400 mb-8">Select a tour leg to predict tonight's setlist</p>

      <div className="w-full max-w-md space-y-4">
        <select
          className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500"
          value={selectedTour}
          onChange={e => setSelectedTour(e.target.value)}
        >
          {setlistsData.tours.map(tour => (
            <option key={tour.name} value={tour.name}>
              {tour.name} ({tour.show_count} shows)
            </option>
          ))}
        </select>

        <button
          className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition-colors"
          onClick={() => onGenerate(selectedTour)}
          disabled={loading || !selectedTour}
        >
          {loading ? 'Generating...' : 'Generate Playlist'}
        </button>
      </div>
    </div>
  )
}
