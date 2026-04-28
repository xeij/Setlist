import { render, screen } from '@testing-library/react'
import TrackRow from './TrackRow'

const track = { name: 'Karma Police', frequency: 0.95, slot: 'mid' }

it('renders track name and frequency', () => {
  render(<TrackRow track={track} index={3} />)
  expect(screen.getByText('Karma Police')).toBeInTheDocument()
  expect(screen.getByText('95%')).toBeInTheDocument()
})

it('shows OPENER pill on opener slot', () => {
  render(<TrackRow track={{ ...track, slot: 'opener' }} index={1} />)
  expect(screen.getByText('OPENER')).toBeInTheDocument()
})

it('shows ENCORE pill on encore slot', () => {
  render(<TrackRow track={{ ...track, slot: 'encore' }} index={20} />)
  expect(screen.getByText('ENCORE')).toBeInTheDocument()
})

it('shows no pill for mid and closer slots', () => {
  render(<TrackRow track={track} index={3} />)
  expect(screen.queryByText('OPENER')).not.toBeInTheDocument()
  expect(screen.queryByText('ENCORE')).not.toBeInTheDocument()
})
