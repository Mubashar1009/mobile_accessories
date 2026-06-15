"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Ahmed R.", location: "Karachi", text: "The Evolve Earbuds are incredible! Crystal clear sound and the battery lasts all day. Best purchase I've made this year.", rating: 5, product: "Evolve Earbuds" },
  { name: "Sarah M.", location: "Lahore", text: "Ordered via WhatsApp and received my power bank the very next day. Amazing service and genuine product!", rating: 5, product: "Megawatt Power Bank" },
  { name: "Usman K.", location: "Islamabad", text: "The ANC on these headphones is next level. I use them daily for work calls and gaming. Totally worth the price.", rating: 4, product: "Magnus Headphones" },
];

export function Testimonials() {
  return (
    <section className="bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <ScrollReveal className="mb-10 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">What Our Customers Say</h2>
          <p className="mt-2 text-sm text-muted-foreground">Real reviews from verified buyers</p>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 100} className="relative rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <Quote className="mb-3 h-8 w-8 text-primary/20" />
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={`h-4 w-4 ${j < t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{t.product}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
