import type { Product } from "@/types/product";

/**
 * Calculates the discount percentage for a product.
 * Returns null if no original_price or no discount exists.
 */
export function getDiscount(product: Product): number | null {
  if (product.original_price && product.original_price > product.price) {
    return Math.round(
      ((product.original_price - product.price) / product.original_price) * 100
    );
  }
  return null;
}

/**
 * Returns true if the product was created within the last 7 days.
 */
export function isNew(product: Product): boolean {
  const weekAgo = Date.now() - 7 * 86400000;
  return new Date(product.created_at).getTime() > weekAgo;
}
