"use client";

/**
 * Illustrated map of the United Kingdom with internal subdivision borders
 * and scattered community markers — Special-Bridge-style.
 *
 * Source: `gb.svg` (Simplemaps.com — free for commercial use, attribution
 * appreciated). It defines 232 administrative subdivision paths across the
 * UK with stable IDs (e.g. "GBLND", "GBDRY") and human names. ViewBox is
 * 1000×1000 covering approximately:
 *   lon ∈ [-10.48, 1.77], lat ∈ [49.16, 60.85]
 *
 * Rendering:
 *   - We fetch the SVG once, parse the <path> elements out of it, and inline
 *     them into our own <svg> so they inherit our brand styling.
 *   - The TopoJSON pipeline that backed the previous implementation has been
 *     removed — the SVG is the source of truth, which keeps the bundle
 *     small and avoids the d3-geo / topojson-client quirks we hit before.
 *   - Markers are projected into the same viewBox space using a simple
 *     linear lon/lat → x/y mapping that matches the SVG's bounds.
 *   - The fetched SVG is cached in sessionStorage so repeat loads skip the
 *     network request.
 */

import { useEffect, useMemo, useState } from "react";

const SVG_URL = "/data/gb.svg";

// Geographic bounds of the source SVG.
const LON_MIN = -10.48;
const LON_MAX = 1.77;
const LAT_MIN = 49.16;
const LAT_MAX = 60.85;
const SVG_SIZE = 1000;

function project(lon: number, lat: number): [number, number] {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * SVG_SIZE;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * SVG_SIZE;
  return [x, y];
}

type SeedMarker = { lon: number; lat: number; size: 1 | 2 | 3 };

// Real UK town / city coordinates — dots within map bounds:
// Scotland, England, Wales + additional dots
const SEED_MARKERS: ReadonlyArray<SeedMarker> = [
  // Scotland
  { lon: -3.1883, lat: 55.9533, size: 2 },  // Edinburgh
  { lon: -4.2518, lat: 55.8642, size: 3 },  // Glasgow
  // England
  { lon: -2.2426, lat: 53.4808, size: 3 },  // Manchester
  { lon: -1.8904, lat: 52.4862, size: 3 },  // Birmingham
  { lon: -0.3,    lat: 51.5074, size: 3 },  // London
  { lon: -2.8,    lat: 53.4,    size: 2 },  // Liverpool
  // Wales
  { lon: -3.1791, lat: 51.4816, size: 3 },  // Cardiff
  { lon: -3.9436, lat: 51.5883, size: 2 },  // Swansea
  { lon: -3.2,    lat: 53.0,    size: 2 },  // North Wales
];

const SIZE_RADIUS: Record<1 | 2 | 3, number> = {
  1: 7,
  2: 11,
  3: 16,
};

function jitter(seed: string, salt: string, magnitude: number): number {
  let h = 2166136261;
  const s = `${seed}:${salt}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000 - 0.5 * magnitude;
}

const CACHE_KEY = "ukmap:gb-svg";

function readSvgCache(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(CACHE_KEY);
  } catch {
    return null;
  }
}

function writeSvgCache(svg: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CACHE_KEY, svg);
  } catch {
    /* sessionStorage may be full or disabled */
  }
}

async function fetchSvg(): Promise<string> {
  const cached = readSvgCache();
  if (cached) return cached;
  const res = await fetch(SVG_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${SVG_URL}`);
  const text = await res.text();
  writeSvgCache(text);
  return text;
}

type ParsedPath = {
  d: string;
  id: string | null;
  name: string | null;
};

/**
 * Extract <path> elements from the source SVG. We only keep d, id, and
 * name attributes; we discard any styling from the source so our own
 * brand palette is in charge.
 */
function parseSvgPaths(svgText: string): ParsedPath[] {
  if (typeof DOMParser === "undefined") return [];
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const nodes = doc.querySelectorAll("path");
  const out: ParsedPath[] = [];
  nodes.forEach((node) => {
    const d = node.getAttribute("d");
    if (!d) return;
    out.push({
      d,
      id: node.getAttribute("id"),
      name: node.getAttribute("name"),
    });
  });
  return out;
}

