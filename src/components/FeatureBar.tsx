"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { Award, Headphones, RotateCcw, BadgeCheck } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Grid } from "@/components/ui/grid";
import { Paragraph } from "@/components/ui/paragraph";

const features = [
  { icon: BadgeCheck, label: "Certified", sublabel: "Genuine products" },
  { icon: RotateCcw, label: "7-Day Return", sublabel: "Easy returns" },
  { icon: Headphones, label: "24/7", sublabel: "WhatsApp support" },
  { icon: Award, label: "Best Price", sublabel: "Guaranteed" },
];

export function FeatureBar() {
  return (
    <Box as="section" className="border-y bg-card">
      <Box className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <Grid cols={2} gap="md" className="sm:grid-cols-4">
          {features.map((feat, i) => (
            <ScrollReveal key={feat.label} delay={i * 80}>
              <Flex align="center" gap="md">
                <Box className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <feat.icon className="h-5 w-5 text-primary" />
                </Box>
                <Box>
                  <Paragraph className="text-sm font-bold text-foreground">{feat.label}</Paragraph>
                  <Paragraph className="text-[11px] text-muted-foreground">{feat.sublabel}</Paragraph>
                </Box>
              </Flex>
            </ScrollReveal>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
