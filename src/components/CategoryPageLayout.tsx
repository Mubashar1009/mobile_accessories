"use client";

import { useMemo } from "react";
import { useProducts } from "@/core/product/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Package, WifiOff, RefreshCw, Loader2, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Grid } from "@/components/ui/grid";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { CATEGORIES } from "@/types/product";
import { matchesCategory } from "@/core/product/categoryMapper";
import Link from "next/link";

interface CategoryPageLayoutProps {
  slug: string;
}

export function CategoryPageLayout({ slug }: CategoryPageLayoutProps) {
  const { products, loading, isOffline, isDemo, refetch } = useProducts();
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const label = cat?.label ?? slug;
  const filtered = useMemo(() => products.filter((p) => matchesCategory(p, slug)), [products, slug]);

  return (
    <Flex direction="col" className="flex-1">
      <Navbar />

      <Box as="section" className="border-b bg-muted/30">
        <Box className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Link href="/" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Heading level="h1" className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{label}</Heading>
          <Paragraph className="mt-1 text-sm text-muted-foreground">Browse our collection of {label.toLowerCase()}</Paragraph>
        </Box>
      </Box>

      <Box as="section" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Box className="space-y-6">
          {isDemo && (
            <Flex align="center" gap="sm" className="rounded-lg bg-primary/10 px-4 py-2.5 text-sm text-primary">
              <Info className="h-4 w-4 shrink-0" />
              <Box as="span">Showing demo products. Connect Supabase to load real data.</Box>
            </Flex>
          )}

          {isOffline && !isDemo && (
            <Flex align="center" gap="sm" className="rounded-lg bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-700 dark:text-yellow-400">
              <WifiOff className="h-4 w-4 shrink-0" />
              <Box as="span">You are offline. Showing cached products.</Box>
            </Flex>
          )}

          {loading && (
            <Flex direction="col" align="center" justify="center" className="py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <Paragraph className="mt-4 text-sm text-muted-foreground">Loading {label.toLowerCase()}...</Paragraph>
            </Flex>
          )}

          {!loading && filtered.length > 0 && (
            <>
              <Flex align="end" justify="between" className="border-b pb-3">
                <Paragraph className="text-sm text-muted-foreground">
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
                </Paragraph>
                <Button variant="outline" size="sm" onClick={refetch} className="gap-2 rounded-lg">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              </Flex>
              <Grid cols={2} gap="sm" className="sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filtered.map((product, i) => (
                  <ScrollReveal key={product.id} delay={i * 80}>
                    <ProductCard product={product} />
                  </ScrollReveal>
                ))}
              </Grid>
            </>
          )}

          {!loading && filtered.length === 0 && (
            <Flex direction="col" align="center" justify="center" className="rounded-xl border border-dashed py-20">
              <Package className="mb-4 h-16 w-16 text-muted-foreground/50" />
              <Heading level="h2" className="text-xl font-bold text-foreground">No {label} Found</Heading>
              <Paragraph className="mt-2 text-sm text-muted-foreground">Check back soon for new arrivals!</Paragraph>
              <Link href="/" className="mt-4">
                <Button variant="outline" className="gap-2 rounded-lg">
                  <ArrowLeft className="h-4 w-4" />
                  Browse All Products
                </Button>
              </Link>
            </Flex>
          )}
        </Box>
      </Box>

      <Footer />
    </Flex>
  );
}
