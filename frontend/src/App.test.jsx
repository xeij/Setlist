import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'

vi.mock('./services/api', () => ({
  searchArtists: vi.fn().mockResolvedValue([{ mbid: 'abc', name: 'Radiohead', disambiguation: null }]),
  getSetlists: vi.fn().mockResolvedValue({ tours: [{ name: 'OK Tour', show_count: 5 }], current_leg: 'OK Tour' }),
  generatePlaylist: vi.fn().mockResolvedValue({ artist: 'Radiohead', tour_name: 'OK Tour', tracks: [{ name: 'Airbag', frequency: 1.0, slot: 'opener' }], total_shows: 5 }),
}))

it('starts on the search view', () => {
  render(<App />)
  expect(screen.getByPlaceholderText(/artist/i)).toBeInTheDocument()
})

it('navigates to preview view after selecting an artist', async () => {
  render(<App />)
  await userEvent.type(screen.getByPlaceholderText(/artist/i), 'Radio')
  await waitFor(() => screen.getByText('Radiohead'))
  await userEvent.click(screen.getByText('Radiohead'))
  await waitFor(() => screen.getByRole('button', { name: /generate/i }))
})

it('navigates to playlist view after generating', async () => {
  render(<App />)
  await userEvent.type(screen.getByPlaceholderText(/artist/i), 'Radio')
  await waitFor(() => screen.getByText('Radiohead'))
  await userEvent.click(screen.getByText('Radiohead'))
  await waitFor(() => screen.getByRole('button', { name: /generate/i }))
  await userEvent.click(screen.getByRole('button', { name: /generate/i }))
  await waitFor(() => screen.getByRole('button', { name: /change tour/i }))
})
