import { useState, useEffect, useRef } from 'react'
import { searchArtists } from '../services/api'

export default function SearchView({ onSelectArtist }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null) // null = not searched, [] = no results
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchArtists(query.trim())
        setResults(data)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-2 tracking-tight">Setlist</h1>
      <p className="text-gray-400 mb-8 text-center">
        Paste an artist name and get a Spotify playlist of what they'll probably play tonight.
      </p>

      <div className="relative w-full max-w-md">
        <input
          className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Search for an artist..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />

        {loading && (
          <div className="absolute top-full mt-1 w-full bg-gray-800 rounded-lg p-3 text-gray-400 text-sm">
            Searching...
          </div>
        )}

        {!loading && results !== null && (
          <ul className="absolute top-full mt-1 w-full bg-gray-800 rounded-lg overflow-hidden shadow-xl z-10">
            {results.length === 0 ? (
              <li className="px-4 py-3 text-gray-400 text-sm">No results for "{query}"</li>
            ) : (
              results.map(artist => (
                <li
                  key={artist.mbid}
                  className="px-4 py-3 hover:bg-gray-700 cursor-pointer"
                  onClick={() => onSelectArtist(artist)}
                >
                  <div className="font-medium">{artist.name}</div>
                  {artist.disambiguation && (
                    <div className="text-sm text-gray-400">{artist.disambiguation}</div>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
