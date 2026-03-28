import { useMemo } from "react";
import * as THREE from "three";

interface BuildingData {
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  colorIndex: number;
}

function Building({ position, width, height, depth, colorIndex }: BuildingData) {
  const colors = ["#5a6577", "#4e5869", "#6b7585", "#3d4654", "#7a8494"];
  const color = colors[colorIndex % colors.length];
  const distFromCamera = Math.abs(position[2]);
  const fogFactor = Math.min(distFromCamera / 25, 0.75);
  const fadedColor = new THREE.Color(color).lerp(new THREE.Color("#dde0e5"), fogFactor);

  return (
    <mesh position={[position[0], position[1] + height / 2, position[2]]}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={fadedColor} />
    </mesh>
  );
}

export function Skyline() {
  const buildings = useMemo(() => {
    const seed = 42;
    const seededRandom = (i: number) => {
      const x = Math.sin(seed + i * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };

    const result: BuildingData[] = [];
    const baseY = -7;

    for (let row = 0; row < 6; row++) {
      const z = -3 - row * 3;
      const count = 35 + row * 5;
      const spread = 30 + row * 10;

      for (let i = 0; i < count; i++) {
        const idx = row * 100 + i;
        const t = (i / count) - 0.5;
        const x = t * spread + seededRandom(idx * 3) * 1.2;

        const w = 0.25 + seededRandom(idx * 11) * 0.6;
        const d = 0.25 + seededRandom(idx * 13) * 0.5;

        const distFromCenter = Math.abs(t);
        let h: number;

        if (distFromCenter < 0.15) {
          h = 1.5 + seededRandom(idx * 17) * 3;
          if (seededRandom(idx * 23) > 0.7) h += 1 + seededRandom(idx * 29) * 1.5;
        } else if (distFromCenter < 0.35) {
          h = 1 + seededRandom(idx * 17) * 2.5;
        } else {
          h = 0.4 + seededRandom(idx * 17) * 1.5;
        }

        h *= (1 - row * 0.08);

        result.push({
          position: [x, baseY, z],
          width: w,
          height: h,
          depth: d,
          colorIndex: idx,
        });
      }
    }

    return result;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <Building key={i} {...b} />
      ))}
      <mesh position={[0, -7, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 30]} />
        <meshStandardMaterial color="#d8dce2" />
      </mesh>
    </group>
  );
}
