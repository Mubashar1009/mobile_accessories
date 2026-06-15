"use client";

import { useMemo, Suspense } from "react";
import { useProducts } from "@/components/ProductProvider";
import { ProductCard } from "@/components/ProductCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Package, WifiOff, RefreshCw, Loader2, Info, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase().trim() ?? "";
  const { products, loading, isOffline, isDemo, refetch } = useProducts();

  const filtered = useMemo(() => {
    if (!query) return products;
    return products.filter((p) => {
      const text = `${p.title} ${p.description ?? ""} ${p.tag ?? ""} ${p.category ?? ""}`.toLowerCase();
      return text.includes(query);
    });
  }, [products, query]);

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />

      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Link href="/" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Search className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {query ? `Results for "${query}"` : "All Products"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-6">
          {isDemo && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm text-primary">
              <Info className="h-4 w-4 shrink-0" />
              <span>Showing demo products. Connect Supabase to load real data.</span>
            </div>
          )}

          {isOffline && !isDemo && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-700 dark:text-yellow-400">
              <WifiOff className="h-4 w-4 shrink-0" />
              <span>You are offline. Showing cached products.</span>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Searching...</p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <>
              <div className="mb-4 flex items-end justify-between border-b pb-3">
                <p className="text-sm text-muted-foreground">
                  Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </p>
                <Button variant="outline" size="sm" onClick={refetch} className="gap-2 rounded-lg">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filtered.map((product, i) => (
                  <ScrollReveal key={product.id} delay={i * 80}>
                    <ProductCard product={product} />
                  </ScrollReveal>
                ))}
              </div>
            </>
          )}

          {!loading && filtered.length === 0 && query && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20">
              <Package className="mb-4 h-16 w-16 text-muted-foreground/50" />
              <h2 className="text-xl font-bold text-foreground">No Results Found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We couldn&apos;t find any products matching &ldquo;{query}&rdquo;
              </p>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
