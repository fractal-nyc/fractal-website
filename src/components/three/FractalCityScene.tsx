import { useRef } from "react";
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

  // FRAC-144: Use react-three-fiber's eventSource prop to decouple the
  // canvas's visual size from its event-capture region.
  //
  // - Canvas itself is FULL-BLEED so the 3D model renders at full size.
  // - When `eventSource` is set, R3F automatically applies
  //   `pointer-events: none` to the canvas wrapper, so touches on the
  //   canvas pass through to whatever is below it.
  // - R3F listens for pointer events on the eventSourceRef element
  //   instead — a smaller centered div positioned over the model's
  //   visible area. Touches inside that div are dispatched to mesh hit
  //   handlers; touches outside fall through and scroll the page.
  // - OrbitControls receives the same div as its `domElement` so the
  //   user-driven one-finger orbit (FRAC-143) keeps working inside the
  //   centered area.
  const eventSourceRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Full-bleed visual canvas. eventSource decouples hit-testing from this. */}
      <div className="absolute inset-0 z-[1]">
        <Canvas
          camera={{ position: [0, 0.8, 8], fov: 50, near: 0.1, far: 100 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          eventSource={eventSourceRef as React.RefObject<HTMLElement>}
          eventPrefix="client"
          style={{ background: "transparent" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NoToneMapping;
            gl.setClearColor(0x000000, 0);
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
            domElement={eventSourceRef.current ?? undefined}
          />
        </Canvas>
      </div>

      {/* Centered hit-target box. Only this region catches touches/clicks for
          the model. Everything else in the hero (above, below, sides) falls
          through to the body and scrolls. */}
      <div
        className="absolute inset-x-0 top-20 bottom-24 z-[2] flex items-center justify-center pointer-events-none"
      >
        <div
          ref={eventSourceRef}
          className="pointer-events-auto"
          style={{ width: "min(80vmin, 500px)", aspectRatio: "1 / 1", touchAction: "pan-y" }}
        />
      </div>
    </>
  );
}
