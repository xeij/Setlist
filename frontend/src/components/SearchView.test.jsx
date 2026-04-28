import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import SearchView from './SearchView'

vi.mock('../services/api', () => ({
  searchArtists: vi.fn(),
}))

import { searchArtists } from '../services/api'

const ARTISTS = [
  { mbid: 'abc', name: 'Radiohead', disambiguation: 'UK rock band' },
  { mbid: 'def', name: 'Radiohead Tribute', disambiguation: null },
]

it('shows autocomplete results as user types', async () => {
  searchArtists.mockResolvedValue(ARTISTS)
  render(<SearchView onSelectArtist={vi.fn()} />)
  const input = screen.getByPlaceholderText(/artist/i)
  await userEvent.type(input, 'Radio')
  await waitFor(() => expect(screen.getByText('Radiohead')).toBeInTheDocument())
  expect(screen.getByText('UK rock band')).toBeInTheDocument()
})

it('calls onSelectArtist when result clicked', async () => {
  searchArtists.mockResolvedValue(ARTISTS)
  const onSelect = vi.fn()
  render(<SearchView onSelectArtist={onSelect} />)
  await userEvent.type(screen.getByPlaceholderText(/artist/i), 'Radio')
  await waitFor(() => screen.getByText('Radiohead'))
  await userEvent.click(screen.getByText('Radiohead'))
  expect(onSelect).toHaveBeenCalledWith({ mbid: 'abc', name: 'Radiohead', disambiguation: 'UK rock band' })
})

it('shows no results message when search returns empty', async () => {
  searchArtists.mockResolvedValue([])
  render(<SearchView onSelectArtist={vi.fn()} />)
  await userEvent.type(screen.getByPlaceholderText(/artist/i), 'zzznobody')
  await waitFor(() => expect(screen.getByText(/no results/i)).toBeInTheDocument())
})
