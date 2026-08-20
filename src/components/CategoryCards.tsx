"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import Link from "next/link";
import { ArrowRight, Headphones, Speaker, Battery, Radio, MapPin, Tv, Cpu, Cable } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Grid } from "@/components/ui/grid";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";

const categories = [
  { name: "Earbuds", count: "25+ Products", icon: Radio, href: "/earbuds", bg: "bg-teal-500", lightBg: "bg-teal-500/10", textColor: "text-teal-600" },
  { name: "Headphones", count: "18+ Products", icon: Headphones, href: "/headphones", bg: "bg-violet-500", lightBg: "bg-violet-500/10", textColor: "text-violet-600" },
  { name: "Speakers", count: "12+ Products", icon: Speaker, href: "/speakers", bg: "bg-orange-500", lightBg: "bg-orange-500/10", textColor: "text-orange-600" },
  { name: "Power Banks", count: "15+ Products", icon: Battery, href: "/power-banks", bg: "bg-blue-500", lightBg: "bg-blue-500/10", textColor: "text-blue-600" },
  { name: "Smart Trackers", count: "8+ Products", icon: MapPin, href: "/smart-trackers", bg: "bg-rose-500", lightBg: "bg-rose-500/10", textColor: "text-rose-600" },
  { name: "LCD Panels", count: "40+ Products", icon: Tv, href: "/lcd-panels", bg: "bg-amber-500", lightBg: "bg-amber-500/10", textColor: "text-amber-600" },
  { name: "Parts", count: "50+ Products", icon: Cpu, href: "/parts", bg: "bg-emerald-500", lightBg: "bg-emerald-500/10", textColor: "text-emerald-600" },
  { name: "Cables", count: "30+ Products", icon: Cable, href: "/cables", bg: "bg-indigo-500", lightBg: "bg-indigo-500/10", textColor: "text-indigo-600" },
];

export function CategoryCards() {
  return (
    <Box as="section" id="categories" className="bg-background">
      <Box className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <ScrollReveal>
          <Flex align="end" justify="between" className="mb-6 sm:mb-8">
            <Box>
              <Heading level="h2" className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Shop by Category
              </Heading>
              <Paragraph className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Browse our premium collection of accessories
              </Paragraph>
            </Box>
            <Link
              href="/search?q="
              className="hidden items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80 sm:flex"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Flex>
        </ScrollReveal>

        <Grid cols={2} gap="sm" className="gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat.name} delay={i * 60}>
              <Link
                href={cat.href}
                className="group relative overflow-hidden rounded-2xl border bg-card/80 p-3.5 sm:p-5 transition-all duration-300 hover:shadow-md hover:border-primary/40 hover:-translate-y-1 block h-full flex flex-col justify-between"
              >
                <div>
                  <Box
                    className={`mb-2.5 sm:mb-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${cat.lightBg}`}
                  >
                    <cat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${cat.textColor}`} />
                  </Box>
                  <Heading
                    level="h3"
                    className="text-xs sm:text-base font-bold text-foreground leading-snug tracking-tight"
                  >
                    {cat.name}
                  </Heading>
                  <Paragraph className="mt-0.5 text-[11px] sm:text-xs font-medium text-muted-foreground">
                    {cat.count}
                  </Paragraph>
                </div>

                <Flex
                  align="center"
                  gap="xs"
                  className="mt-3 text-xs font-semibold text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100 hidden sm:flex"
                >
                  Explore <ArrowRight className="h-3 w-3" />
                </Flex>

                {/* Subtle Decorative Ambient Background Circle */}
                <Box
                  className={`absolute -bottom-4 -right-4 h-16 w-16 sm:h-20 sm:w-20 rounded-full ${cat.bg} opacity-10 transition-opacity duration-300 group-hover:opacity-20 pointer-events-none`}
                />
              </Link>
            </ScrollReveal>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
