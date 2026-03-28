import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { FractalObject } from "./FractalObject";

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

export function FractalCityScene() {
  const imagePath = `${import.meta.env.BASE_URL}images/hero-bg.png`;

  return (
    <div className="absolute inset-0 z-[1]" style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0.8, 8], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <SceneLighting />
        <FractalObject imagePath={imagePath} />
      </Canvas>
    </div>
  );
}
