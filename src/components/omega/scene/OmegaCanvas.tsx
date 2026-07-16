"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { AICore } from "./AICore";
import { ParticleField } from "./ParticleField";
import { EnergyRings, CursorLight } from "./EnergyRings";
import { CameraRig } from "./CameraRig";

/**
 * OmegaCanvas — the WebGL scene for Omega.
 *
 * Persistent fixed full-viewport canvas (rendered via <OmegaScene/>) sitting
 * between the background (z:-20) and content (z:10). Transparent clear so the
 * living aurora background shows through behind the orb.
 *
 * Contents:
 *   - CameraRig       virtual camera (scroll dolly + cursor parallax + drift)
 *   - AICore          floating noise-displaced energy heart
 *   - EnergyRings     counter-rotating containment field + orbiting node
 *   - ParticleField   ~1800 additive motes
 *   - CursorLight     point light that follows the cursor (interactive light)
 *   - EffectComposer  soft bloom + vignette (the "soft bloom / depth fog")
 */
export default function OmegaCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      frameloop="always"
      style={{ background: "transparent" }}
    >
      <CameraRig />
      <CursorLight />
      <AICore />
      <EnergyRings />
      <ParticleField count={1800} />

      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          intensity={1.15}
          luminanceThreshold={0.12}
          luminanceSmoothing={0.55}
          mipmapBlur
          radius={0.7}
        />
        <Vignette offset={0.22} darkness={0.82} eskil={false} />
      </EffectComposer>
    </Canvas>
  );
}
