"use client";

import { motion } from "framer-motion";
import { Check, Server, Cpu, Globe, Shield, CreditCard } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { SectionHeading } from "../ui/SectionHeading";

const TIERS = [
  {
    name: "Free",
    price: "₹0",
    desc: "For individuals trying it out",
    icon: Cpu,
    accent: "#34d399",
    features: [
      "5 AI models",
      "30 messages per 3 hours",
      "DeepSeek, MiMo, Nemotron, more",
      "Code execution",
      "Web search",
    ],
    cta: "Get Started",
    href: "https://omega-chat-five.vercel.app/?needAuth=1",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹849",
    period: "/mo",
    desc: "For power users",
    icon: Server,
    accent: "#fbbf24",
    features: [
      "All Free features",
      "100 messages per 5 hours",
      "Faster response priority",
      "Memory & context sync",
      "Email support",
    ],
    cta: "Subscribe",
    href: "https://omega-payments.vercel.app/?plan=pro",
    popular: true,
  },
  {
    name: "Max",
    price: "₹1,699",
    period: "/mo",
    desc: "For unlimited usage",
    icon: Shield,
    accent: "#818cf8",
    features: [
      "All Pro features",
      "Unlimited messages",
      "No rate limiting",
      "Priority support",
      "Early access to new models",
    ],
    cta: "Subscribe Max",
    href: "https://omega-payments.vercel.app/?plan=max",
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
        subtitle="Free tier includes 5 AI models with 30 messages per 3 hours. Upgrade for higher limits."
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
        All plans include the same 5 AI models. Upgrade unlocks higher rate limits
        and priority support. No hidden fees — cancel anytime.
      </motion.p>
    </section>
  );
}
