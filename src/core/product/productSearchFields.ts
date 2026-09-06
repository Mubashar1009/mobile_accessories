import type { Product } from "@/types/product";

/** Fields tokenized into the offline search index — shared so a sync and a
 * search always agree on what's indexed. */
export const PRODUCT_SEARCH_FIELDS: (keyof Product)[] = ["title", "description", "tag", "category"];
