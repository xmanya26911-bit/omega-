"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMotionStore } from "../store/motion-store";

/**
 * CameraRig — turns the whole page into a virtual camera.
 *
 *  - Slow continuous orbital drift (the "cinematic camera")
 *  - Subtle dolly (z) on scroll progress — depth transitions as you scroll
 *  - Perspective shift from mouse (nx, ny) — the scene rotates toward the cursor
 *  - The whole rig looks at the core; everything eases (lerp) for weight
 *
 * Combined with the persistent fixed canvas, this is what makes scrolling feel
 * like moving a camera through a 3D environment rather than scrolling a page.
 */
export function CameraRig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 5));
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const { nx, ny, progress } = useMotionStore.getState();
    const t = state.clock.elapsedTime;

    // base orbital breathing
    const orbitX = Math.sin(t * 0.1) * 0.35;
    const orbitY = Math.cos(t * 0.08) * 0.22;

    // cursor-driven perspective shift
    const px = nx * 0.7;
    const py = ny * 0.45;

    // scroll dolly: pull back + drift up as you progress, so the orb recedes
    // into the scene past the hero (cleaner backdrop for later sections)
    const dolly = 5 + progress * 4.5;
    const driftY = progress * 1.6;

    target.current.set(orbitX + px, orbitY + py + driftY, dolly);
    camera.position.lerp(target.current, 0.045);

    // look slightly toward cursor for parallax depth
    lookAt.current.set(nx * 0.25, ny * 0.18 + progress * 0.8, 0);
    camera.lookAt(lookAt.current);
  });

  return null;
}
