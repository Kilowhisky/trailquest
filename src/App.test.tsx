import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// MapView wraps a real Leaflet map that needs a sized DOM canvas + tile network;
// stub it so the smoke test exercises App composition, not the map engine.
vi.mock('./components/MapView', () => ({
  MapView: () => <div data-testid="map" />,
}))

describe('App', () => {
  it('mounts with the title, map, and data disclaimer', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    expect(screen.getByTestId('map')).toBeTruthy()
    expect(screen.getByText(/not legal, navigational/i)).toBeTruthy()
  })
})
