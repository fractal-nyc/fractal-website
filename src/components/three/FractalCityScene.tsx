import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TOUCH } from "three";
// Hero geometry variants — swap the import to try different shapes
// import { FractalObject } from "./FractalObject";       // Icosahedron (original)
// import { FractalObject } from "./MetatronCube";        // Nested hexahedra (Metatron's Cube)
import { FractalObject } from "./OctahedronHero";         // Octahedron

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={1.2} color="#f5f0ea" />
      <pointLight position={[3, 4, 5]} intensity={0.8} color="#ffcc88" distance={25} decay={2} />
      <pointLight position={[-3, 3, 4]} intensity={0.5} color="#ffaa66" distance={20} decay={2} />
      <directionalLight position={[5, 8, 10]} intensity={0.7} color="#ffffff" />
      <directionalLight position={[-3, 2, -5]} intensity={0.3} color="#aabbcc" />
    </>
  );
}

export function FractalCityScene({ onNavigate }: { onNavigate: (route: string) => void }) {
  const imagePath = `${import.meta.env.BASE_URL}images/fractal-university.png`;

  // FRAC-144: Wrap the Canvas in a centered box that does NOT fill the hero.
  // The outer positioning layer uses pointer-events-none so touches in the
  // gutters (above/below/left/right of the box) fall through to the hero
  // section and let the browser scroll. The inner box re-enables pointer
  // events just over the canvas itself, where OrbitControls + mesh hit
  // handlers live. This restores scroll passthrough on the navbar area and
  // the sides/corners of the hero without sacrificing model interactivity.
  return (
    <div
      className="absolute inset-x-0 top-20 bottom-24 flex items-center justify-center z-[1] pointer-events-none"
    >
      <div
        className="pointer-events-auto aspect-square w-full"
        style={{ maxWidth: "min(90vw, 600px)" }}
      >
        <Canvas
          camera={{ position: [0, 0.8, 8], fov: 50, near: 0.1, far: 100 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ background: "transparent", touchAction: "pan-y" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NoToneMapping;
            gl.setClearColor(0x000000, 0);
            // FRAC-124: Belt-and-suspenders — apply touchAction directly to the
            // canvas element. R3F sets touchAction on its wrapper div, but when
            // a pointer is captured on the canvas (e.g. by onClick hit meshes),
            // iOS Safari consults the canvas element's own touch-action, not
            // the parent's — so the hint needs to live on both.
            gl.domElement.style.touchAction = "pan-y";
          }}
        >
          <SceneLighting />
          <FractalObject imagePath={imagePath} onNavigate={onNavigate} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.5}
            target={[0, 0.35, 0]}
            touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_ROTATE }}
          />
        </Canvas>
      </div>
    </div>
  );
}
