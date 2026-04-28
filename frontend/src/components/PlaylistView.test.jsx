import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import PlaylistView from './PlaylistView'

const makeTracks = (count, available = true) =>
  Array.from({ length: count }, (_, i) => ({
    name: `Song ${i + 1}`,
    frequency: 0.9,
    slot: 'mid',
    spotify_match: available
      ? { uri: `spotify:track:${i}`, name: `Song ${i + 1}`, artists: ['Artist'], album: 'Album', album_art: null, duration_ms: 180000 }
      : null,
  }))

const BASE_PROPS = {
  artist: { name: 'Radiohead' },
  playlist: { tracks: makeTracks(5), tour_name: 'OK Tour', total_shows: 25 },
  spotifyToken: null,
  onSave: vi.fn(),
  onRegenerate: vi.fn(),
  onBack: vi.fn(),
}

it('renders track count in header', () => {
  render(<PlaylistView {...BASE_PROPS} />)
  expect(screen.getByText(/5 songs/i)).toBeInTheDocument()
})

it('shows unavailable count when some tracks missing', () => {
  const mixed = [...makeTracks(3), ...makeTracks(2, false)]
  const props = { ...BASE_PROPS, playlist: { ...BASE_PROPS.playlist, tracks: mixed } }
  render(<PlaylistView {...props} />)
  expect(screen.getByText(/2 unavailable/i)).toBeInTheDocument()
})

it('shows Connect Spotify button when no token', () => {
  render(<PlaylistView {...BASE_PROPS} />)
  expect(screen.getByRole('button', { name: /connect spotify/i })).toBeInTheDocument()
})

it('shows Save button when token provided', () => {
  render(<PlaylistView {...BASE_PROPS} spotifyToken="tok123" />)
  expect(screen.getByRole('button', { name: /save to spotify/i })).toBeInTheDocument()
})

it('disables Save button when all tracks unavailable', () => {
  const noTracks = { ...BASE_PROPS, playlist: { tracks: makeTracks(3, false), tour_name: 'Tour', total_shows: 3 } }
  render(<PlaylistView {...noTracks} spotifyToken="tok" />)
  expect(screen.getByRole('button', { name: /save to spotify/i })).toBeDisabled()
})

it('calls onSave when Save button clicked', async () => {
  const onSave = vi.fn()
  render(<PlaylistView {...BASE_PROPS} spotifyToken="tok" onSave={onSave} />)
  await userEvent.click(screen.getByRole('button', { name: /save to spotify/i }))
  expect(onSave).toHaveBeenCalled()
})
