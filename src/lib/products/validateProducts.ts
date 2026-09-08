import { dbProductSchema, type Product } from "@/types/product";

/**
 * Drops rows that don't match the DB product shape instead of letting them
 * reach a component and crash a render (e.g. `product.price.toFixed` on a
 * row whose price came back null).
 *
 * Applied to BOTH sources of product rows — the Server Action response and
 * the IndexedDB offline cache — so a single definition lives here rather
 * than one copy per caller. The cache in particular can hold rows written
 * by an older version of the app, so it is not more trustworthy than the
 * network.
 */
export function validateProducts(products: unknown[]): Product[] {
  const validProducts: Product[] = [];
  for (const item of products) {
    const validation = dbProductSchema.safeParse(item);
    if (validation.success) {
      validProducts.push(validation.data as Product);
    } else {
      console.warn("Invalid product item detected, skipping:", validation.error.format());
    }
  }
  return validProducts;
}
