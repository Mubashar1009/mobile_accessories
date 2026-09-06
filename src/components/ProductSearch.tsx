"use client";

import { Loader2, Search } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";

/**
 * Debounced product search — the network request only fires 300ms after
 * the user stops typing (see useProducts/useDebouncedCallback), but the
 * input itself never lags behind keystrokes.
 */
export function ProductSearch() {
  const { searchTerm, searchResults, isSearching, setSearchTerm } = useProducts();

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {searchTerm.trim() && (
        <ul className="divide-y rounded-md border">
          {searchResults.length === 0 && !isSearching && (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              No products found for &ldquo;{searchTerm}&rdquo;
            </li>
          )}
          {searchResults.map((product) => (
            <li key={product.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-medium text-foreground">{product.title}</span>
              <span className="text-muted-foreground">${product.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
