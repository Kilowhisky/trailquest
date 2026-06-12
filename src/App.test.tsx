import type { ReactNode } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// react-leaflet renders a real Leaflet map that needs a sized DOM canvas;
// stub it so the smoke test exercises App composition, not the map engine.
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children?: ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
}))

describe('App', () => {
  it('mounts with the title, map, and data disclaimer', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    expect(screen.getByTestId('map')).toBeTruthy()
    expect(screen.getByText(/not legal, navigational/i)).toBeTruthy()
  })
})
