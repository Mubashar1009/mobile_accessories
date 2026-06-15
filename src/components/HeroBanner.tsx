"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowRight, Zap, Play } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-foreground via-foreground/95 to-primary/20">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
        backgroundSize: "40px 40px"
      }} />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
          {/* Left: Text content */}
          <ScrollReveal delay={0} className="flex-1 text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              New Collection 2026
            </div>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-background sm:text-4xl lg:text-5xl xl:text-6xl">
              Smart Wearables
              <br />
              <span className="text-primary">&amp; Tech Accessories</span>
            </h1>

            <p className="mt-4 max-w-lg text-base text-background/70 sm:text-lg">
              Premium audio, power, and smart devices — designed for the modern lifestyle. Order directly via WhatsApp.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#products"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#categories"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-background/20 px-7 py-3.5 text-sm font-bold text-background transition-colors hover:bg-background/10"
              >
                <Play className="h-4 w-4" />
                Browse Categories
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-primary">70M+</div>
                <div className="text-xs text-background/50">Happy Customers</div>
              </div>
              <div className="h-8 w-px bg-background/20" />
              <div className="text-center">
                <div className="text-2xl font-extrabold text-primary">365</div>
                <div className="text-xs text-background/50">Days Warranty</div>
              </div>
              <div className="h-8 w-px bg-background/20" />
              <div className="text-center">
                <div className="text-2xl font-extrabold text-primary">4.8★</div>
                <div className="text-xs text-background/50">Avg. Rating</div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Featured product showcase */}
          <ScrollReveal delay={150} className="flex flex-1 items-center justify-center w-full">
            <div className="relative flex items-center justify-center w-full max-w-[480px]">
              {/* Background decorative glows */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-violet-500/30 rounded-full blur-3xl opacity-60 animate-pulse" />
              
              <img
                src="/hero_showcase.png"
                alt="Rehvox Premium Wearables"
                className="relative z-10 w-full h-auto max-h-[420px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)] select-none pointer-events-none transition-transform duration-500 hover:scale-105 rounded-3xl"
              />

              {/* Floating badge - top right */}
              <div className="absolute -right-3 -top-3 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 sm:-right-4 sm:-top-4 sm:h-16 sm:w-16">
                <div className="text-center text-primary-foreground">
                  <div className="text-lg font-black leading-none">23%</div>
                  <div className="text-[8px] font-medium uppercase">OFF</div>
                </div>
              </div>

              {/* Floating review - bottom left */}
              <div className="absolute -bottom-2 -left-4 z-20 rounded-xl border border-background/10 bg-background/10 px-3 py-2 backdrop-blur sm:-bottom-3 sm:-left-6">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="h-5 w-5 rounded-full bg-primary/40 ring-1 ring-background/20" />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-background/80">2.4k+ Reviews</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
