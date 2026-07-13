"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowRight, Zap, Play } from "lucide-react";
import Image from "next/image";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";

export function HeroBanner() {
  return (
    <Box as="section" className="relative overflow-hidden bg-gradient-to-br from-foreground via-foreground/95 to-primary/20">
      {/* Background pattern */}
      <Box className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
        backgroundSize: "40px 40px"
      }} />

      <Box className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
        <Flex align="center" gap="xl" className="flex-col md:flex-row lg:gap-12">
          {/* Left: Text content */}
          <ScrollReveal delay={0} className="flex-1 md:flex-[1.2] text-center md:text-left">
            <Flex align="center" gap="sm" className="mb-4 inline-flex rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              New Collection 2026
            </Flex>

            <Heading level="h1" className="text-3xl font-extrabold leading-tight tracking-tight text-background sm:text-4xl lg:text-5xl xl:text-6xl">
              Smart Wearables
              <br />
              <Box as="span" className="text-primary">&amp; Tech Accessories</Box>
            </Heading>

            <Paragraph className="mt-4 max-w-lg text-base text-background/70 sm:text-lg">
              Premium audio, power, and smart devices — designed for the modern lifestyle. Order directly via WhatsApp.
            </Paragraph>

            <Flex gap="sm" className="mt-6 flex-col sm:flex-row sm:justify-center md:justify-start">
              <a
                href="#products"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 whitespace-nowrap"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#categories"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-background/20 px-7 py-3.5 text-sm font-bold text-background transition-colors hover:bg-background/10 whitespace-nowrap"
              >
                <Play className="h-4 w-4" />
                Browse Categories
              </a>
            </Flex>

            {/* Trust indicators */}
            <Flex wrap="wrap" align="center" justify="center" gap="lg" className="mt-8 md:justify-start">
              <Box className="text-center">
                <Box className="text-2xl font-extrabold text-primary">70M+</Box>
                <Box className="text-xs text-background/50">Happy Customers</Box>
              </Box>
              <Box className="h-8 w-px bg-background/20" />
              <Box className="text-center">
                <Box className="text-2xl font-extrabold text-primary">365</Box>
                <Box className="text-xs text-background/50">Days Warranty</Box>
              </Box>
              <Box className="h-8 w-px bg-background/20" />
              <Box className="text-center">
                <Box className="text-2xl font-extrabold text-primary">4.8★</Box>
                <Box className="text-xs text-background/50">Avg. Rating</Box>
              </Box>
            </Flex>
          </ScrollReveal>

          {/* Right: Featured product showcase */}
          <ScrollReveal delay={150} className="flex-1 md:flex-[0.8] flex items-center justify-center w-full">
            <Box className="relative flex items-center justify-center w-full max-w-[480px]">
              {/* Background decorative glows */}
              <Box className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-violet-500/30 rounded-full blur-3xl opacity-60 animate-pulse" />
              
              <Image
                src="/hero_showcase.png"
                alt="Al-Rehman Premium Wearables"
                width={480}
                height={420}
                className="relative z-10 w-full h-auto max-h-[420px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)] select-none pointer-events-none transition-transform duration-500 hover:scale-105 rounded-3xl"
                priority
              />

              {/* Floating badge - top right */}
              <Flex align="center" justify="center" className="absolute -right-3 -top-3 z-20 h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/30 sm:-right-4 sm:-top-4 sm:h-16 sm:w-16">
                <Box className="text-center text-primary-foreground">
                  <Box className="text-lg font-black leading-none">23%</Box>
                  <Box className="text-[8px] font-medium uppercase">OFF</Box>
                </Box>
              </Flex>

              {/* Floating review - bottom left */}
              <Box className="absolute -bottom-2 -left-4 z-20 rounded-xl border border-background/10 bg-background/10 px-3 py-2 backdrop-blur sm:-bottom-3 sm:-left-6">
                <Flex align="center" gap="xs">
                  <Flex gap="none" className="-space-x-1.5">
                    {[0,1,2].map(i => (
                      <Box key={i} className="h-5 w-5 rounded-full bg-primary/40 ring-1 ring-background/20" />
                    ))}
                  </Flex>
                  <Box as="span" className="text-xs font-medium text-background/80">2.4k+ Reviews</Box>
                </Flex>
              </Box>
            </Box>
          </ScrollReveal>
        </Flex>
      </Box>
    </Box>
  );
}
