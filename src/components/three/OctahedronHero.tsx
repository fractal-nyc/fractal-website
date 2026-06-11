import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { HOUSES } from "@/data/houses";

// FRAC-24: House color helper — derives from canonical palette pair in
// HOUSES instead of literal hex. Falls back to magenta to surface a missing
// house id loudly in dev.
const housePalette = (id: string, prefer: "light" | "deep" = "light"): string => {
  const palette = HOUSES.find((h) => h.id === id)?.palette;
  return palette ? palette[prefer] : "#ff00ff";
};

// ---------------------------------------------------------------------------
// FRAC-124: Tap-vs-drag discriminator
// ---------------------------------------------------------------------------
// Rationale: FRAC-79 introduced enlarged invisible hit meshes that wrap the
// center octahedron (r=1.15) and each nav node (r=0.3). Those meshes carried
// `onClick` handlers. R3F v9 auto-calls `setPointerCapture` on the canvas DOM
// element on `pointerdown` whenever a ray hit lands on a mesh with pointer
// handlers. On iOS Safari, a captured pointer cancels the pending
// `touch-action: pan-y` scroll for that finger — so vertical swipes over the
// hero area stop scrolling the page (regression of FRAC-109).
//
// Fix: replace `onClick` with `onPointerDown`/`onPointerUp` and only fire the
// tap callback if the pointer moved less than TAP_MOVE_PX and the press took
// less than TAP_MAX_MS. On pointerdown we do NOT stopPropagation or call
// setPointerCapture, so the browser's native scroll starts normally. If the
// user actually drags (scrolls), pointerup arrives far from pointerdown and
// the tap is ignored. If they genuinely tap, the callback fires.

export const TAP_MOVE_PX = 10;
export const TAP_MAX_MS = 350;

// ---------------------------------------------------------------------------
// FRAC-9 / FRAC-28: prefers-reduced-motion is sourced from the shared hook at
// src/hooks/usePrefersReducedMotion.ts. All motion sites in this file
// (auto-rotation, edge-text scroll, center scale-breathing, node scale-pulse,
// node emissive-glow) consult that hook and freeze when the user has opted
// out of non-essential motion.
// ---------------------------------------------------------------------------

export interface TapState {
  x: number;
  y: number;
  t: number;
}

/**
 * Pure classifier: given a pointer-down position/time and a pointer-up
 * position/time, decide whether the gesture was a tap (small movement, short
 * duration) rather than a swipe. Exported for unit tests.
 */
export function isTap(down: TapState, upX: number, upY: number, upT: number): boolean {
  const dx = upX - down.x;
  const dy = upY - down.y;
  const dt = upT - down.t;
  return Math.hypot(dx, dy) < TAP_MOVE_PX && dt < TAP_MAX_MS;
}

/**
 * React hook: returns onPointerDown/onPointerUp handlers for an R3F mesh
 * that fire `onTap` only when the gesture is a tap rather than a swipe.
 *
 * Critically, onPointerDown does NOT stopPropagation and does NOT call
 * setPointerCapture — so iOS Safari's native `touch-action: pan-y` scroll
 * starts immediately when a finger presses the canvas. Only on a confirmed
 * tap at pointerup do we stopPropagation and fire the callback.
 */
