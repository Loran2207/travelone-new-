// TRAVEL1 — the real map (Leaflet + OpenStreetMap).
// Replaces the prototype's fake SVG maps. Pins and route nodes are
// Leaflet divIcons that reuse the prototype's .pin / .routenode markup,
// so they look identical but sit at real coordinates you can pan & zoom.
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { CATS } from "../data/data";
import type { LatLng } from "../data/geo";

// ---- divIcon html builders -------------------------------------------
export function pinHtml(opts: {
  cat?: string; num?: number | null; count?: number | null;
  label?: string | null; active?: boolean;
}): string {
  const cat = (opts.cat && CATS[opts.cat]) || ({} as { color?: string; icon?: string });
  const color = cat.color || "#0A84FF";
  const inner =
    opts.num != null
      ? `<div class="pin-num">${opts.num}</div>`
      : `<div class="pin-cat"><iconify-icon icon="${cat.icon || "hugeicons:location-01"}"></iconify-icon></div>`;
  const count = opts.count != null ? `<span class="pin-count">${opts.count}</span>` : "";
  const label = opts.label ? `<div class="pin-label">${opts.label}</div>` : "";
  return (
    `<div class="pin${opts.active ? " active" : ""}">` +
    `<div class="pin-bubble" style="background:${color}">${inner}${count}</div>` +
    `<div class="pin-tip" style="border-top-color:${color}"></div>` +
    label +
    `</div>`
  );
}

export function routeNodeHtml(color: string, n: number): string {
  return `<div class="routenode" style="background:${color}"><span>${n}</span></div>`;
}
export function routeLabelHtml(color: string, text: string): string {
  return `<div class="routelabel" style="background:${color}">${text}</div>`;
}
const ME_HTML = `<div class="medot"><div class="halo"><div class="core"></div></div></div>`;

function icon(html: string, cls: string): L.DivIcon {
  return L.divIcon({ html, className: cls, iconSize: [0, 0], iconAnchor: [0, 0] });
}

// ---- marker / route models -------------------------------------------
export interface MapMarker {
  key: string;
  latlng: LatLng;
  html: string;
  cls?: string;
  onClick?: () => void;
}
export interface MapRoute {
  key: string;
  color: string;
  positions: LatLng[];
}
export interface MapFocusTarget {
  bounds?: [LatLng, LatLng] | null;
  center?: LatLng;
  zoom?: number;
  _n?: number; // bump to force a re-fit (re-center button)
}

// ---- imperative focus + resize ---------------------------------------
function MapController({ focus, padBottom = 0 }: { focus?: MapFocusTarget | null; padBottom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  useEffect(() => {
    if (!focus) return;
    const padTL: [number, number] = [36, 96];
    const padBR: [number, number] = [36, padBottom + 28];
    if (focus.bounds) {
      map.fitBounds(focus.bounds, { paddingTopLeft: padTL, paddingBottomRight: padBR, maxZoom: 16, animate: true });
    } else if (focus.center) {
      map.flyTo(focus.center, focus.zoom ?? map.getZoom(), { animate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(focus), padBottom]);
  return null;
}

function MapClicks({ onClick }: { onClick?: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick?.([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// ---- the map ----------------------------------------------------------
export interface RealMapProps {
  center?: LatLng;
  zoom?: number;
  markers?: MapMarker[];
  routes?: MapRoute[];
  meDot?: LatLng | null;
  focus?: MapFocusTarget | null;
  padBottom?: number;
  onMapClick?: (latlng: LatLng) => void;
}

export function RealMap({
  center = [52.2360, 21.009],
  zoom = 13,
  markers = [],
  routes = [],
  meDot = null,
  focus = null,
  padBottom = 0,
  onMapClick,
}: RealMapProps) {
  return (
    <div className="t1-map">
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        attributionControl
        scrollWheelZoom
        preferCanvas
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
          maxZoom={20}
        />

        {routes.map((r) => (
          <RouteLine key={r.key} route={r} />
        ))}

        {meDot && <Marker position={meDot} icon={icon(ME_HTML, "t1-me-icon")} interactive={false} />}

        {markers.map((m) => (
          <Marker
            key={m.key}
            position={m.latlng}
            icon={icon(m.html, m.cls || "t1-pin-icon")}
            eventHandlers={m.onClick ? { click: m.onClick } : undefined}
          />
        ))}

        <MapController focus={focus} padBottom={padBottom} />
        {onMapClick && <MapClicks onClick={onMapClick} />}
      </MapContainer>
    </div>
  );
}

// A day route: a white casing under a dashed coloured line (matches the mock).
function RouteLine({ route }: { route: MapRoute }) {
  if (route.positions.length < 2) return null;
  return (
    <>
      <Polyline positions={route.positions} pathOptions={{ color: "#fff", weight: 9, opacity: 0.9, lineCap: "round", lineJoin: "round" }} />
      <Polyline positions={route.positions} pathOptions={{ color: route.color, weight: 5, opacity: 0.85, lineCap: "round", lineJoin: "round" }} />
    </>
  );
}
