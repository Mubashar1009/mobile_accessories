// Re-export Product type from IndexedDB module as the single source of truth
export type { Product } from "./db";

import { z } from "zod";

export const productSchema = z.object({
  title: z.string().trim().min(1, "Product name is required").max(100, "Product name must be 100 characters or less"),
  description: z.string().trim().nullable().optional(),
  price: z.number().min(0, "Price must be 0 or greater"),
  original_price: z.number().min(0, "Original price must be 0 or greater").nullable().optional(),
  category: z.string().trim().min(1, "Category is required"),
  colors: z.string().trim().nullable().optional(),
  tag: z.string().trim().nullable().optional(),
  is_out_of_stock: z.boolean().optional(),
});
