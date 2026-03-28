import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

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

function PhotoCenter({ imagePath }: { imagePath: string }) {
  const texture = useLoader(THREE.TextureLoader, imagePath);

  return (
    <mesh>
      <sphereGeometry args={[0.7, 64, 64]} />
      <meshBasicMaterial map={texture} color="#ffffff" />
    </mesh>
  );
}

export function FractalObject({ imagePath }: { imagePath: string }) {
  const groupRef = useRef<THREE.Group>(null);

  const vertices = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.2, 0);
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

  useFrame((_, delta) => {
    if (groupRef.current) {
      const d = Math.min(delta, 0.05);
      groupRef.current.rotation.y += d * 0.12;
      groupRef.current.rotation.x += d * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.35, 0]}>
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

      <PhotoCenter imagePath={imagePath} />

      {vertices.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial
            color="#ddbb77"
            emissive="#cc9944"
            emissiveIntensity={1.2}
          />
        </mesh>
      ))}
    </group>
  );
}
