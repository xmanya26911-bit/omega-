"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RING_VERT, RING_FRAG } from "./shaders";
import { useMotionStore } from "../store/motion-store";

/**
 * EnergyRings — three counter-rotating torus shells + an orbiting energy node.
 * Provides the "rotating geometric shapes" + "energy lines" language around the
 * core. Rings use a fresnel pulse shader so they read as glowing containment
 * fields, not flat geometry.
 */
export function EnergyRings() {
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  const r3 = useRef<THREE.Mesh>(null);
  const node = useRef<THREE.Mesh>(null);

  const uniforms1 = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#33e8b0") },
    }),
    []
  );
  const uniforms2 = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#f5c97b") },
    }),
    []
  );
  const uniforms3 = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#f26b8a") },
    }),
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    [uniforms1, uniforms2, uniforms3].forEach((u) => (u.uTime.value = t));
    if (r1.current) {
      r1.current.rotation.x += delta * 0.25;
      r1.current.rotation.y += delta * 0.12;
    }
    if (r2.current) {
      r2.current.rotation.y -= delta * 0.3;
      r2.current.rotation.z += delta * 0.1;
    }
    if (r3.current) {
      r3.current.rotation.x -= delta * 0.15;
      r3.current.rotation.z -= delta * 0.22;
    }
    if (node.current) {
      // orbit a bright node around the core
      const a = t * 0.8;
      node.current.position.set(Math.cos(a) * 1.7, Math.sin(a * 0.7) * 0.6, Math.sin(a) * 1.7);
      const s = 0.8 + Math.sin(t * 3) * 0.25;
      node.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <mesh ref={r1} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.7, 0.012, 16, 160]} />
        <shaderMaterial
          vertexShader={RING_VERT}
          fragmentShader={RING_FRAG}
          uniforms={uniforms1}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={r2} rotation={[0, 0, Math.PI / 3]}>
        <torusGeometry args={[2.05, 0.008, 16, 160]} />
        <shaderMaterial
          vertexShader={RING_VERT}
          fragmentShader={RING_FRAG}
          uniforms={uniforms2}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={r3} rotation={[Math.PI / 5, Math.PI / 3, 0]}>
        <torusGeometry args={[2.4, 0.006, 16, 160]} />
        <shaderMaterial
          vertexShader={RING_VERT}
          fragmentShader={RING_FRAG}
          uniforms={uniforms3}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={node}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial
          color={"#7cffd6"}
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * CursorLight — a point light that lerps toward the cursor's projected position
 * so the scene's lighting reacts to mouse movement ("interactive lighting").
 * Paired with a subtle emerald rim light from the opposite side.
 */
export function CursorLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const target = useRef(new THREE.Vector3(0, 0, 3));

  useFrame(() => {
    if (!lightRef.current) return;
    const { nx, ny } = useMotionStore.getState();
    // project normalized pointer into the scene plane near z=2
    const tx = nx * 3.5;
    const ty = ny * 2.2;
    target.current.set(tx, ty, 2.5);
    lightRef.current.position.lerp(target.current, 0.08);
  });

  return (
    <>
      <pointLight
        ref={lightRef}
        color={"#33e8b0"}
        intensity={6}
        distance={9}
        decay={2}
        position={[0, 0, 2.5]}
      />
      <pointLight color={"#f26b8a"} intensity={2.4} distance={12} decay={2} position={[-4, -2, -3]} />
      <ambientLight intensity={0.25} />
    </>
  );
}
