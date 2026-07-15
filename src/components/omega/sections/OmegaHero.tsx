"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { ArrowDown, Sparkles, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMotionStore } from "../store/motion-store";
import { useReducedMotion } from "../hooks/use-omega";
import { RevealText } from "../ui/RevealText";
import { OmegaButton } from "../ui/OmegaButton";
import { useLenisScroll } from "../hooks/use-omega";

/**
 * FloatingGlass — a glass window that floats at a given Z depth and parallaxes
 * with the cursor + scroll. Used to populate the hero with "floating glass
 * windows" at varied depths for real parallax.
 */
function FloatingGlass({
  children,
  className,
  depth = 1,
  floatPhase = 0,
}: {
  children: ReactNode;
  className?: string;
  depth?: number; // parallax strength
  floatPhase?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let cx = 0,
      cy = 0,
      cf = 0;
    const loop = (t: number) => {
      const { nx, ny } = useMotionStore.getState();
      const tx = nx * 26 * depth;
      const ty = ny * 18 * depth;
      const fy = Math.sin(t / 1400 + floatPhase) * 8 * depth;
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      cf += (fy - cf) * 0.04;
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${(cy + cf).toFixed(
        2
      )}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [depth, floatPhase, reduced]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

export function OmegaHero() {
  const ref = useRef<HTMLElement>(null);
  const scrollTo = useLenisScroll();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // foreground text rises + fades as you leave the hero (camera pushes in)
  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  return (
    <section
      id="overview"
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pt-28 pb-20"
    >
      <motion.div
        style={{ y: textY, opacity: textOpacity, scale: textScale }}
        className="relative z-10 flex max-w-4xl flex-col items-center text-center"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="omega-glass-thin mb-7 flex items-center gap-2.5 rounded-full px-4 py-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-[var(--omega-emerald)]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--omega-fg-dim)]">
            Omega OS · v3 — online
          </span>
        </motion.div>

        {/* Title */}
        <h1 className="font-display text-[clamp(2.6rem,8vw,6.5rem)] font-bold leading-[0.98] tracking-tight">
          <RevealText
            as="span"
            className="block text-[var(--omega-fg)]"
            text="THE OMEGA AI"
            delay={0.4}
            stagger={0.06}
          />
          <RevealText
            as="span"
            className="omega-text-aurora block"
            text="Operating System"
            delay={0.62}
            stagger={0.06}
          />
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 1.05 }}
          className="mt-7 max-w-xl text-base leading-relaxed text-[var(--omega-fg-dim)] sm:text-lg"
        >
          A living digital environment engineered for depth, motion, and craft.
          Intelligence at every layer — not a chatbot, an operating system.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 1.2 }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <OmegaButton size="lg" className="group" onClick={() => scrollTo("#capabilities")}>
            Enter Omega
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
              <path d="M3 8h9M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </OmegaButton>
          <OmegaButton size="lg" variant="ghost" onClick={() => scrollTo("#console")}>
            <Command className="h-4 w-4" />
            Open Console
          </OmegaButton>
        </motion.div>
      </motion.div>

      {/* Floating glass windows — parallax depth around the hero */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
        <FloatingGlass
          depth={1.4}
          floatPhase={0}
          className="absolute left-[6%] top-[26%] w-[230px]"
        >
          <HeroMiniPanel
            label="reasoning.trace"
            value="on"
            accent="emerald"
            lines={["plan → 6 steps", "tools → 3 invoked", "latency 412ms"]}
          />
        </FloatingGlass>
        <FloatingGlass
          depth={0.8}
          floatPhase={1.6}
          className="absolute right-[7%] top-[20%] w-[210px]"
        >
          <HeroMiniPanel
            label="memory.context"
            value="128k"
            accent="amber"
            lines={["thread · active", "embeddings · synced", "recall 0.94"]}
          />
        </FloatingGlass>
        <FloatingGlass
          depth={1.1}
          floatPhase={3.1}
          className="absolute bottom-[14%] left-[12%] w-[200px]"
        >
          <HeroMiniPanel
            label="render.fps"
            value="60"
            accent="rose"
            lines={["gpu · webgl2", "bloom · on", "particles 1800"]}
          />
        </FloatingGlass>
        <FloatingGlass
          depth={1.7}
          floatPhase={4.4}
          className="absolute bottom-[18%] right-[10%] w-[220px]"
        >
          <HeroMiniPanel
            label="voice.stream"
            value="live"
            accent="emerald"
            lines={["asr · 23ms", "tts · neural", "lang · auto"]}
          />
        </FloatingGlass>
      </div>

      {/* Scroll cue */}
      <motion.button
        onClick={() => scrollTo("#capabilities")}
        data-cursor="hover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[var(--omega-fg-dim)]"
        aria-label="Scroll to content"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-4 w-4 text-[var(--omega-emerald)]" />
        </motion.span>
      </motion.button>
    </section>
  );
}

function HeroMiniPanel({
  label,
  value,
  accent,
  lines,
}: {
  label: string;
  value: string;
  accent: "emerald" | "amber" | "rose";
  lines: string[];
}) {
  const accentColor =
    accent === "emerald"
      ? "var(--omega-emerald)"
      : accent === "amber"
      ? "var(--omega-amber)"
      : "var(--omega-rose)";
  return (
    <div className="omega-glass rounded-xl p-3.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--omega-fg-dim)]">
          {label}
        </span>
        <span
          className="font-mono text-[11px] font-semibold"
          style={{ color: accentColor }}
        >
          {value}
        </span>
      </div>
      <div className="mt-2.5 space-y-1.5">
        {lines.map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: accentColor, opacity: 0.7 - i * 0.18 }}
            />
            <span className="font-mono text-[10.5px] text-[var(--omega-fg-dim)]">
              {l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
