"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import Link from "next/link";
import { ArrowRight, Headphones, Speaker, Battery, Radio, MapPin } from "lucide-react";

const categories = [
  { name: "Earbuds", count: "25+ Products", icon: Radio, href: "/earbuds", bg: "bg-teal-500", lightBg: "bg-teal-500/10", textColor: "text-teal-600" },
  { name: "Headphones", count: "18+ Products", icon: Headphones, href: "/headphones", bg: "bg-violet-500", lightBg: "bg-violet-500/10", textColor: "text-violet-600" },
  { name: "Speakers", count: "12+ Products", icon: Speaker, href: "/speakers", bg: "bg-orange-500", lightBg: "bg-orange-500/10", textColor: "text-orange-600" },
  { name: "Power Banks", count: "15+ Products", icon: Battery, href: "/power-banks", bg: "bg-blue-500", lightBg: "bg-blue-500/10", textColor: "text-blue-600" },
  { name: "Smart Trackers", count: "8+ Products", icon: MapPin, href: "/smart-trackers", bg: "bg-rose-500", lightBg: "bg-rose-500/10", textColor: "text-rose-600" },
];

export function CategoryCards() {
  return (
    <section id="categories" className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <ScrollReveal className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Shop by Category</h2>
            <p className="mt-1 text-sm text-muted-foreground">Find exactly what you need</p>
          </div>
          <Link href="/search?q=" className="hidden items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80 sm:flex">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat.name} delay={i * 80}>
              <Link href={cat.href} className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 block">
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${cat.lightBg}`}>
                  <cat.icon className={`h-7 w-7 ${cat.textColor}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground">{cat.name}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{cat.count}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-all group-hover:opacity-100">
                  Shop Now <ArrowRight className="h-3.5 w-3.5" />
                </div>
                <div className={`absolute -bottom-6 -right-6 h-24 w-24 rounded-full ${cat.bg} opacity-10 transition-opacity group-hover:opacity-20`} />
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
