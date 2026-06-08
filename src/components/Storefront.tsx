"use client";

import { useMemo } from "react";
import { useProducts } from "@/components/ProductProvider";
import { ProductCard } from "@/components/ProductCard";
import { Package, WifiOff, RefreshCw, Loader2, Info, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/db";
import { isNew } from "@/lib/db";

export function Storefront() {
  const { products, loading, refreshing, isOffline, isDemo, refetch } = useProducts();

  const newProducts = useMemo(() => products.filter((p) => isNew(p) && !p.is_out_of_stock), [products]);
  const trendingProducts = useMemo(() => products.filter((p) => !isNew(p) && !p.is_out_of_stock), [products]);
  const allInStock = useMemo(() => products.filter((p) => !p.is_out_of_stock), [products]);
  const outOfStock = useMemo(() => products.filter((p) => p.is_out_of_stock), [products]);

  return (
    <div className="space-y-12">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm text-primary">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            Showing demo products. Connect Supabase to load real data from your database.
          </span>
        </div>
      )}

      {/* Offline Banner */}
      {isOffline && !isDemo && (
        <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-700 dark:text-yellow-400">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>You are offline. Showing cached products.</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading products...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20">
          <Package className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <h2 className="text-xl font-bold text-foreground">No Products Yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Check back soon for new arrivals!</p>
        </div>
      )}

      {/* New Arrivals Section */}
      {!loading && newProducts.length > 0 && (
        <ProductSection
          title="New Arrivals"
          subtitle="Fresh drops you don't want to miss"
          products={newProducts}
          highlight
        />
      )}

      {/* Top Trending Section */}
      {!loading && trendingProducts.length > 0 && (
        <ProductSection
          title="Top Trending"
          subtitle="Best sellers loved by our customers"
          products={trendingProducts}
        />
      )}

      {/* All Products (if no split possible) */}
      {!loading && allInStock.length > 0 && newProducts.length === 0 && trendingProducts.length === 0 && (
        <ProductSection
          title="Our Products"
          subtitle="Browse our complete collection"
          products={allInStock}
        />
      )}

      {/* Sold Out Section */}
      {!loading && outOfStock.length > 0 && (
        <ProductSection
          title="Sold Out"
          subtitle="These popular items are currently unavailable"
          products={outOfStock}
          muted
        />
      )}

      {/* Refresh */}
      {!loading && products.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" size="sm" onClick={refetch} className="gap-2 rounded-lg">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Products
          </Button>
        </div>
      )}
    </div>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
  highlight = false,
  muted = false,
}: {
  title: string;
  subtitle: string;
  products: Product[];
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <section id="products">
      {/* Section Header */}
      <div className="mb-6 flex items-end justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            {highlight && (
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
            <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h2>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <a
          href="#products"
          className="flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      {/* Product Grid */}
      <div className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 ${muted ? "opacity-70" : ""}`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
