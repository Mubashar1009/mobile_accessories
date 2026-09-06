"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useProducts } from "@/core/product/useProducts";
import { searchProductsAction } from "@/app/actions/product.actions";
import { searchOffline, syncItems } from "@/lib/offlineSearchIndex";
import { PRODUCT_SEARCH_FIELDS } from "@/core/product/productSearchFields";
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedCallback";
import { ProductCard } from "@/components/ProductCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { OfflineSearchStatus } from "@/components/OfflineSearchStatus";
import { Package, RefreshCw, Loader2, Info, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types/product";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const { products, loading, isDemo, refetch } = useProducts();

  const [query, setQuery] = useState(initialQuery);
  // null means "no active search" — show the full product list below.
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchSeq = useRef(0);

  // Every keystroke updates the input immediately; the actual lookup fires
  // ~250ms after the user stops typing. A sequence number guards against an
  // older, slower lookup overwriting a newer one. While online, the search
  // hits the real backend (the same source of truth as the rest of the
  // app) and mirrors whatever it returns into the offline index, so those
  // results are still searchable the next time the user is offline. Only
  // when the browser is offline — or the network call itself fails — does
  // this fall back to the local IndexedDB mirror.
  const runSearch = useDebouncedCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }
    const seq = ++searchSeq.current;
    setIsSearching(true);

    const applyResults = (results: Product[]) => {
      if (seq !== searchSeq.current) return;
      setSearchResults(results);
      setIsSearching(false);
    };

    if (typeof navigator !== "undefined" && navigator.onLine) {
      searchProductsAction(trimmed)
        .then((results) => {
          syncItems(results, PRODUCT_SEARCH_FIELDS).catch(() => {});
          applyResults(results);
        })
        .catch(() => searchOffline<Product>(trimmed).then(applyResults));
    } else {
      searchOffline<Product>(trimmed).then(applyResults);
    }
  }, 250);

  useEffect(() => {
    runSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const filtered = searchResults ?? products;

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
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-9"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {isDemo && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm text-primary">
              <Info className="h-4 w-4 shrink-0" />
              <span>Showing demo products. Connect Supabase to load real data.</span>
            </div>
          )}

          <OfflineSearchStatus />

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Searching...</p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <>
              <div className="mb-4 flex justify-end border-b pb-3">
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
