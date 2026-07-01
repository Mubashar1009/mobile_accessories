"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { Cpu, ShieldCheck, Box, MessageSquareCode } from "lucide-react";

const qaPillars = [
  {
    icon: Cpu,
    title: "Double-Pass Bench Testing",
    description: "Every replacement screen, battery, and audio device undergoes manual test-bench calibration for touch precision, color accuracy, and voltage stability before dispatch.",
    tag: "100% Tested"
  },
  {
    icon: ShieldCheck,
    title: "OEM Sourcing Standards",
    description: "We source directly from certified tier-1 component manufacturers. Every part adheres strictly to original equipment specifications for durable performance.",
    tag: "Genuine Grade"
  },
  {
    icon: Box,
    title: "ESD Protected Packaging",
    description: "Delicate components are sealed in anti-static ESD bags and encased inside custom shock-proof multi-layer foam boxes, guaranteeing damage-free delivery.",
    tag: "Secure Transit"
  },
  {
    icon: MessageSquareCode,
    title: "Direct WhatsApp Support",
    description: "Have questions about a part or need installation guidance? Our in-house tech experts are available on WhatsApp to assist you through the process.",
    tag: "Expert Guided"
  }
];

export function QualityShowcase() {
  return (
    <section className="bg-zinc-950 text-white relative overflow-hidden py-16 sm:py-24">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <ScrollReveal className="mb-14 text-center max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
            Quality Guaranteed
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Engineered for Precision
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            We don't just sell components; we engineer confidence. Learn how Al-Rehman Mobile Shop sets the standard for quality assurance.
          </p>
        </ScrollReveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {qaPillars.map((pillar, i) => (
            <ScrollReveal
              key={pillar.title}
              delay={i * 100}
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-zinc-900"
            >
              {/* Top gradient glow on hover */}
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/40 transition-all duration-500" />
              
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/80 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all duration-300">
                  <pillar.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 group-hover:text-emerald-400 transition-colors">
                  {pillar.tag}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors">
                {pillar.title}
              </h3>
              
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300 transition-colors">
                {pillar.description}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
