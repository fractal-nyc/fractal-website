import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * HousingMap — the "Where We Live" Leaflet map on the Co-Living page.
 *
 * Seven Fractal houses on a CARTO Voyager basemap, each rendered as a divIcon:
 * a 🏠 dot pinned on the coordinate plus a name/area "chip" that sits on the
 * side of the dot the house declares (`side`), hand-tuned so the chips don't
 * collide at desktop width.
 *
 * Below `NARROW_PX` of *container* width the chips can't help but overlap, so
 * the map degrades to dot-only markers with tap-to-open popups. The threshold
 * is measured on the container (not the viewport) via ResizeObserver, so the
 * fallback is correct no matter what the map is nested inside.
 *
 * Lifecycle: the map is created in a mount effect and torn down with
 * `map.remove()` on unmount — which also clears Leaflet's `_leaflet_id` on the
 * container, so React StrictMode's double-invoke re-creates cleanly instead of
 * throwing "Map container is already initialized".
 *
 * Marker markup is real DOM inside the page, so it can use the site's Tailwind
 * utilities and token-backed colors directly — no raw hex needed. (Class names
 * are written as whole literal strings so the Tailwind scanner sees them.)
 */

/** Container width, in px, below which chips are dropped for tap-to-open popups. */
const NARROW_PX = 500;

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** Which side of the pin the label chip sits on. */
type ChipSide = "left" | "right" | "top" | "bottom";

interface HousingHouse {
  name: string;
  area: string;
  lat: number;
  lng: number;
  side: ChipSide;
  url?: string;
}

const HOUSES_ON_MAP: HousingHouse[] = [
  {
    name: "Homebrew",
    area: "Chinatown",
    lat: 40.7158,
    lng: -73.997,
    side: "top",
    url: "https://homebrew.nyc/",
  },
  { name: "Canopy", area: "FiDi", lat: 40.7075, lng: -74.0113, side: "bottom" },
  {
    name: "Baby Haus",
    area: "Williamsburg",
    lat: 40.7118,
    lng: -73.944,
    side: "top",
  },
  {
    name: "The McKibbin Lofts",
    area: "East Williamsburg",
    lat: 40.706,
    lng: -73.9337,
    side: "right",
  },
  {
    name: "Bebop",
    area: "Fort Greene",
    lat: 40.6893,
    lng: -73.974,
    side: "right",
    url: "https://youtu.be/e79kOV_Qgvw?si=R1_J8vlXz46zlJYh",
  },
  {
    name: "Bergen House",
    area: "Boerum Hill",
    lat: 40.6845,
    lng: -73.984,
    side: "left",
  },
  {
    name: "Lofi House",
    area: "Park Slope",
    lat: 40.672,
    lng: -73.98,
    side: "bottom",
  },
];

const CHIP_HTML = (h: HousingHouse) =>
  '<div class="whitespace-nowrap rounded-xl border-[1.5px] border-house-coliving-deep bg-background px-3 py-1 text-center shadow-[0_3px_0_rgba(23,23,23,0.15)]">' +
  `<div class="font-mono text-xs font-medium tracking-[0.04em] text-foreground">${h.name}</div>` +
  `<div class="font-serif italic normal-case text-xs text-house-coliving-deep">${h.area}</div>` +
  "</div>";

const DOT_HTML =
  '<div class="flex h-8 w-8 flex-none items-center justify-center rounded-full border-[1.5px] border-house-coliving-deep bg-background text-lg leading-none shadow-[0_2px_5px_rgba(23,23,23,0.25)]">🏠</div>';

/** Wrapper that places the chip on the requested side, with the dot centered on the pin point. */
function markerHtml(h: HousingHouse): string {
  const chip = CHIP_HTML(h);
  let inner: string;
  switch (h.side) {
    case "left":
      inner =
        '<div class="flex w-max items-center gap-1.5" style="transform:translate(calc(-100% + 16px),-16px)">' +
        chip +
        DOT_HTML +
        "</div>";
      break;
    case "right":
      inner =
        '<div class="flex w-max items-center gap-1.5" style="transform:translate(-16px,-16px)">' +
        DOT_HTML +
        chip +
        "</div>";
      break;
    case "top":
      inner =
        '<div class="flex w-max flex-col items-center gap-1" style="transform:translate(-50%,calc(-100% + 16px))">' +
        chip +
        DOT_HTML +
        "</div>";
      break;
    default:
      inner =
        '<div class="flex w-max flex-col items-center gap-1" style="transform:translate(-50%,-16px)">' +
        DOT_HTML +
        chip +
        "</div>";
  }
  return h.url ? linkWrap(h.url, inner) : inner;
}

function linkWrap(url: string, inner: string): string {
  return (
    `<a href="${url}" target="_blank" rel="noopener noreferrer" class="block cursor-pointer no-underline">` +
    inner +
    "</a>"
  );
}

export function HousingMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [narrow, setNarrow] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // ---- Map lifecycle: create on mount, `map.remove()` on unmount ----------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const instance = L.map(el, {
      scrollWheelZoom: false,
      attributionControl: true,
      zoomControl: true,
      // Every animation gated on reduced motion (house rule).
      zoomAnimation: !prefersReducedMotion,
      fadeAnimation: !prefersReducedMotion,
      markerZoomAnimation: !prefersReducedMotion,
    });
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(
      instance,
    );

    setNarrow(el.clientWidth < NARROW_PX);
    setMap(instance);

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(([entry]) => {
        setNarrow(entry.contentRect.width < NARROW_PX);
        instance.invalidateSize();
      });
      ro.observe(el);
    }

    return () => {
      ro?.disconnect();
      // Clears Leaflet's `_leaflet_id` on the container so a StrictMode
      // re-mount (or a route re-entry) can initialize it again.
      instance.remove();
      setMap(null);
    };
  }, [prefersReducedMotion]);

  // ---- Markers: rebuilt whenever the chip/dot mode flips ------------------
  useEffect(() => {
    if (!map) return;
    const layer = L.layerGroup().addTo(map);
    const bounds: [number, number][] = [];

    for (const h of HOUSES_ON_MAP) {
      if (narrow) {
        // Phone width: dot-only marker, chip moves into a tap-to-open popup.
        const marker = L.marker([h.lat, h.lng], {
          icon: L.divIcon({
            className: "",
            html: DOT_HTML,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
          title: `${h.name} — ${h.area}`,
        });
        const chip = CHIP_HTML(h);
        marker.bindPopup(h.url ? linkWrap(h.url, chip) : chip, {
          closeButton: false,
          offset: [0, -14],
        });
        layer.addLayer(marker);
      } else {
        layer.addLayer(
          L.marker([h.lat, h.lng], {
            icon: L.divIcon({
              className: "",
              html: markerHtml(h),
              iconSize: [0, 0],
              iconAnchor: [0, 0],
            }),
            // Only the two houses with a URL need to swallow clicks; the rest
            // stay transparent so the map can be dragged through them.
            interactive: Boolean(h.url),
            title: `${h.name} — ${h.area}`,
          }),
        );
      }
      bounds.push([h.lat, h.lng]);
    }

    map.fitBounds(bounds, { padding: [60, 60], animate: false });

    return () => {
      layer.remove();
    };
  }, [map, narrow]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Map of Fractal co-living houses across New York City"
      className="h-[clamp(420px,60vh,640px)] w-full overflow-hidden rounded bg-foreground/5"
    />
  );
}
