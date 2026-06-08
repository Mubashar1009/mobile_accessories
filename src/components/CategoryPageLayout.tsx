"use client";

import { useMemo } from "react";
import { useProducts } from "@/components/ProductProvider";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Package, WifiOff, RefreshCw, Loader2, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/db";
import { matchesCategory, CATEGORIES } from "@/lib/db";
import Link from "next/link";

interface CategoryPageLayoutProps {
  slug: string;
}

export function CategoryPageLayout({ slug }: CategoryPageLayoutProps) {
  const { products, loading, refreshing, isOffline, isDemo, refetch } = useProducts();
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const label = cat?.label ?? slug;
  const filtered = useMemo(() => products.filter((p) => matchesCategory(p, slug)), [products, slug]);

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />

      {/* Category Header */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {label}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse our collection of {label.toLowerCase()}
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-6">
          {/* Demo Mode Banner */}
          {isDemo && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm text-primary">
              <Info className="h-4 w-4 shrink-0" />
              <span>Showing demo products. Connect Supabase to load real data.</span>
            </div>
          )}

          {/* Offline Banner */}
          {isOffline && !isDemo && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-700 dark:text-yellow-400">
              <WifiOff className="h-4 w-4 shrink-0" />
              <span>You are offline. Showing cached products.</span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Loading {label.toLowerCase()}...</p>
            </div>
          )}

          {/* Products grid */}
          {!loading && filtered.length > 0 && (
            <>
              <div className="mb-4 flex items-end justify-between border-b pb-3">
                <p className="text-sm text-muted-foreground">
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
                </p>
                <Button variant="outline" size="sm" onClick={refetch} className="gap-2 rounded-lg">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20">
              <Package className="mb-4 h-16 w-16 text-muted-foreground/50" />
              <h2 className="text-xl font-bold text-foreground">No {label} Found</h2>
              <p className="mt-2 text-sm text-muted-foreground">Check back soon for new arrivals!</p>
              <Link href="/" className="mt-4">
                <Button variant="outline" className="gap-2 rounded-lg">
                  <ArrowLeft className="h-4 w-4" />
                  Browse All Products
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
