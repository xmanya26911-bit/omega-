"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef, type MouseEvent } from "react";
import { SectionHeading } from "../ui/SectionHeading";
import { GlassCard } from "../ui/GlassCard";

interface Node {
  x: number;
  y: number;
  layer: number;
}
interface Edge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const LAYERS = [5, 8, 8, 6, 3];
const W = 100;
const H = 64;

/**
 * OmegaNeural — interactive holographic neural-network visualization.
 * A layered net with flowing energy along edges and traveling signal pulses,
 * wrapped in a tilted glass holographic panel. Cursor proximity raises a scan
 * light across the field.
 */
export function OmegaNeural() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const panelRot = useTransform(scrollYProgress, [0, 1], [10, -10]);

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const colX = LAYERS.map(
      (_, i) => 8 + (i * (W - 16)) / (LAYERS.length - 1)
    );
    LAYERS.forEach((count, li) => {
      for (let i = 0; i < count; i++) {
        const y = 8 + (i * (H - 16)) / Math.max(1, count - 1);
        nodes.push({ x: colX[li], y, layer: li });
      }
    });
    const edges: Edge[] = [];
    for (let li = 0; li < LAYERS.length - 1; li++) {
      const from = nodes.filter((n) => n.layer === li);
      const to = nodes.filter((n) => n.layer === li + 1);
      from.forEach((a) => {
        to.forEach((b) => {
          edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
        });
      });
    }
    return { nodes, edges };
  }, []);

  // pick a few edges for traveling signal pulses
  const signalEdges = useMemo(
    () =>
      Array.from({ length: 9 }, () => edges[Math.floor(Math.random() * edges.length)]),
    [edges]
  );

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = panelRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <section
      id="neural"
      ref={sectionRef}
      className="relative mx-auto max-w-6xl px-4 py-28 sm:py-36"
    >
      <SectionHeading
        kicker="Neural Core"
        title="A network you can feel"
        subtitle="Omega's cognition is a living graph — energy flows layer to layer in real time. Watch it think."
      />

      <div className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Holographic panel */}
        <motion.div style={{ rotateY: panelRot, transformPerspective: 1600 }}>
          <div
            ref={panelRef}
            onMouseMove={onMouseMove}
            className="relative"
            style={{ ["--mx" as string]: "50%", ["--my" as string]: "30%" }}
          >
            <GlassCard tilt={false} className="h-full">
              <div className="relative overflow-hidden rounded-2xl p-5 sm:p-7">
                {/* cursor scan light */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-70"
                  style={{
                    background:
                      "radial-gradient(180px circle at var(--mx) var(--my), oklch(0.82 0.17 162 / 0.16), transparent 60%)",
                  }}
                />
                {/* header */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--omega-emerald)] shadow-[0_0_10px_var(--omega-emerald)]" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--omega-fg-dim)]">
                      cognition.graph · live
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--omega-fg-dim)]">
                    {nodes.length}n · {edges.length}e
                  </span>
                </div>

                {/* SVG network */}
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="relative mt-4 h-[280px] w-full sm:h-[340px]"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* edges */}
                  <g opacity="0.5">
                    {edges.map((e, i) => (
                      <line
                        key={i}
                        x1={e.x1}
                        y1={e.y1}
                        x2={e.x2}
                        y2={e.y2}
                        stroke="oklch(0.82 0.17 162 / 0.18)"
                        strokeWidth={0.18}
                      />
                    ))}
                  </g>
                  {/* flowing energy on a subset */}
                  <g>
                    {signalEdges.map((e, i) => (
                      <line
                        key={`f-${i}`}
                        x1={e.x1}
                        y1={e.y1}
                        x2={e.x2}
                        y2={e.y2}
                        stroke="oklch(0.82 0.17 162 / 0.9)"
                        strokeWidth={0.28}
                        strokeDasharray="2 14"
                        strokeLinecap="round"
                        style={{
                          animation: `neural-flow ${2 + (i % 4) * 0.4}s linear infinite`,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </g>
                  {/* traveling signal dots */}
                  {signalEdges.map((e, i) => (
                    <motion.circle
                      key={`s-${i}`}
                      r={0.7}
                      fill={i % 3 === 0 ? "oklch(0.85 0.15 82)" : "oklch(0.82 0.17 162)"}
                      initial={{ cx: e.x1, cy: e.y1, opacity: 0 }}
                      animate={{ cx: [e.x1, e.x2], cy: [e.y1, e.y2], opacity: [0, 1, 0] }}
                      transition={{
                        duration: 1.6 + (i % 5) * 0.3,
                        repeat: Infinity,
                        delay: i * 0.25,
                        ease: "easeInOut",
                      }}
                      style={{ filter: "drop-shadow(0 0 1px oklch(0.82 0.17 162 / 0.8))" }}
                    />
                  ))}
                  {/* nodes */}
                  {nodes.map((n, i) => (
                    <g key={i}>
                      <motion.circle
                        cx={n.x}
                        cy={n.y}
                        r={1.5}
                        fill="oklch(0.16 0.01 264 / 0.9)"
                        stroke="oklch(0.82 0.17 162 / 0.8)"
                        strokeWidth={0.3}
                        animate={{ r: [1.5, 1.9, 1.5] }}
                        transition={{
                          duration: 2.4,
                          repeat: Infinity,
                          delay: (i % 7) * 0.2,
                          ease: "easeInOut",
                        }}
                      />
                      <motion.circle
                        cx={n.x}
                        cy={n.y}
                        r={0.6}
                        fill="oklch(0.82 0.17 162)"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          delay: (i % 5) * 0.18,
                        }}
                      />
                    </g>
                  ))}
                </svg>

                {/* footer readout */}
                <div className="relative mt-3 grid grid-cols-3 gap-2 border-t border-[var(--omega-glass-border)] pt-3 font-mono text-[10px] text-[var(--omega-fg-dim)]">
                  <Readout label="throughput" value="2.4k tok/s" />
                  <Readout label="layers" value={`${LAYERS.length}`} />
                  <Readout label="coherence" value="0.98" />
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>

        {/* Side copy */}
        <div className="flex flex-col justify-center gap-6">
          {[
            {
              k: "Graph runtime",
              v: "Omega executes as a directed graph — not a linear prompt. Parallel branches, conditional routing, and verifiable tool calls.",
              c: "var(--omega-emerald)",
            },
            {
              k: "Streaming cognition",
              v: "Every edge is observable. Watch signals propagate, branch, and resolve in real time as the model reasons.",
              c: "var(--omega-amber)",
            },
            {
              k: "Adaptive depth",
              v: "Compute scales with difficulty. Easy queries finish in one pass; hard ones unfold across the network automatically.",
              c: "var(--omega-rose)",
            },
          ].map((item, i) => (
            <motion.div
              key={item.k}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="omega-glass-thin rounded-xl p-5"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.c }} />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--omega-fg-dim)]">
                  {item.k}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--omega-fg)]/85">
                {item.v}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes neural-flow {
          to { stroke-dashoffset: -16; }
        }
      `}</style>
    </section>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="uppercase tracking-wider opacity-60">{label}</span>
      <span className="text-[var(--omega-fg)]">{value}</span>
    </div>
  );
}
