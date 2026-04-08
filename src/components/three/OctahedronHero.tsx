import { useRef, useMemo, useState } from "react";
import { useFrame, useLoader, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Nav node definitions — 6 houses on octahedron vertices
// ---------------------------------------------------------------------------

interface NavNode {
  label: string;
  route: string;
  color: string;
  vertexIndex: number;
}

const OUTER_NAV_NODES: NavNode[] = [
  { label: "Neighborhood",     route: "/neighborhood",     color: "#889460", vertexIndex: 3 },
  { label: "Events",           route: "/events",           color: "#D4857A", vertexIndex: 2 },
  { label: "Campus",           route: "/campus",           color: "#2B5A48", vertexIndex: 0 },
  { label: "New Liberal Arts", route: "/new-liberal-arts", color: "#C41E20", vertexIndex: 1 },
  { label: "Political Club",   route: "/political-club",   color: "#6E1830", vertexIndex: 4 },
  { label: "The Lab",          route: "/lab",              color: "#E870A0", vertexIndex: 5 },
];

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

  // Animate the texture offset to scroll
  useFrame((_, delta) => {
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

// Banner images (4 of 6 sections have images)
const FACE_BANNER_IMAGES: Record<string, string> = {
  lab:          "/images/banners/lab.jpeg",
  forum:        "/images/banners/political-club.jpeg",
  neighborhood: "/images/banners/neighborhood.jpeg",
  school:       "/images/banners/new-liberal-arts.png",
};

// Section colors (all 6 sections)
const FACE_SECTION_COLORS: Record<string, string> = {
  neighborhood: "#889460",
  events:       "#D4857A",
  campus:       "#2B5A48",
  school:       "#C41E20",
  forum:        "#6E1830",
  lab:          "#E870A0",
};

// Map octahedron face index → section key (8 faces, 6 sections + 2 extras)
// Octahedron faces (detail=0) are ordered by the geometry's index buffer.
// Face indices 0-7 correspond to the 8 triangular faces.
const FACE_SECTION_MAP: (string | null)[] = [
  "campus",        // face 0
  "school",        // face 1
  "neighborhood",  // face 2
  "events",        // face 3
  "lab",           // face 4
  "forum",         // face 5
  "campus",        // face 6 — repeat (darker forest green)
  "events",        // face 7 — repeat (coral/peach)
];

/**
 * Build an OctahedronBufferGeometry with per-face material groups and UVs.
 * Each of the 8 faces gets its own material group so we can assign
 * different materials (textured or solid color) to each.
 */
function usePerFaceOctahedronGeometry(radius: number) {
  return useMemo(() => {
    const base = new THREE.OctahedronGeometry(radius, 0);

    // OctahedronGeometry with detail=0 uses an index buffer.
    // Convert to non-indexed so each face has its own vertices.
    const nonIndexed = base.toNonIndexed();
    base.dispose();

    const posAttr = nonIndexed.getAttribute("position");
    const vertexCount = posAttr.count; // 24 vertices (8 faces * 3)
    const faceCount = vertexCount / 3; // 8

    // Assign material groups: each face (3 vertices) gets its own group
    nonIndexed.clearGroups();
    for (let i = 0; i < faceCount; i++) {
      nonIndexed.addGroup(i * 3, 3, i);
    }

    // Compute UVs for each face — map each triangle to fill the full texture
    // Using a simple equilateral-like mapping: v0→(0.5,1), v1→(0,0), v2→(1,0)
    const uvs = new Float32Array(vertexCount * 2);
    for (let f = 0; f < faceCount; f++) {
      const base2 = f * 3 * 2;
      // vertex 0 of triangle → top center
      uvs[base2 + 0] = 0.5;
      uvs[base2 + 1] = 1.0;
      // vertex 1 → bottom left
      uvs[base2 + 2] = 0.0;
      uvs[base2 + 3] = 0.0;
      // vertex 2 → bottom right
      uvs[base2 + 4] = 1.0;
      uvs[base2 + 5] = 0.0;
    }
    nonIndexed.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    return nonIndexed;
  }, [radius]);
}

/**
 * Build the array of 8 materials (one per face) — textured where a banner
 * image exists, solid-color otherwise.
 */
function usePerFaceMaterials() {
  // Load all 4 banner textures
  const labTex = useLoader(THREE.TextureLoader, FACE_BANNER_IMAGES.lab);
  const forumTex = useLoader(THREE.TextureLoader, FACE_BANNER_IMAGES.forum);
  const neighborhoodTex = useLoader(THREE.TextureLoader, FACE_BANNER_IMAGES.neighborhood);
  const schoolTex = useLoader(THREE.TextureLoader, FACE_BANNER_IMAGES.school);

  const textureMap: Record<string, THREE.Texture> = useMemo(
    () => ({
      lab: labTex,
      forum: forumTex,
      neighborhood: neighborhoodTex,
      school: schoolTex,
    }),
    [labTex, forumTex, neighborhoodTex, schoolTex],
  );

  return useMemo(() => {
    return FACE_SECTION_MAP.map((sectionKey) => {
      if (!sectionKey) {
        return new THREE.MeshBasicMaterial({ color: "#c4a265" });
      }

      const tex = textureMap[sectionKey];
      const color = FACE_SECTION_COLORS[sectionKey] ?? "#c4a265";

      if (tex) {
        // Textured face — show the banner image
        return new THREE.MeshBasicMaterial({
          map: tex,
          color: "#ffffff",
          side: THREE.FrontSide,
        });
      }

      // Solid color face for sections without a banner image
      return new THREE.MeshBasicMaterial({
        color,
        side: THREE.FrontSide,
      });
    });
  }, [textureMap]);
}

function CenterOctahedron({
  onNavigate,
}: {
  onNavigate: (route: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = usePerFaceOctahedronGeometry(1);
  const materials = usePerFaceMaterials();

  useFrame(() => {
    if (meshRef.current) {
      const target = hovered ? 0.95 : 0.9;
      const s = meshRef.current.scale.x;
      meshRef.current.scale.setScalar(s + (target - s) * 0.1);
    }
  });

  return (
    <group>
      {/* Visible center octahedron with per-face textures */}
      <mesh ref={meshRef} geometry={geometry} material={materials}>
        {hovered && (
          <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
            <div style={tooltipStyle("#1a1a1a")}>The Protocol</div>
          </Html>
        )}
      </mesh>
      {/* Invisible enlarged hit target for easier tapping on mobile */}
      <mesh
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onNavigate("/the-protocol");
        }}
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
        <sphereGeometry args={[1.15, 16, 16]} />
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
  const [hovered, setHovered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const revealTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phase = useRef(Math.random() * Math.PI * 2);
  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;

  useFrame((_, delta) => {
    if (meshRef.current) {
      phase.current += delta * 2;
      const pulse = 1 + Math.sin(phase.current) * 0.08;
      const target = (hovered || revealed) ? 1.8 : 1.0;
      const s = meshRef.current.scale.x / pulse;
      meshRef.current.scale.setScalar((s + (target - s) * 0.15) * pulse);
    }
  });

  return (
    <group position={position}>
      {/* Visible node sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={(hovered || revealed) ? 2.0 : 1.0}
        />
        {(hovered || revealed) && (
          <Html center distanceFactor={8} style={{ pointerEvents: "auto" }}>
            <div
              style={{ ...tooltipStyle(node.color), cursor: "pointer" }}
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
      {/* Invisible enlarged hit target for easier tapping on mobile */}
      <mesh
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          // Touch devices: first tap reveals label, second tap navigates
          if (isTouchDevice && !revealed) {
            setRevealed(true);
            // Auto-hide after 3 seconds
            if (revealTimeout.current) clearTimeout(revealTimeout.current);
            revealTimeout.current = setTimeout(() => setRevealed(false), 3000);
            return;
          }
          onNavigate(node.route);
        }}
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
    background: "rgba(250,248,245,0.92)",
    border: `1.5px solid ${borderColor}`,
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 300,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    whiteSpace: "nowrap",
    color: "#1a1a1a",
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

  const outerVerts = useMemo(() => makeOctahedronVertices(1.7), []);
  const innerVerts = useMemo(() => makeOctahedronVertices(1.1), []);

  // Slow auto-rotation — Y-axis only so it stays vertical
  useFrame((_, delta) => {
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
