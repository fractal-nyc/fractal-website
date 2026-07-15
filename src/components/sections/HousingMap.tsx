import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { HOUSES } from "@/data/houses";

// The marker chip/dot border + area label draw the Co-Living house accent.
// These strings are raw DOM handed to Leaflet's `L.divIcon`, where CSS `var()`
// resolves fine (the nodes live under :root) but a hex must be a real value —
// so the color is sourced from the canonical house palette, not hand-typed.
const HOUSE_COLOR = HOUSES.find((h) => h.id === "neighborhood")!.palette.deep;

type Side = "left" | "right" | "top" | "bottom";
type House = {
  name: string;
  area: string;
  lat: number;
  lng: number;
  side: Side; // which side of the pin the label chip sits on
  url?: string;
};

// Ported verbatim from the Claude design's `setupHousingMap()`. The design flips
// McKibbin to "bottom" when narrow; at phone width every marker is dot-only
// (side is irrelevant), so the wide-layout "right" is kept as the base value.
const HOUSE_LOCATIONS: House[] = [
  { name: "Homebrew", area: "Chinatown", lat: 40.7158, lng: -73.997, side: "top", url: "https://homebrew.nyc/" },
  { name: "Canopy", area: "FiDi", lat: 40.7075, lng: -74.0113, side: "bottom" },
  { name: "Baby Haus", area: "Williamsburg", lat: 40.7118, lng: -73.944, side: "top" },
  { name: "The McKibbin Lofts", area: "East Williamsburg", lat: 40.706, lng: -73.9337, side: "right" },
  { name: "Bebop", area: "Fort Greene", lat: 40.6893, lng: -73.974, side: "right", url: "https://youtu.be/e79kOV_Qgvw?si=R1_J8vlXz46zlJYh" },
  { name: "Bergen House", area: "Boerum Hill", lat: 40.6845, lng: -73.984, side: "left" },
  { name: "Lofi House", area: "Park Slope", lat: 40.672, lng: -73.98, side: "bottom" },
];

// Below this container width the always-on chips collide, so we fall back to
// dot-only markers with a tap-to-open popup. Measured on the map CONTAINER, not
// the viewport.
const NARROW_BREAKPOINT = 500;

function chipHtml(h: House): string {
  return (
    `<div style="background:var(--color-background);border:1.5px solid ${HOUSE_COLOR};border-radius:12px;padding:4px 12px;box-shadow:0 3px 0 rgba(23,23,23,0.15);white-space:nowrap;text-align:center;">` +
    `<div style="font-family:'JetBrains Mono',monospace;font-weight:500;font-size:12px;letter-spacing:0.04em;color:var(--color-foreground);">${h.name}</div>` +
    `<div style="font-family:'Fraunces',serif;font-style:italic;font-size:12px;color:${HOUSE_COLOR};">${h.area}</div>` +
    `</div>`
  );
}

function dotHtml(): string {
  return `<div style="flex:none;width:32px;height:32px;border-radius:50%;background:var(--color-background);border:1.5px solid ${HOUSE_COLOR};box-shadow:0 2px 5px rgba(23,23,23,0.25);box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-size:17px;line-height:1;">&#127968;</div>`;
}

// Wide-layout marker: a dot with the label chip laid out on the house's `side`,
// positioned so the dot centers on the pin point.
function markerHtml(h: House): string {
  const chip = chipHtml(h);
  const dot = dotHtml();
  let html: string;
  if (h.side === "left") {
    html = `<div style="width:max-content;display:flex;align-items:center;gap:6px;transform:translate(calc(-100% + 16px),-16px);">${chip}${dot}</div>`;
  } else if (h.side === "right") {
    html = `<div style="width:max-content;display:flex;align-items:center;gap:6px;transform:translate(-16px,-16px);">${dot}${chip}</div>`;
  } else if (h.side === "top") {
    html = `<div style="width:max-content;display:flex;flex-direction:column;align-items:center;gap:4px;transform:translate(-50%,calc(-100% + 16px));">${chip}${dot}</div>`;
  } else {
    html = `<div style="width:max-content;display:flex;flex-direction:column;align-items:center;gap:4px;transform:translate(-50%,-16px);">${dot}${chip}</div>`;
  }
  if (h.url) {
    html = `<a href="${h.url}" target="_blank" rel="noopener noreferrer" style="display:block;text-decoration:none;cursor:pointer;">${html}</a>`;
  }
  return html;
}

/**
 * "Where We Live" Leaflet map — seven Fractal houses across NYC, ported from the
 * Claude design's `setupHousingMap()`.
 *
 * Lifecycle: the map is created once per effect run on a ref'd div and torn down
 * with `map.remove()` in cleanup, so React StrictMode's mount → unmount → mount
 * cycle never leaves a "Map container is already initialized" instance behind.
 *
 * Responsive: a ResizeObserver watches the container. When it crosses the
 * `NARROW_BREAKPOINT` the markers are rebuilt (always-on chips ⇄ dot-only +
 * tap-to-open popups) and `invalidateSize()` re-measures the map.
 *
 * Motion: Leaflet's zoom/fade/marker animations and the fitBounds animation are
 * gated on `usePrefersReducedMotion()`.
 */
export function HousingMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Guard against a double-init that somehow escaped cleanup (Leaflet stamps
    // `_leaflet_id` on an initialized container).
    if ((el as unknown as { _leaflet_id?: number })._leaflet_id) return;

    const map = L.map(el, {
      scrollWheelZoom: false,
      attributionControl: true,
      zoomControl: true,
      zoomAnimation: !reducedMotion,
      fadeAnimation: !reducedMotion,
      markerZoomAnimation: !reducedMotion,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    }).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);
    const bounds = L.latLngBounds(
      HOUSE_LOCATIONS.map((h) => [h.lat, h.lng] as [number, number]),
    );

    const renderMarkers = (narrow: boolean) => {
      markerLayer.clearLayers();
      HOUSE_LOCATIONS.forEach((h) => {
        if (narrow) {
          // Phone width: dot-only markers with tap-to-open popups.
          const marker = L.marker([h.lat, h.lng], {
            icon: L.divIcon({ className: "", html: dotHtml(), iconSize: [32, 32], iconAnchor: [16, 16] }),
          });
          const popupChip = h.url
            ? `<a href="${h.url}" target="_blank" rel="noopener noreferrer" style="display:block;text-decoration:none;">${chipHtml(h)}</a>`
            : chipHtml(h);
          marker.bindPopup(popupChip, { closeButton: false, offset: [0, -14] });
          markerLayer.addLayer(marker);
        } else {
          markerLayer.addLayer(
            L.marker([h.lat, h.lng], {
              icon: L.divIcon({ className: "", html: markerHtml(h), iconSize: [0, 0], iconAnchor: [0, 0] }),
              interactive: !!h.url,
            }),
          );
        }
      });
      map.fitBounds(bounds, { padding: [60, 60], animate: !reducedMotion });
    };

    let narrow = el.clientWidth > 0 && el.clientWidth < NARROW_BREAKPOINT;
    renderMarkers(narrow);

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
      const nextNarrow = el.clientWidth > 0 && el.clientWidth < NARROW_BREAKPOINT;
      if (nextNarrow !== narrow) {
        narrow = nextNarrow;
        renderMarkers(narrow);
      }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      map.remove();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-sm overflow-hidden bg-foreground-faint"
      style={{ height: "clamp(420px, 60vh, 640px)" }}
    />
  );
}
