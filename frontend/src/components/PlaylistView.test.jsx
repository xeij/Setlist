import { render, screen } from '@testing-library/react'
import PlaylistView from './PlaylistView'
import { vi } from 'vitest'

const makeTracks = (count) =>
  Array.from({ length: count }, (_, i) => ({
    name: `Song ${i + 1}`,
    frequency: 0.9,
    slot: 'mid',
  }))

const BASE_PROPS = {
  artist: { name: 'Radiohead' },
  playlist: { tracks: makeTracks(5), tour_name: 'OK Tour', total_shows: 25 },
  onRegenerate: vi.fn(),
  onBack: vi.fn(),
}

it('renders track count in header', () => {
  render(<PlaylistView {...BASE_PROPS} />)
  expect(screen.getByText(/5 songs/i)).toBeInTheDocument()
})

it('renders all tracks', () => {
  render(<PlaylistView {...BASE_PROPS} />)
  expect(screen.getByText('Song 1')).toBeInTheDocument()
  expect(screen.getByText('Song 5')).toBeInTheDocument()
})
