"use client";

import { motion } from "framer-motion";
import { Check, Server, Cpu, Globe, Shield, CreditCard } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { SectionHeading } from "../ui/SectionHeading";

const TIERS = [
  {
    name: "Omega Free",
    price: "$0",
    desc: "Full power. No limits on capability.",
    icon: Cpu,
    accent: "#34d399",
    features: [
      "All 5 free models (DeepSeek, Nemotron, Mimo, North, Hy3)",
      "Multi-agent orchestration (6 agents)",
      "Code execution sandbox (Python/Node/Shell)",
      "Web search + deep research",
      "PC remote control via relay",
      "Google Drive sync + OAuth",
      "Image generation",
      "Full TUI with 11 themes",
    ],
    cta: "Start Free",
    href: "/chat",
    popular: false,
  },
  {
    name: "Omega Pro",
    price: "$10",
    period: "/mo",
    desc: "For teams who ship daily",
    icon: Server,
    accent: "#fbbf24",
    features: [
      "Everything in Free",
      "Custom API endpoints (your models)",
      "10x rate limits (600 req/min)",
      "Priority relay server",
      "Team workspaces + shared memory",
      "SSO (Google, GitHub, SAML)",
      "Audit logs + compliance export",
      "Dedicated support channel",
    ],
    cta: "Upgrade to Pro",
    href: "#",
    popular: true,
  },
  {
    name: "Omega Enterprise",
    price: "$20",
    period: "/mo",
    desc: "For organizations that demand control",
    icon: Shield,
    accent: "#818cf8",
    features: [
      "Everything in Pro",
      "Unlimited rate limits",
      "Self-hosted deployment (your cloud, your data)",
      "White-label: your brand, your domain",
      "Custom model deployment (your weights)",
      "SOC2 / HIPAA / GDPR ready",
      "99.99% uptime SLA",
      "24/7 dedicated engineer",
      "Source code access",
    ],
    cta: "Contact Sales",
    href: "#",
    popular: false,
  },
];

export function OmegaPricing() {
  return (
    <section
      id="pricing"
      className="relative mx-auto max-w-6xl px-4 py-28 sm:py-36"
    >
      <SectionHeading
        kicker="Pricing"
        title="Omega Provider API"
        subtitle="Deploy OpenAI-compatible model endpoints with zero setup. Free tier included — scale when you need it."
      />

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {TIERS.map((tier, i) => {
          const Icon = tier.icon;
          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative"
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                  <span
                    className="inline-block rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest"
                    style={{
                      background: "var(--omega-emerald)",
                      color: "oklch(0.06 0.01 264)",
                    }}
                  >
                    Most Popular
                  </span>
                </div>
              )}
              <GlassCard
                tilt={false}
                className={`h-full ${tier.popular ? "ring-1 ring-[var(--omega-emerald)]/40" : ""}`}
              >
                <div className="flex h-full flex-col p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className="grid size-10 place-items-center rounded-xl"
                      style={{
                        background: `color-mix(in oklch, ${tier.accent} 14%, transparent)`,
                        color: tier.accent,
                      }}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <div className="font-display text-base font-semibold text-[var(--omega-fg)]">
                        {tier.name}
                      </div>
                      <div className="text-xs text-[var(--omega-fg-dim)]">
                        {tier.desc}
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <span className="font-display text-3xl font-bold tracking-tight text-[var(--omega-fg)]">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="ml-1 text-sm text-[var(--omega-fg-dim)]">
                        {tier.period}
                      </span>
                    )}
                  </div>

                  <ul className="mb-6 flex flex-col gap-2.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[var(--omega-fg-dim)]">
                        <Check
                          className="mt-0.5 size-3.5 shrink-0"
                          style={{ color: tier.accent }}
                          strokeWidth={2.5}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <a
                      href={tier.href}
                      data-cursor="hover"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300"
                      style={{
                        background:
                          tier.popular
                            ? "var(--omega-emerald)"
                            : "var(--omega-bg-2)",
                        color: tier.popular
                          ? "oklch(0.06 0.01 264)"
                          : "var(--omega-fg)",
                      }}
                    >
                      <CreditCard className="size-4" strokeWidth={2} />
                      {tier.cta}
                    </a>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mx-auto mt-10 max-w-2xl text-center text-xs text-[var(--omega-muted)]"
      >
        All plans include the same core API. Upgrade unlocks higher rate limits,
        dedicated infrastructure, and support. No hidden fees — cancel anytime.
      </motion.p>
    </section>
  );
}
