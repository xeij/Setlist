import { render, screen } from '@testing-library/react'
import TrackRow from './TrackRow'

const availableTrack = {
  name: 'Karma Police',
  frequency: 0.95,
  slot: 'mid',
  spotify_match: {
    uri: 'spotify:track:abc',
    name: 'Karma Police',
    artists: ['Radiohead'],
    album: 'OK Computer',
    album_art: 'https://example.com/img.jpg',
    duration_ms: 264000,
  },
}

const unavailableTrack = {
  name: 'Rare B-Side',
  frequency: 0.3,
  slot: 'mid',
  spotify_match: null,
}

it('renders available track with album art and duration', () => {
  render(<TrackRow track={availableTrack} index={3} />)
  expect(screen.getByText('Karma Police')).toBeInTheDocument()
  expect(screen.getByText('4:24')).toBeInTheDocument()
  expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/img.jpg')
})

it('renders unavailable track greyed out with badge', () => {
  const { container } = render(<TrackRow track={unavailableTrack} index={5} />)
  expect(screen.getByText('Rare B-Side')).toBeInTheDocument()
  expect(screen.getByText('Not on Spotify')).toBeInTheDocument()
  expect(container.firstChild).toHaveClass('opacity-40')
})

it('shows OPENER pill on opener slot', () => {
  const track = { ...availableTrack, slot: 'opener' }
  render(<TrackRow track={track} index={1} />)
  expect(screen.getByText('OPENER')).toBeInTheDocument()
})

it('shows ENCORE pill on encore slot', () => {
  const track = { ...availableTrack, slot: 'encore' }
  render(<TrackRow track={track} index={20} />)
  expect(screen.getByText('ENCORE')).toBeInTheDocument()
})

it('shows no pill for mid and closer slots', () => {
  render(<TrackRow track={availableTrack} index={3} />)
  expect(screen.queryByText('OPENER')).not.toBeInTheDocument()
  expect(screen.queryByText('ENCORE')).not.toBeInTheDocument()
})
