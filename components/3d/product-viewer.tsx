"use client";

/**
 * Product Viewer (PDP)
 *
 * Lightweight 3D stand-in. Originally we loaded an HDR via drei's
 * `Environment preset="apartment"` for nicer reflections, but that pulled a
 * multi-MB asset on first interaction. We've replaced it with cheap point
 * lights and `MeshStandardMaterial`, which is plenty for the silhouette here.
 * `MeshDistortMaterial` and `PresentationControls` were also dropped — they
 * brought drei's heavier modules along for the ride.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import type { Group } from "three";

function ProductObject({ color }: { color: string }) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.25;
  });
  return (
    <group ref={ref} position={[0, -0.1, 0]}>
      <RoundedBox args={[1.6, 1.1, 0.6]} radius={0.18} smoothness={4}>
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.1} />
      </RoundedBox>
      <mesh position={[0, 0.85, 0]}>
        <torusGeometry args={[0.35, 0.05, 12, 36]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[0.5, 0, 0.31]}>
        <cylinderGeometry args={[0.04, 0.04, 0.18, 16]} />
        <meshStandardMaterial color="#C9A961" roughness={0.25} metalness={0.9} />
      </mesh>
      <mesh position={[-0.5, 0, 0.31]}>
        <cylinderGeometry args={[0.04, 0.04, 0.18, 16]} />
        <meshStandardMaterial color="#C9A961" roughness={0.25} metalness={0.9} />
      </mesh>
    </group>
  );
}

const COLOR_MAP: Record<string, string> = {
  Cognac: "#8a4f24",
  Black: "#161616",
  Noir: "#0f0f0f",
  Sand: "#d6c39a",
  Olive: "#5b5e3d",
  Charcoal: "#3a3a3a",
  Tan: "#a06b3d",
  Walnut: "#5e3a23",
  Ivory: "#efe7d6",
};

export function ProductViewer({ color }: { color?: string }) {
  const [hex, setHex] = useState(color ? COLOR_MAP[color] ?? "#8a4f24" : "#8a4f24");

  return (
    <div className="relative aspect-square rounded-2xl border border-border bg-gradient-to-br from-muted to-background overflow-hidden">
      <Canvas
        dpr={[1, 1.4]}
        camera={{ position: [0, 0.4, 3.2], fov: 38 }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 2]} intensity={0.9} />
        <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#C9A961" />
        <Suspense fallback={null}>
          <ProductObject color={hex} />
          <ContactShadows
            position={[0, -0.85, 0]}
            opacity={0.35}
            scale={6}
            blur={2}
            far={3}
          />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {Object.entries(COLOR_MAP).slice(0, 6).map(([name, c]) => (
          <button
            key={name}
            onClick={() => setHex(c)}
            aria-label={name}
            className="h-6 w-6 rounded-full border border-border shadow-sm transition hover:scale-110"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <span className="absolute top-3 right-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground bg-background/70 backdrop-blur px-2 py-1 rounded-full">
        3D preview
      </span>
    </div>
  );
}
