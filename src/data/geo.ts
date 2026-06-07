// TRAVEL1 — real-world geography.
// The prototype positioned everything with 0–100 x/y on a fake SVG map.
// Here we map the known landmarks to their real coordinates, and fall back
// to a small offset around the city centre for any synthetic stop.
import type { Spot, Stop } from "./types";

export type LatLng = [number, number];

// City centres (used as fallback anchors + default map focus).
export const CITY_CENTER: Record<string, LatLng> = {
  Warsaw: [52.2360, 21.0090],
  Krakow: [50.0600, 19.9400],
  Gdansk: [54.3520, 18.6520],
};

// Real coordinates for the named landmarks in the dataset.
export const SPOT_GEO: Record<string, LatLng> = {
  // Warsaw
  castle:   [52.2479, 21.0137],
  oldtown:  [52.2497, 21.0122],
  lazienki: [52.2150, 21.0356],
  palace:   [52.2316, 21.0067],
  uprising: [52.2325, 20.9810],
  koszyki:  [52.2207, 21.0156],
  polin:    [52.2496, 20.9931],
  bristol:  [52.2419, 21.0146],
  // Kraków
  wawel:     [50.0540, 19.9354],
  rynek:     [50.0617, 19.9373],
  kazimierz: [50.0518, 19.9447],
  schindler: [50.0476, 19.9614],
  // Gdańsk
  longmkt:    [54.3489, 18.6535],
  crane:      [54.3500, 18.6580],
  solidarity: [54.3608, 18.6489],
};

// Map an x/y pair (0–100) to a small offset around a city centre.
// Roughly a ~2.5 km span so synthetic stops sit plausibly near the centre.
export function projManual(place: string, x: number, y: number): LatLng {
  const c = CITY_CENTER[place] || CITY_CENTER.Warsaw;
  const dLng = ((x - 50) / 50) * 0.024;
  const dLat = -((y - 50) / 50) * 0.016;
  return [c[0] + dLat, c[1] + dLng];
}

// Resolve a spot to a real coordinate (named landmark → real, else fallback).
export function spotLatLng(s: Pick<Spot, "id" | "place" | "x" | "y">): LatLng {
  return SPOT_GEO[s.id] || projManual(s.place, s.x, s.y);
}

// Resolve a trip stop. Stops don't carry `place`, so the trip's city is passed in.
export function stopLatLng(stop: Pick<Stop, "id" | "x" | "y">, place: string): LatLng {
  return SPOT_GEO[stop.id] || projManual(place, stop.x, stop.y);
}

// Fit a set of points: returns Leaflet-style bounds [[s,w],[n,e]] or null.
export function boundsOf(points: LatLng[]): [LatLng, LatLng] | null {
  if (!points.length) return null;
  let minLat = points[0][0], maxLat = points[0][0];
  let minLng = points[0][1], maxLng = points[0][1];
  for (const [lat, lng] of points) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return [[minLat, minLng], [maxLat, maxLng]];
}
