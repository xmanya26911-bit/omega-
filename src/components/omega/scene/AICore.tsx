"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CORE_VERT, CORE_FRAG } from "./shaders";

/**
 * AICore — the floating energy heart of Omega.
 *
 * Three layered shells for real depth:
 *   1. Inner solid emissive core (small, bright, jade)
 *   2. Noise-displaced fresnel shell (the living, breathing jelly)
 *   3. Outer wireframe lattice (slow counter-rotation, structural)
 *
 * The whole group floats (slow Y bob + spin) and is displaced by GLSL
 * simplex noise so it never looks static. Bloom (in the parent composer)
 * turns the rim into volumetric glow.
 */
export function AICore() {
  const groupRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.ShaderMaterial>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  const shellUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDisplace: { value: 0.18 },
      uColorA: { value: new THREE.Color("#33e8b0") }, // emerald
      uColorB: { value: new THREE.Color("#f5c97b") }, // amber
      uColorC: { value: new THREE.Color("#f26b8a") }, // rose
      uCore: { value: new THREE.Color("#7cffd6") },
    }),
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (shellRef.current) shellRef.current.uniforms.uTime.value = t;
    if (groupRef.current) {
      // gentle float + slow spin
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.12;
      groupRef.current.rotation.y += delta * 0.12;
      groupRef.current.rotation.z = Math.sin(t * 0.2) * 0.04;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y -= delta * 0.18;
      wireRef.current.rotation.x = Math.sin(t * 0.15) * 0.1;
    }
    if (innerRef.current) {
      const s = 1 + Math.sin(t * 1.6) * 0.06;
      innerRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Inner glowing core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshBasicMaterial
          color={"#5cffd0"}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Noise-displaced fresnel shell */}
      <mesh>
        <icosahedronGeometry args={[1, 48]} />
        <shaderMaterial
          ref={shellRef}
          vertexShader={CORE_VERT}
          fragmentShader={CORE_FRAG}
          uniforms={shellUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Outer wireframe lattice */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.34, 2]} />
        <meshBasicMaterial
          color={"#33e8b0"}
          wireframe
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
