import L from 'leaflet'
import type { LngLat } from '../types/quest'

/** Convert app [lng, lat] to Leaflet's [lat, lng] order. */
export const toLatLng = ([lng, lat]: LngLat): [number, number] => [lat, lng]

const SHADOW = '0 1px 4px rgba(0,0,0,.55)'

function divIcon(html: string, size: number, className = 'tq-pin'): L.DivIcon {
  return L.divIcon({ html, className, iconSize: [size, size], iconAnchor: [size / 2, size / 2] })
}

/** Discovered scored checkpoint — numbered orange pin (ringed if it has a photo prompt). */
export function checkpointIcon(n: number, scenic: boolean): L.DivIcon {
  const ring = scenic ? 'box-shadow:0 0 0 3px rgba(252,211,77,.6),' + SHADOW : 'box-shadow:' + SHADOW
  return divIcon(
    `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#f97316;color:#fff;font:700 14px/1 ui-sans-serif,system-ui;border:2px solid #fff;${ring}">${n}</div>`,
    28,
    'tq-pin tq-reveal',
  )
}

/** Undiscovered checkpoint — faint dashed "?" pin (fog-of-war). */
export function undiscoveredIcon(): L.DivIcon {
  return divIcon(
    `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:rgba(80,80,90,.55);color:rgba(255,255,255,.85);font:700 13px/1 ui-sans-serif,system-ui;border:1px dashed rgba(255,255,255,.65)">?</div>`,
    24,
  )
}

/** Forbidden waypoint — red "no entry" sign (always visible, D-013). */
export function forbiddenIcon(): L.DivIcon {
  return divIcon(
    `<div style="position:relative;width:28px;height:28px;border-radius:50%;background:#dc2626;border:2px solid #fff;box-shadow:${SHADOW}"><span style="position:absolute;top:11px;left:5px;width:16px;height:4px;background:#fff;border-radius:1px"></span></div>`,
    28,
  )
}

/** Draggable simulated-user marker — blue dot with a pulse ring. */
export function userIcon(): L.DivIcon {
  return divIcon(
    `<div class="tq-user-pulse" style="position:absolute;inset:0;border-radius:50%"></div>
     <div style="position:absolute;top:5px;left:5px;width:16px;height:16px;border-radius:50%;background:#38bdf8;border:3px solid #fff;box-shadow:0 0 0 2px rgba(56,189,248,.45),${SHADOW}"></div>`,
    26,
    'tq-pin tq-user',
  )
}