function runIdle(cb: () => void, timeout = 250) {
  if (typeof window === "undefined") return;
  type IdleWindow = Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  const w = window as IdleWindow;
  if (typeof w.requestIdleCallback === "function") {
    w.requestIdleCallback(cb, { timeout });
  } else {
    setTimeout(cb, 16);
  }
}

export function UKMap() {
  // First paint: country silhouettes + borders only.
  const [paths, setPaths] = useState<ParsedPath[] | null>(null);
  // Second paint (idle): markers.
  const [showMarkers, setShowMarkers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const svg = await fetchSvg();
        const parsed = parseSvgPaths(svg);
        if (!cancelled) {
          setPaths(parsed);
          runIdle(() => {
            if (!cancelled) setShowMarkers(true);
          });
        }
      } catch (err: unknown) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markers = useMemo(() => {
    if (!showMarkers) return null;
    // Tighten the visible bounds to the area where the simplemaps UK paths
    // actually draw within the cropped viewBox (135 30 750 950). Padding
    // keeps dots from sitting right on the coast.
    const PAD = 28;
    const MIN_X = 135 + PAD;
    const MAX_X = 885 - PAD;
    const MIN_Y = 30 + PAD;
    const MAX_Y = 950 - PAD;
    return SEED_MARKERS.map((m, i) => {
      const r = SIZE_RADIUS[m.size];
      const jLon = jitter(`${i}`, "lon", 0.3);
      const jLat = jitter(`${i}`, "lat", 0.25);
      const delay = jitter(`${i}`, "delay", 2.6) + 1.3;
      const [cx, cy] = project(m.lon + jLon, m.lat + jLat);
      return {
        i,
        cx,
        cy,
        r,
        delay,
        visible: cx > MIN_X && cx < MAX_X && cy > MIN_Y && cy < MAX_Y,
      };
    });
  }, [showMarkers]);

  const mapInner = (
    <div className="uk-map-frame">
      <div
        className="uk-map"
        role="img"
        aria-label="Illustrated map of the United Kingdom with scattered community markers"
      >
        {!paths && !error ? (
          <div className="uk-map--loading" aria-label="Loading UK map">
            <div className="uk-map__loading-pulse" />
          </div>
        ) : null}
        {error ? (
          <p className="uk-map__error">Unable to load map: {error}</p>
        ) : null}
        {paths ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            // Crop the simplemaps viewBox to the area where the UK paths
            // actually draw, so the map fills the stage and dots align
            // with real landmass positions instead of empty whitespace.
            viewBox="135 30 750 950"
            preserveAspectRatio="xMidYMid meet"
          >
            <g className="uk-map__country">
              {paths.map((p, i) => (
                <path
                  key={p.id ?? `p-${i}`}
                  d={p.d}
                  fill="#dcebe5"
                  stroke="var(--brand)"
                  strokeWidth={0.6}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                >
                  {p.name ? <title>{p.name}</title> : null}
                </path>
              ))}
            </g>

            {markers && (
              <g className="uk-map__markers">
                {markers.map((m) =>
                  m.visible ? (
                    <g
                      key={`m-${m.i}`}
                      className="uk-map__marker"
                      style={{ animationDelay: `${m.delay}s` }}
                    >
                      <circle
                        className="uk-map__halo"
                        cx={m.cx}
                        cy={m.cy}
                        r={m.r * 1.0}
                        fill="var(--brand)"
                        opacity={0.22}
                      />
                      <circle
                        className="uk-map__dot"
                        cx={m.cx}
                        cy={m.cy}
                        r={m.r * 0.5}
                        fill="var(--brand)"
                        stroke="white"
                        strokeWidth={1.5}
                        vectorEffect="non-scaling-stroke"
                      />
                      <text
                        x={m.cx}
                        y={m.cy}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="6"
                        fontWeight="bold"
                        fontFamily="Verdana, sans-serif"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      />

                    </g>
                  ) : null,
                )}
              </g>
            )}
          </svg>
        ) : null}
      </div>
    </div>
  );

  return <div className="uk-map-stage">{mapInner}</div>;
}