export function useTapHandlers(onTap: () => void) {
  const downRef = useRef<TapState | null>(null);
  return {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      downRef.current = {
        x: e.nativeEvent.clientX,
        y: e.nativeEvent.clientY,
        t: performance.now(),
      };
      // Do NOT stopPropagation / setPointerCapture — let native scroll start.
    },
    onPointerUp: (e: ThreeEvent<PointerEvent>) => {
      const d = downRef.current;
      downRef.current = null;
      if (!d) return;
      if (isTap(d, e.nativeEvent.clientX, e.nativeEvent.clientY, performance.now())) {
        e.stopPropagation();
        onTap();
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Nav node definitions — 6 nodes on octahedron vertices
// ---------------------------------------------------------------------------
// FRAC-5 / FRAC-161 / FRAC-36 / FRAC-47: Political Club is hidden from the
// navbar (FRAC-32) and its banner grid card stays hidden (FRAC-161). On the
// hero octahedron, vertex 4 was previously the FRAC-36 "Coming Soon"
// placeholder for Political Club. FRAC-47 converts that slot to a Story
// node — fully active, navigable to /story, in the Story brand color
// #D4BA58 (matches Navbar.tsx Story link + StoryPage STORY_COLOR). The
// geometry still reads as complete (6 vertices, 6 nodes); Political Club
// remains hidden from the navbar.

// FRAC-181: OUTER_NAV_NODES + NavNode moved to heroNavNodes.ts (three-free)
// so Hero.tsx can import them without dragging the three.js chunk onto the
// entry chunk. Re-exported here for back-compat with anything still
// importing from this module. The internal rendering loop near the bottom
// of this file imports them below.
export { OUTER_NAV_NODES, type NavNode } from "./heroNavNodes";
import { OUTER_NAV_NODES, type NavNode } from "./heroNavNodes";

// ---------------------------------------------------------------------------
// Octahedron vertex generation
// ---------------------------------------------------------------------------

function makeOctahedronVertices(size: number): THREE.Vector3[] {
  return [
    new THREE.Vector3( size,  0,     0),    // 0: +X
    new THREE.Vector3(-size,  0,     0),    // 1: -X
    new THREE.Vector3( 0,     size,  0),    // 2: +Y (top)
    new THREE.Vector3( 0,    -size,  0),    // 3: -Y (bottom)
    new THREE.Vector3( 0,     0,     size), // 4: +Z
    new THREE.Vector3( 0,     0,    -size), // 5: -Z
  ];
}

// Octahedron edges — 12 edges
const OCTA_EDGES: [number, number][] = [
  [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 4], [2, 5], [3, 4], [3, 5],
];

// ---------------------------------------------------------------------------
// Connection lines between nested octahedra
// ---------------------------------------------------------------------------

function NestedOctaLines({
  outerVerts,
  innerVerts,
}: {
  outerVerts: THREE.Vector3[];
  innerVerts: THREE.Vector3[];
}) {
  const geometry = useMemo(() => {
    const positions: number[] = [];

    for (const ov of outerVerts) {
      for (const iv of innerVerts) {
        positions.push(ov.x, ov.y, ov.z);
        positions.push(iv.x, iv.y, iv.z);
      }
    }

    for (let i = 0; i < outerVerts.length; i += 2) {
      positions.push(outerVerts[i].x, outerVerts[i].y, outerVerts[i].z);
      positions.push(outerVerts[i + 1].x, outerVerts[i + 1].y, outerVerts[i + 1].z);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [outerVerts, innerVerts]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#c4a265" transparent opacity={0.25} />
    </lineSegments>
  );
}

// Edge lines for an octahedron
function OctaEdgeLines({
  verts,
  color,
  opacity,
}: {
  verts: THREE.Vector3[];
  color: string;
  opacity: number;
}) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    for (const [i, j] of OCTA_EDGES) {
      positions.push(verts[i].x, verts[i].y, verts[i].z);
      positions.push(verts[j].x, verts[j].y, verts[j].z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [verts]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineSegments>
  );
}

// ---------------------------------------------------------------------------
// Animated text streaming along edges (canvas texture on tubes)
// ---------------------------------------------------------------------------

const EDGE_TEXT = " THE PROTOCOL · THE PROTOCOL · THE PROTOCOL · THE PROTOCOL · ";

function useScrollingTextTexture(color: string) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;

    // Draw repeating text — bold for legibility on thin tubes
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 28px 'JetBrains Mono', monospace";
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";

    // Fill the canvas width with repeating text
    let x = 0;
    while (x < canvas.width * 2) {
      ctx.fillText(EDGE_TEXT, x, canvas.height / 2);
      x += ctx.measureText(EDGE_TEXT).width;
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(1, 1);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 4;

    canvasRef.current = canvas;
    textureRef.current = tex;
    return tex;
  }, [color]);

  // Animate the texture offset to scroll. FRAC-28: when the user prefers
  // reduced motion, freeze the offset so the "THE PROTOCOL" text along the
  // edges stays still.
  useFrame((_, delta) => {
    if (prefersReducedMotion) return;
    if (textureRef.current) {
      textureRef.current.offset.x -= delta * 0.15;
    }
  });

  return texture;
}

function StreamingEdge({
  start,
  end,
  texture,
  opacity,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  texture: THREE.Texture;
  opacity: number;
}) {
  const tubeGeo = useMemo(() => {
    const curve = new THREE.LineCurve3(start, end);
    return new THREE.TubeGeometry(curve, 1, 0.028, 6, false);
  }, [start, end]);

  return (
    <mesh geometry={tubeGeo}>
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function StreamingEdgeSet({
  verts,
  color,
  opacity,
}: {
  verts: THREE.Vector3[];
  color: string;
  opacity: number;
}) {
  const texture = useScrollingTextTexture(color);

  return (
    <>
      {OCTA_EDGES.map(([i, j], idx) => (
        <StreamingEdge
          key={idx}
          start={verts[i]}
          end={verts[j]}
          texture={texture}
          opacity={opacity}
        />
      ))}
    </>
  );
}

// Streaming text along cross-connections between two octahedra
function StreamingCrossConnections({
  outerVerts,
  innerVerts,
  color,
  opacity,
}: {
  outerVerts: THREE.Vector3[];
  innerVerts: THREE.Vector3[];
  color: string;
  opacity: number;
}) {
  const texture = useScrollingTextTexture(color);

  // Every outer vertex to every inner vertex + axis diagonals
  const pairs = useMemo(() => {
    const p: [THREE.Vector3, THREE.Vector3][] = [];
    for (const ov of outerVerts) {
      for (const iv of innerVerts) {
        p.push([ov, iv]);
      }
    }
    // Opposite vertex diagonals
    for (let i = 0; i < outerVerts.length; i += 2) {
      p.push([outerVerts[i], outerVerts[i + 1]]);
    }
    return p;
  }, [outerVerts, innerVerts]);

  return (
    <>
      {pairs.map(([a, b], idx) => (
        <StreamingEdge key={idx} start={a} end={b} texture={texture} opacity={opacity} />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Clickable center octahedron → /the-protocol
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Per-face section definitions for the center octahedron
// ---------------------------------------------------------------------------

// Banner images — per visible section.
// FRAC-20: `forum` (Political Club) banner restored. Earlier (FRAC-5) it was
// skipped because the section was hidden from nav; user later confirmed the
// face should still show its photo. Geometry stays intact (8 triangular faces).
//
// FRAC-192: these 8 paths are ALSO preloaded as <link rel="preload" as="image">
// in index.html <head>, AND six of them are rendered by the house-page banner
// (src/components/house/HouseBanner.tsx BANNER_IMAGES). Keep all three lists
// in sync — if you add/remove/rename a banner here, update the index.html
// preload tags and HouseBanner.tsx too. All consumers must stay CORS-mode
// (TextureLoader is anonymous by default; HouseBanner's <img> sets
// crossOrigin) so the single CORS preload serves every route (FRAC-193/195).
const FACE_BANNER_IMAGES: Record<string, string> = {
  story:        "/images/banners/story.webp",
  campus:       "/images/banners/campus.webp",
  neighborhood: "/images/banners/neighborhood.webp",
  events:       "/images/banners/events.webp",
  school:       "/images/banners/new-liberal-arts.webp",
  forum:        "/images/banners/political-club.webp",
  lab:          "/images/banners/lab.webp",
  people:       "/images/banners/people.webp",
};

// Section colors. House-backed faces derive from canonical palette pairs
// (FRAC-24). `story` and `people` are not Houses and keep literal hexes.
// `forum` is intentionally desaturated (muted grey-tan) to read as
// de-emphasized — it has no nav node and no banner texture, so the literal
// is kept as a deliberate stylistic exception rather than a palette identity.
const FACE_SECTION_COLORS: Record<string, string> = {
  story:        "#D4BA58",
  campus:       housePalette("campus"),
  neighborhood: housePalette("neighborhood"),
  events:       housePalette("events"),
  school:       housePalette("school"),
  forum:        "#8a7a6a",
  lab:          housePalette("lab"),
  people:       "#C49040",
};

// Map octahedron face index → section key (8 faces, 8 unique sections)
// Octahedron faces (detail=0) are ordered by the geometry's index buffer.
// Face indices 0-7 correspond to the 8 triangular faces.
const FACE_SECTION_MAP: (string | null)[] = [
  "campus",        // face 0
  "events",        // face 1
  "lab",           // face 2
  "school",        // face 3
  "neighborhood",  // face 4
  "people",        // face 5
  "forum",         // face 6
  "story",         // face 7
];

/**
 * Build an OctahedronBufferGeometry with per-face material groups and UVs.
 * Each of the 8 faces gets its own material group so we can assign
 * different materials (textured or solid color) to each.
 */
function usePerFaceOctahedronGeometry(radius: number) {
  const geometry = useMemo(() => {
    const base = new THREE.OctahedronGeometry(radius, 0);

    // Ensure non-indexed so each face has its own vertices.
    // (Newer THREE versions return non-indexed OctahedronGeometry at detail=0,
    // so toNonIndexed() would warn — guard against that.)
    const nonIndexed = base.index !== null ? base.toNonIndexed() : base;
    if (nonIndexed !== base) base.dispose();

    const posAttr = nonIndexed.getAttribute("position");
    const vertexCount = posAttr.count; // 24 vertices (8 faces * 3)
    const faceCount = vertexCount / 3; // 8

    // Assign material groups: each face (3 vertices) gets its own group
    nonIndexed.clearGroups();
    for (let i = 0; i < faceCount; i++) {
      nonIndexed.addGroup(i * 3, 3, i);
    }

    // Compute UVs for each face — map each triangle so that the POLE vertex
    // (±Y, |y| ≈ radius) receives UV (0.5, 1.0) ("top of photo"), and the two
    // equator vertices (y ≈ 0) receive (0, 0) and (1, 0). This makes every
    // photo's top edge point AWAY from the equator: upper-half faces point up
    // toward +Y; lower-half faces point down toward -Y. See FRAC-66.
    const uvs = new Float32Array(vertexCount * 2);
    for (let f = 0; f < faceCount; f++) {
      const base2 = f * 3 * 2;
      // Identify the pole vertex of this triangle: the one with |y| > 0.5
      // (the pole is at y = ±radius; equator verts have y = 0).
      const ys: [number, number, number] = [
        posAttr.getY(3 * f),
        posAttr.getY(3 * f + 1),
        posAttr.getY(3 * f + 2),
      ];
      const poleIdx = ys.findIndex((y) => Math.abs(y) > 0.5);
      // The two equator vertex slots (deterministic order: lower index first).
      const equatorVerts = [0, 1, 2].filter((i) => i !== poleIdx);
      const uvForTri: Array<[number, number]> = [
        [0, 0],
        [0, 0],
        [0, 0],
      ];
      uvForTri[poleIdx] = [0.5, 1.0];
      uvForTri[equatorVerts[0]] = [0.0, 0.0];
      uvForTri[equatorVerts[1]] = [1.0, 0.0];
      for (let v = 0; v < 3; v++) {
        uvs[base2 + v * 2] = uvForTri[v][0];
        uvs[base2 + v * 2 + 1] = uvForTri[v][1];
      }
    }
    nonIndexed.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    return nonIndexed;
  }, [radius]);

  // GPU leak guard: dispose the buffer geometry when the component unmounts
  // (or radius changes). The "no leaks across route changes" criterion
  // (FRAC-192) covered materials/textures but not these geometries — and the
  // two-shell design doubled the geometry count (FRAC-195 review fix).
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return geometry;
}

/**
 * FRAC-192: opacity fade-in for banner textures.
 *
 * The center octahedron is drawn as TWO concentric meshes:
 *   1. A solid-color placeholder shell (opaque, all 8 faces, always visible
 *      from frame 0). This is the graceful state: a face whose texture hasn't
 *      arrived (or permanently failed) shows its FACE_SECTION_COLORS color.
 *   2. A slightly-larger textured shell whose 8 face materials are
 *      `transparent` and ramp opacity 0→1 when their banner texture arrives,
 *      cross-dissolving the photo in over the solid backdrop instead of a hard
 *      color→photo cut.
 *
 * Returned to the component:
 *   - `placeholderMaterials`: 8 opaque solid-color materials (stable refs).
 *   - `texturedMaterials`: 8 materials for the textured shell. A face with no
 *     texture yet gets a transparent, non-drawing material (opacity 0,
 *     colorWrite off) so the backdrop shows through; once its texture loads it
 *     is swapped for a textured material that fades in.
 *   - `fadeRefs`: the live array the component's useFrame lerps. Each textured
 *     material is created exactly ONCE (in the loader callback, stashed in a
 *     ref) so an in-flight tween is never reset by a re-render — the old code's
 *     useMemo rebuilt all 8 materials on every texture arrival, which would
 *     restart any opacity already ramping on the other faces.
 *
 * Preserves FRAC-35 (sRGB), FRAC-41 (plain texture, no overlay/tint),
 * FRAC-127 (no Suspense — async load, solid faces render in frame 0).
 */
type TexturedFace = {
  /** Live material on the textured shell for this face slot. */
  mat: THREE.MeshBasicMaterial;
  /** Has the banner texture arrived for this face? (drives the fade). */
  hasTexture: boolean;
};

function usePerFaceMaterials() {
  const [, forceRender] = useState(0);

  // Stable solid-color placeholder shell materials (created once). Each face
  // slot maps through FACE_SECTION_MAP to its section color.
  const placeholderMaterials = useMemo(
    () =>
      FACE_SECTION_MAP.map((sectionKey) => {
        const color = sectionKey
          ? FACE_SECTION_COLORS[sectionKey] ?? "#c4a265"
          : "#c4a265";
        return new THREE.MeshBasicMaterial({ color, side: THREE.FrontSide });
      }),
    [],
  );

  // Textured shell: one live material per face slot. Starts as a transparent,
  // non-drawing material; upgraded in place (slot swapped) when the texture
  // loads. Held in a ref so re-renders never recreate an in-flight material.
  const texturedFacesRef = useRef<TexturedFace[] | null>(null);
  if (texturedFacesRef.current === null) {
    texturedFacesRef.current = FACE_SECTION_MAP.map(() => {
      // Transparent placeholder for the textured shell — draws nothing so the
      // solid backdrop shows through until (and unless) a texture arrives.
      const mat = new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      mat.colorWrite = false; // never paints while empty
      return { mat, hasTexture: false };
    });
  }

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    const faces = texturedFacesRef.current!;
    // Track materials we create so we can dispose them on unmount (GPU leak
    // guard across route changes — Hero unmounts on navigation, FRAC-192).
    const created: THREE.MeshBasicMaterial[] = [];

    // Load each banner independently — a slow one shouldn't hold back faster
    // ones. Each resolution swaps the corresponding face's textured-shell
    // material to a fading textured material and forces a re-render.
    for (const [key, path] of Object.entries(FACE_BANNER_IMAGES)) {
      loader
        .loadAsync(path)
        .then((tex) => {
          if (cancelled) {
            tex.dispose();
            return;
          }
          // FRAC-35: tag as sRGB so the renderer doesn't apply a linear→sRGB
          // shift that brightens JPEGs. Three.js r152+ defaults color textures
          // to NoColorSpace (linear); without this flag the color data gets
          // double-gamma-corrected on output, washing the photos out.
          tex.colorSpace = THREE.SRGBColorSpace;

          // FRAC-41: plain texture rendering — no overlay/tint material.
          // transparent + opacity 0 so the useFrame lerp can dissolve it in
          // over the solid backdrop.
          const texturedMat = new THREE.MeshBasicMaterial({
            map: tex,
            side: THREE.FrontSide,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          });
          created.push(texturedMat);

          // Swap this material into every face slot mapped to this section.
          for (let i = 0; i < FACE_SECTION_MAP.length; i++) {
            if (FACE_SECTION_MAP[i] === key) {
              const prev = faces[i].mat;
              faces[i] = { mat: texturedMat, hasTexture: true };
              prev.dispose();
            }
          }
          forceRender((n) => n + 1);
        })
        .catch((err) => {
          // Swallow individual texture failures — the face stays in its
          // solid-color placeholder state (the textured slot keeps drawing
          // nothing), which is a graceful degradation.
          // eslint-disable-next-line no-console
          console.warn(`[OctahedronHero] Failed to load banner ${path}:`, err);
        });
    }

    return () => {
      cancelled = true;
      // Dispose textured materials + their textures, and the transparent
      // placeholders, to avoid GPU leaks when Hero unmounts on navigation.
      for (const mat of created) {
        mat.map?.dispose();
        mat.dispose();
      }
      for (const face of texturedFacesRef.current ?? []) {
        face.mat.map?.dispose();
        face.mat.dispose();
      }
      // Also dispose the 8 solid placeholder-shell materials — they were the
      // gap in the original FRAC-192 cleanup ("no leaks" criterion). Their
      // identity is stable (useMemo with [] deps), so referencing them from
      // this []-dep effect is safe (FRAC-195 review fix).
      for (const mat of placeholderMaterials) {
        mat.dispose();
      }
    };
  }, []);

  return {
    placeholderMaterials,
    texturedFaces: texturedFacesRef.current,
  };
}

// Opacity-ramp speed: opacity += (1 - opacity) * min(1, delta * FADE_K).
// k≈9 gives a ~300 ms dissolve feel.
const FADE_K = 9;

// Center-group scale: resting / hover-breathing targets. The whole group
// (both visible shells AND the invisible hit target) scales together via
// groupRef, so the hit-target geometry compensates with 1/CENTER_REST_SCALE
// below — keep these as the single source for both. (FRAC-195 review fix.)
const CENTER_REST_SCALE = 0.9;
const CENTER_HOVER_SCALE = 0.95;

function CenterOctahedron({
  onNavigate,
}: {
  onNavigate: (route: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const geometry = usePerFaceOctahedronGeometry(1);
  // Textured shell sits at a marginally larger radius (1.001) than the solid
  // backdrop (1.0) so it occludes cleanly without z-fighting (FRAC-192).
  const texturedGeometry = usePerFaceOctahedronGeometry(1.001);
  const { placeholderMaterials, texturedFaces } = usePerFaceMaterials();
  const prefersReducedMotion = usePrefersReducedMotion();

  const placeholderMatArray = placeholderMaterials;
  // Re-derived every render (cheap 8-element map). NOT memoized: the
  // texturedFaces ref array has a stable identity and its slots are swapped
  // imperatively when a texture arrives, so a memo keyed on its identity would
  // return a stale array. usePerFaceMaterials forces a re-render on each
  // texture arrival, and this fresh map picks up the new material.
  const texturedMatArray = texturedFaces.map((f) => f.mat);

  // FRAC-192: drive the per-face opacity dissolve. For each face whose texture
  // has arrived, lerp its material opacity toward 1; settle to exactly 1 and
  // drop the alpha-blend cost once it's effectively opaque. FRAC-28: reduced
  // motion → snap to fully-shown instantly (no animation).
  useFrame((_, delta) => {
    for (const face of texturedFaces) {
      if (!face.hasTexture) continue;
      const mat = face.mat;
      if (mat.opacity >= 1) continue;

      if (prefersReducedMotion) {
        mat.opacity = 1;
      } else {
        mat.opacity += (1 - mat.opacity) * Math.min(1, delta * FADE_K);
      }

      if (mat.opacity >= 0.999) {
        mat.opacity = 1;
        // Fully opaque now: stop alpha-blending and re-enable depth writes so
        // the shell behaves like a normal opaque surface.
        mat.transparent = false;
        mat.depthWrite = true;
        mat.needsUpdate = true;
      }
    }
  });

  // FRAC-28: when reduced motion is requested, lock the center octahedron at
  // its neutral resting scale (0.9). The hover scale-up is purely decorative
  // breathing — skipping it keeps the surface still without affecting layout.
  useFrame(() => {
    if (!groupRef.current) return;
    if (prefersReducedMotion) {
      groupRef.current.scale.setScalar(CENTER_REST_SCALE);
      return;
    }
    const target = hovered ? CENTER_HOVER_SCALE : CENTER_REST_SCALE;
    const s = groupRef.current.scale.x;
    groupRef.current.scale.setScalar(s + (target - s) * 0.1);
  });

  // FRAC-124: Use tap-vs-drag discriminator instead of onClick so vertical
  // swipes over the hero pass through to the page scroll.
  const tapHandlers = useTapHandlers(() => {
    onNavigate("/the-protocol");
  });

  return (
    <group ref={groupRef}>
      {/* FRAC-192: solid-color placeholder shell (opaque, radius 1) — always
          visible from frame 0. A face whose banner texture hasn't arrived (or
          permanently failed) shows its section color here. */}
      <mesh geometry={geometry} material={placeholderMatArray}>
        {hovered && (
          <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
            <div style={tooltipStyle("hsl(var(--foreground))")}>The Protocol</div>
          </Html>
        )}
      </mesh>
      {/* FRAC-192: textured shell (radius 1.001, marginally larger to avoid
          z-fighting). Each face's material is transparent and fades opacity
          0→1 as its banner texture arrives, cross-dissolving the photo in over
          the solid backdrop instead of a hard color→photo cut. */}
      <mesh geometry={texturedGeometry} material={texturedMatArray} />
      {/* Invisible hit target — uses an octahedron geometry that matches the
          visible model shape (FRAC-144 fix). Previously this was a sphere of
          radius 1.15 (FRAC-79's enlargement) which extended well beyond the
          visible octahedron and intercepted taps that should have hit the
          surrounding nav nodes.
          Radius compensation (FRAC-195): this mesh lives inside the scaled
          group, so a radius-1 geometry would shrink to an effective 0.9 at
          rest — a ~19% tap-area loss vs the pre-FRAC-192 layout where the hit
          mesh sat unscaled at radius 1.0. Dividing by CENTER_REST_SCALE
          restores the same effective world-space tap radius (1.0 at rest,
          ~1.06 during the decorative hover scale-up). */}
      <mesh
        {...tapHandlers}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <octahedronGeometry args={[1 / CENTER_REST_SCALE, 0]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Interactive nav node
// ---------------------------------------------------------------------------

function NavNodeMesh({
  position,
  node,
  onNavigate,
}: {
  position: THREE.Vector3;
  node: NavNode;
  onNavigate: (route: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);
  const revealTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // FRAC-144: 100ms grace timer for hide so the cursor can transition from
  // mesh -> popup without flashing. Cleared on any pointer-enter (mesh or
  // popup), set on any pointer-leave.
  const hoverHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phase = useRef(Math.random() * Math.PI * 2);
  // FRAC-9: independent phase for the emissive glow pulse so the sine breath
  // is decorrelated from the existing scale pulse and staggered across nodes.
  const glowPhase = useRef(Math.random() * Math.PI * 2);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;

  const cancelHoverHide = () => {
    if (hoverHideTimer.current) {
      clearTimeout(hoverHideTimer.current);
      hoverHideTimer.current = null;
    }
  };

  const scheduleHoverHide = () => {
    cancelHoverHide();
    hoverHideTimer.current = setTimeout(() => {
      setHovered(false);
      document.body.style.cursor = "auto";
    }, 100);
  };

  useFrame((_, delta) => {
    if (meshRef.current) {
      // FRAC-28: scale-pulse is the decorative breathing on each nav node.
      // When the user prefers reduced motion, lock the node at its target
      // size (hover/reveal still snaps cleanly via lerp) so the sinusoid
      // pulse component is removed.
      if (prefersReducedMotion) {
        const target = (hovered || revealed) ? 1.8 : 1.0;
        const s = meshRef.current.scale.x;
        meshRef.current.scale.setScalar(s + (target - s) * 0.15);
      } else {
        phase.current += delta * 2;
        const pulse = 1 + Math.sin(phase.current) * 0.08;
        const target = (hovered || revealed) ? 1.8 : 1.0;
        const s = meshRef.current.scale.x / pulse;
        meshRef.current.scale.setScalar((s + (target - s) * 0.15) * pulse);
      }
    }
    // FRAC-9: emissive glow pulse. ~2.5s sinusoid period (TAU / 2.5 ~= 2.51
    // rad/s). Base intensity 1.0, amplitude 0.6 → glow breathes between 0.4
    // and 1.6. Hover/reveal boosts to 2.4 peak. Reduced-motion → static.
    if (materialRef.current) {
      if (prefersReducedMotion) {
        materialRef.current.emissiveIntensity =
          hovered || revealed ? 2.0 : 1.0;
      } else {
        glowPhase.current += delta * 2.51;
        const base = hovered || revealed ? 1.8 : 1.0;
        const amp = hovered || revealed ? 0.6 : 0.6;
        materialRef.current.emissiveIntensity =
          base + Math.sin(glowPhase.current) * amp;
      }
    }
  });

  // FRAC-124: Use tap-vs-drag discriminator instead of onClick. The
  // reveal-then-tap touch-device behavior from FRAC-79 is preserved — it
  // simply runs inside the confirmed-tap callback now. We read reveal state
  // from a ref rather than the closure-captured `revealed` so that a single
  // stable handler object sees the latest value.
  const tapHandlers = useTapHandlers(() => {
    // Touch devices: first tap reveals label, second tap navigates
    if (isTouchDevice && !revealedRef.current) {
      revealedRef.current = true;
      setRevealed(true);
      // Auto-hide after 3 seconds
      if (revealTimeout.current) clearTimeout(revealTimeout.current);
      revealTimeout.current = setTimeout(() => {
        revealedRef.current = false;
        setRevealed(false);
      }, 3000);
      return;
    }
    onNavigate(node.route);
  });

  return (
    <group position={position}>
      {/* Visible node sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          ref={materialRef}
          color={node.color}
          emissive={node.color}
          emissiveIntensity={1.0}
        />
        {(hovered || revealed) && (
          <Html center distanceFactor={8} style={{ pointerEvents: "auto" }}>
            <div
              style={{
                ...tooltipStyle(node.color),
                cursor: "pointer",
              }}
              onPointerEnter={() => {
                // Cursor moved from mesh into the popup — keep it visible.
                cancelHoverHide();
                setHovered(true);
              }}
              onPointerLeave={() => {
                // Cursor left the popup. Schedule hide; will be cancelled if
                // the cursor returns to the mesh or the popup within 100ms.
                scheduleHoverHide();
              }}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(node.route);
              }}
            >
              {node.label}
            </div>
          </Html>
        )}
      </mesh>
      {/* Invisible enlarged hit target for easier tapping on mobile (FRAC-79) */}
      <mesh
        {...tapHandlers}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          cancelHoverHide();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          // Schedule hide via grace timer (cancelled if popup is entered).
          scheduleHoverHide();
        }}
      >
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Shared tooltip style
// ---------------------------------------------------------------------------

function tooltipStyle(borderColor: string): React.CSSProperties {
  return {
    background: "rgba(248,246,240,0.92)",
    border: `1.5px solid ${borderColor}`,
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 300,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    whiteSpace: "nowrap",
    color: "hsl(var(--foreground))",
    transform: "translateY(-28px)",
  };
}

// ---------------------------------------------------------------------------
// Main: Nested octahedra with cross-connections and edge text
// ---------------------------------------------------------------------------

export function FractalObject({
  imagePath: _imagePath,
  onNavigate,
}: {
  imagePath?: string;
  onNavigate: (route: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const outerVerts = useMemo(() => makeOctahedronVertices(1.7), []);
  const innerVerts = useMemo(() => makeOctahedronVertices(1.1), []);

  // Slow auto-rotation — Y-axis only so it stays vertical.
  // FRAC-28: skip the rotation delta when the user prefers reduced motion so
  // the entire hero scene parks at its initial pose.
  useFrame((_, delta) => {
    if (prefersReducedMotion) return;
    if (groupRef.current) {
      const d = Math.min(delta, 0.05);
      groupRef.current.rotation.y += d * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.35, 0]}>
      {/* Subdivided wireframe shells for rounder visual */}
      <mesh>
        <octahedronGeometry args={[1.7, 1]} />
        <meshStandardMaterial
          color="#e8e0d0"
          emissive="#bb8844"
          emissiveIntensity={0.3}
          wireframe
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <octahedronGeometry args={[1.3, 0]} />
        <meshStandardMaterial
          color="#e8e0d0"
          emissive="#cc9955"
          emissiveIntensity={0.4}
          wireframe
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Streaming text along outer octahedron edges */}
      <StreamingEdgeSet verts={outerVerts} color="#e0c880" opacity={0.85} />

      {/* Streaming text along inner octahedron edges */}
      <StreamingEdgeSet verts={innerVerts} color="#ddb866" opacity={0.7} />

      {/* Streaming text along cross-connections */}
      <StreamingCrossConnections
        outerVerts={outerVerts}
        innerVerts={innerVerts}
        color="#e0c880"
        opacity={0.65}
      />

      {/* Center octahedron with per-face section textures */}
      <CenterOctahedron onNavigate={onNavigate} />

      {/* 6 house nav nodes on outer octahedron vertices */}
      {OUTER_NAV_NODES.map((node) => (
        <NavNodeMesh
          key={node.route}
          position={outerVerts[node.vertexIndex]}
          node={node}
          onNavigate={onNavigate}
        />
      ))}
    </group>
  );
}
