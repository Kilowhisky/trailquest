import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'
import { scoredCheckpoints } from './data/quest'

// MapView wraps a real Leaflet map that needs a sized DOM canvas + tile network;
// stub it so the smoke test exercises App composition, not the map engine. The stub
// exposes a button that drives `onMoveUser` so we can test App's interactive wiring.
const firstCheckpoint = scoredCheckpoints[0].position
vi.mock('./components/MapView', () => ({
  MapView: ({ onMoveUser }: { onMoveUser: (p: [number, number]) => void }) => (
    <div data-testid="map">
      <button onClick={() => onMoveUser(firstCheckpoint)}>sim-move-to-cp1</button>
    </div>
  ),
}))

describe('App', () => {
  it('mounts with the title, map, and data disclaimer', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    expect(screen.getByTestId('map')).toBeTruthy()
    expect(screen.getByText(/not legal, navigational/i)).toBeTruthy()
  })

  it('latches fog-of-war discovery when the user enters a checkpoint discovery radius', async () => {
    render(<App />)
    expect(screen.getByText(/0\/5 discovered/)).toBeTruthy()
    fireEvent.click(screen.getByText('sim-move-to-cp1'))
    expect(await screen.findByText(/1\/5 discovered/)).toBeTruthy()
  })

  it('toggles the hillshade overlay label', () => {
    render(<App />)
    const btn = screen.getByRole('button', { name: /hillshade off/i })
    fireEvent.click(btn)
    expect(screen.getByRole('button', { name: /hillshade on/i })).toBeTruthy()
  })
})
