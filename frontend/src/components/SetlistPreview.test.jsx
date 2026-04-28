import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import SetlistPreview from './SetlistPreview'

const SETLISTS_DATA = {
  tours: [
    { name: 'OK Computer Tour', show_count: 25 },
    { name: 'Kid A Tour', show_count: 10 },
  ],
  current_leg: 'OK Computer Tour',
}

it('pre-selects the current leg in the dropdown', () => {
  render(
    <SetlistPreview
      artist={{ mbid: 'abc', name: 'Radiohead' }}
      setlistsData={SETLISTS_DATA}
      onGenerate={vi.fn()}
      onBack={vi.fn()}
    />
  )
  expect(screen.getByDisplayValue('OK Computer Tour (25 shows)')).toBeInTheDocument()
})

it('shows all tour options in dropdown', () => {
  render(
    <SetlistPreview
      artist={{ mbid: 'abc', name: 'Radiohead' }}
      setlistsData={SETLISTS_DATA}
      onGenerate={vi.fn()}
      onBack={vi.fn()}
    />
  )
  expect(screen.getByText('OK Computer Tour (25 shows)')).toBeInTheDocument()
  expect(screen.getByText('Kid A Tour (10 shows)')).toBeInTheDocument()
})

it('calls onGenerate with selected tour when button clicked', async () => {
  const onGenerate = vi.fn()
  render(
    <SetlistPreview
      artist={{ mbid: 'abc', name: 'Radiohead' }}
      setlistsData={SETLISTS_DATA}
      onGenerate={onGenerate}
      onBack={vi.fn()}
    />
  )
  await userEvent.click(screen.getByRole('button', { name: /generate/i }))
  expect(onGenerate).toHaveBeenCalledWith('OK Computer Tour')
})

it('shows loading state when generating', () => {
  render(
    <SetlistPreview
      artist={{ mbid: 'abc', name: 'Radiohead' }}
      setlistsData={SETLISTS_DATA}
      onGenerate={vi.fn()}
      onBack={vi.fn()}
      loading
    />
  )
  expect(screen.getByRole('button', { name: /generating/i })).toBeDisabled()
})
