import { useRef, useMemo, useState } from "react";
import { useFrame, useLoader, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Nav node definitions — 7 pages + center sphere (Protocol)
// ---------------------------------------------------------------------------

interface NavNode {
  label: string;
  route: string;
  color: string;
  vertexIndex: number; // which of the 12 icosahedron vertices to place this on
}

// Icosahedron vertices (r=1.2, detail=0), sorted by spatial position:
//
//  idx 2:  (-0.63,  1.02,  0.00)  top-left
//  idx 3:  ( 0.63,  1.02,  0.00)  top-right
//  idx 1:  ( 0.00,  0.63,  1.02)  upper-front
//  idx 4:  ( 0.00,  0.63, -1.02)  upper-back
//  idx 0:  (-1.02,  0.00,  0.63)  equator left-front
//  idx 5:  (-1.02,  0.00, -0.63)  equator left-back
//  idx 6:  ( 1.02,  0.00,  0.63)  equator right-front
//  idx 10: ( 1.02,  0.00, -0.63)  equator right-back
//  idx 7:  ( 0.00, -0.63,  1.02)  lower-front
//  idx 9:  ( 0.00, -0.63, -1.02)  lower-back
//  idx 8:  (-0.63, -1.02,  0.00)  bottom-left
//  idx 11: ( 0.63, -1.02,  0.00)  bottom-right
//
// 7 picked for max spatial spread across all bands:

// 8 nav nodes spread across the icosahedron for max spatial coverage.
// Skipped vertices: 3 (top-right), 0 (eq left-front), 7 (lower-front), 11 (bottom-right)
// — these four cluster with the selected ones; skipping them gives the best spread.
const NAV_NODES: NavNode[] = [
  { label: "Our Story",         route: "/story",            color: "#E07A5F", vertexIndex: 2  }, // top-left
  { label: "Neighborhood",      route: "/neighborhood",     color: "#8B7355", vertexIndex: 4  }, // upper-back
  { label: "Events",            route: "/events",           color: "#E07A5F", vertexIndex: 1  }, // upper-front
  { label: "Campus",            route: "/campus",           color: "#457B9D", vertexIndex: 6  }, // equator right-front
  { label: "New Liberal Arts",  route: "/new-liberal-arts", color: "#1D3557", vertexIndex: 5  }, // equator left-back
  { label: "Political Club",    route: "/political-club",   color: "#CC2936", vertexIndex: 10 }, // equator right-back
  { label: "The Lab",           route: "/lab",              color: "#6B4C9A", vertexIndex: 9  }, // lower-back
  { label: "People",            route: "/people",           color: "#457B9D", vertexIndex: 8  }, // bottom-left
];

const NAV_VERTEX_INDICES = new Set(NAV_NODES.map((n) => n.vertexIndex));

// ---------------------------------------------------------------------------
// Icosahedron wireframe layer
// ---------------------------------------------------------------------------

function IcosahedronLayer({
  radius,
  emissiveColor,
  emissiveIntensity,
  wireframe,
  opacity,
}: {
  radius: number;
  emissiveColor: string;
  emissiveIntensity: number;
  wireframe: boolean;
  opacity: number;
}) {
  return (
    <mesh>
      <icosahedronGeometry args={[radius, wireframe ? 1 : 2]} />
      <meshStandardMaterial
        color="#e8e0d0"
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}
        wireframe={wireframe}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Clickable center sphere → /the-protocol
// ---------------------------------------------------------------------------

function PhotoCenter({
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
      const target = hovered ? 0.75 : 0.7;
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
      <sphereGeometry args={[1, 64, 64]} />
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
  position: [number, number, number];
  node: NavNode;
  onNavigate: (route: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (meshRef.current) {
      phase.current += delta * 2;
      const pulse = 1 + Math.sin(phase.current) * 0.08;
      const target = hovered ? 1.8 : 1.0;
      const s = meshRef.current.scale.x / pulse;
      meshRef.current.scale.setScalar((s + (target - s) * 0.15) * pulse);
    }
  });

  return (
    <group position={position}>
      {/* Visible node sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={hovered ? 3.0 : 1.5}
        />
        {hovered && (
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
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Decorative (non-interactive) vertex dot
// ---------------------------------------------------------------------------

function DecorativeDot({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.025, 8, 8]} />
      <meshStandardMaterial
        color="#ddbb77"
        emissive="#cc9944"
        emissiveIntensity={0.8}
        transparent
        opacity={0.6}
      />
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
// Main fractal object
// ---------------------------------------------------------------------------

export function FractalObject({
  imagePath,
  onNavigate,
}: {
  imagePath: string;
  onNavigate: (route: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Extract the 12 unique icosahedron vertices, normalized to the middle
  // shell radius (1.3) so nav nodes sit exactly on the wireframe.
  const vertices = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.3, 0);
    const positions = geo.attributes.position;
    const verts: [number, number, number][] = [];
    const seen = new Set<string>();
    for (let i = 0; i < positions.count; i++) {
      const key = `${positions.getX(i).toFixed(2)},${positions.getY(i).toFixed(2)},${positions.getZ(i).toFixed(2)}`;
      if (!seen.has(key)) {
        seen.add(key);
        verts.push([positions.getX(i), positions.getY(i), positions.getZ(i)]);
      }
    }
    geo.dispose();
    return verts;
  }, []);

  // Slow auto-rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      const d = Math.min(delta, 0.05);
      groupRef.current.rotation.y += d * 0.12;
      groupRef.current.rotation.x += d * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.35, 0]}>
      {/* Wireframe shells */}
      <IcosahedronLayer
        radius={1.8}
        emissiveColor="#bb8844"
        emissiveIntensity={0.2}
        wireframe={true}
        opacity={0.08}
      />
      <IcosahedronLayer
        radius={1.3}
        emissiveColor="#cc9955"
        emissiveIntensity={0.4}
        wireframe={true}
        opacity={0.25}
      />
      <IcosahedronLayer
        radius={0.95}
        emissiveColor="#ddaa66"
        emissiveIntensity={0.6}
        wireframe={true}
        opacity={0.45}
      />

      {/* Clickable center sphere */}
      <PhotoCenter imagePath={imagePath} onNavigate={onNavigate} />

      {/* Nav nodes at hand-picked vertices */}
      {NAV_NODES.map((node) => (
        <NavNodeMesh
          key={node.route}
          position={vertices[node.vertexIndex]}
          node={node}
          onNavigate={onNavigate}
        />
      ))}
    </group>
  );
}
