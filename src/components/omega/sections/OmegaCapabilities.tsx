"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Brain,
  Eye,
  Waves,
  Shield,
  Workflow,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "../ui/SectionHeading";
import { GlassCard } from "../ui/GlassCard";

interface Cap {
  icon: LucideIcon;
  title: string;
  body: string;
  tag: string;
  accent: string;
}

const CAPS: Cap[] = [
  {
    icon: Brain,
    title: "Reasoning Core",
    body: "Multi-step planning, tool use, and self-critique. Omega thinks in traces, not tokens — visible, auditable, fast.",
    tag: "cognition",
    accent: "var(--omega-emerald)",
  },
  {
    icon: Eye,
    title: "Multimodal Vision",
    body: "Understands images, documents, and screens natively. VLM-grade perception fused with language at the core.",
    tag: "perception",
    accent: "var(--omega-amber)",
  },
  {
    icon: Waves,
    title: "Voice & Audio",
    body: "Sub-30ms streaming ASR and neural TTS. Speak to Omega; it speaks back — in your tone, in your language.",
    tag: "speech",
    accent: "var(--omega-rose)",
  },
  {
    icon: Workflow,
    title: "Agentic Workflows",
    body: "Composable agents that plan, act, and verify. Long-horizon tasks execute reliably with checkpointed memory.",
    tag: "agents",
    accent: "var(--omega-emerald)",
  },
  {
    icon: Shield,
    title: "Private by Design",
    body: "Local-first memory, encrypted context, and granular permissions. Your data shapes Omega — never trains it.",
    tag: "trust",
    accent: "var(--omega-amber)",
  },
  {
    icon: Cpu,
    title: "Edge to Cloud",
    body: "Runs on-device for latency, scales to the cloud for scale. One runtime, transparently distributed.",
    tag: "runtime",
    accent: "var(--omega-rose)",
  },
];

/**
 * OmegaCapabilities — depth-based cards that assemble in 3D space on scroll.
 * Each card tilts toward the cursor (GlassCard) and enters with a rotate/translateZ
 * convergence so the grid literally "assembles" rather than fades in.
 */
export function OmegaCapabilities() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const layerY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      id="capabilities"
      ref={ref}
      className="relative mx-auto max-w-6xl px-4 py-28 sm:py-36"
    >
      <SectionHeading
        kicker="Capabilities"
        title="Intelligence at every layer"
        subtitle="Six native systems, one coherent runtime. Each layer is engineered to feel inevitable — never bolted on."
      />

      <motion.div
        style={{ y: layerY, perspective: 1400 }}
        className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {CAPS.map((c, i) => (
          <AssembleCard key={c.title} cap={c} index={i} />
        ))}
      </motion.div>
    </section>
  );
}

function AssembleCard({ cap, index }: { cap: Cap; index: number }) {
  const Icon = cap.icon;
  // staggered convergence: each card enters from a slightly different depth/rotation
  const enterRot = index % 2 === 0 ? -8 : 8;
  const enterX = index % 3 === 0 ? -40 : index % 3 === 1 ? 40 : 0;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 60,
        rotateX: 18,
        rotateY: enterRot,
        x: enterX,
        transformPerspective: 1200,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        x: 0,
        transition: {
          duration: 0.9,
          delay: (index % 3) * 0.1,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      viewport={{ once: true, margin: "-12% 0px" }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <GlassCard tilt tiltMax={9} depth={40} className="h-full">
        <div className="flex h-full flex-col p-6">
          <div className="mb-5 flex items-center justify-between">
            <span
              className="grid h-11 w-11 place-items-center rounded-xl"
              style={{
                background: `color-mix(in oklch, ${cap.accent} 14%, transparent)`,
                color: cap.accent,
                boxShadow: `0 0 24px -6px ${cap.accent}`,
              }}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--omega-fg-dim)]">
              {cap.tag}
            </span>
          </div>
          <h3 className="font-display text-xl font-semibold tracking-tight text-[var(--omega-fg)]">
            {cap.title}
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-[var(--omega-fg-dim)]">
            {cap.body}
          </p>
          <div className="mt-auto pt-6">
            <div
              className="h-px w-full"
              style={{
                background: `linear-gradient(90deg, ${cap.accent}, transparent)`,
                opacity: 0.4,
              }}
            />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
