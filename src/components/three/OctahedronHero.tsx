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
  { label: "Co-Living",        route: "/neighborhood",     color: "#889460", vertexIndex: 3 },
  { label: "Events",           route: "/events",           color: "#D4857A", vertexIndex: 2 },
  { label: "Campus",           route: "/campus",           color: "#2B5A48", vertexIndex: 0 },
  { label: "New Liberal Arts", route: "/new-liberal-arts", color: "#C41E20", vertexIndex: 1 },
  { label: "Political Club",   route: "/political-club",   color: "#6E1830", vertexIndex: 4 },
  { label: "Lab",              route: "/lab",              color: "#E870A0", vertexIndex: 5 },
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
    canvas.width = 1024;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;

    // Draw repeating text
    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px 'JetBrains Mono', monospace";
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
    return new THREE.TubeGeometry(curve, 1, 0.015, 4, false);
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

function CenterOctahedron({
  imagePath,
  onNavigate,
}: {
  imagePath: string;
  onNavigate: (route: string) => void;
}) {
  const texture = useLoader(THREE.TextureLoader, imagePath);
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      const target = hovered ? 0.95 : 0.9;
      const s = meshRef.current.scale.x;
      meshRef.current.scale.setScalar(s + (target - s) * 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
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
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial map={texture} color="#ffffff" />
      {hovered && (
        <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
          <div style={tooltipStyle("#1a1a1a")}>The Protocol</div>
        </Html>
      )}
    </mesh>
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
    <mesh
      ref={meshRef}
      position={position}
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
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color={node.color}
        emissive={node.color}
        emissiveIntensity={(hovered || revealed) ? 2.0 : 1.0}
      />
      {(hovered || revealed) && (
        <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
          <div style={tooltipStyle(node.color)}>{node.label}</div>
        </Html>
      )}
    </mesh>
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
    fontFamily: "var(--font-body, system-ui)",
    fontWeight: 500,
    whiteSpace: "nowrap",
    color: "#1a1a1a",
    transform: "translateY(-28px)",
  };
}

// ---------------------------------------------------------------------------
// Main: Nested octahedra with cross-connections and edge text
// ---------------------------------------------------------------------------

export function FractalObject({
  imagePath,
  onNavigate,
}: {
  imagePath: string;
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
      <StreamingEdgeSet verts={outerVerts} color="#c4a265" opacity={0.7} />

      {/* Streaming text along inner octahedron edges */}
      <StreamingEdgeSet verts={innerVerts} color="#cc9955" opacity={0.5} />

      {/* Streaming text along cross-connections */}
      <StreamingCrossConnections
        outerVerts={outerVerts}
        innerVerts={innerVerts}
        color="#c4a265"
        opacity={0.55}
      />

      {/* Center octahedron with hero image */}
      <CenterOctahedron imagePath={imagePath} onNavigate={onNavigate} />

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
