"use client";

/**
 * A lightweight 3D accent. Kept for reuse (e.g. /about, future product
 * showcase) — no Environment HDR, simple geometry only, runs at low DPR.
 * Not mounted on the homepage hero anymore for performance reasons.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type { Mesh } from "three";

function Accent() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.25;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[1, 0.32, 96, 16]} />
      <meshStandardMaterial color="#C9A961" metalness={0.7} roughness={0.3} />
    </mesh>
  );
}

export function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.4]}
      camera={{ position: [0, 0.4, 4.4], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 5, 3]} intensity={1} />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#E6CF96" />
      <Suspense fallback={null}>
        <Accent />
        <ContactShadows position={[0, -1.4, 0]} opacity={0.3} scale={8} blur={2} far={4} />
      </Suspense>
    </Canvas>
  );
}
