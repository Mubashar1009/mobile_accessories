"use server";

import { revalidatePath } from "next/cache";
import { checkIsAdmin } from "@/lib/authz";
import { productService } from "@/lib/registry";
import type { ProductActionResult } from "@/lib/services/ProductService";
import type { Product, ProductInput } from "@/types/product";

const UNAUTHORIZED: ProductActionResult = {
  error: "Unauthorized: Only administrators can perform this action.",
};

// ── Fetch all products ──────────────────────────────────────────────────
export async function getProducts(): Promise<Product[]> {
  return productService.list();
}

// ── Search products by title/description ────────────────────────────────
export async function searchProductsAction(term: string): Promise<Product[]> {
  return productService.search(term);
}

// ── Create a product with image upload to Supabase Storage ──────────────
export async function createProduct(input: ProductInput, formData: FormData): Promise<ProductActionResult> {
  if (!(await checkIsAdmin())) {
    return UNAUTHORIZED;
  }

  const imageFile = formData.get("image") as File | null;
  const result = await productService.create(input, imageFile);
  if (result.success) {
    revalidatePath("/dashboard");
  }
  return result;
}

// ── Update product text details ─────────────────────────────────────────
export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
  formData?: FormData
): Promise<ProductActionResult> {
  if (!(await checkIsAdmin())) {
    return UNAUTHORIZED;
  }

  const imageFile = (formData?.get("image") as File | null) ?? null;
  const result = await productService.update(id, input, imageFile);
  if (result.success) {
    revalidatePath("/dashboard");
  }
  return result;
}

// ── Toggle out-of-stock status ──────────────────────────────────────────
export async function toggleOutOfStock(id: string, currentStatus: boolean): Promise<ProductActionResult> {
  if (!(await checkIsAdmin())) {
    return UNAUTHORIZED;
  }

  const result = await productService.toggleOutOfStock(id, currentStatus);
  if (result.success) {
    revalidatePath("/dashboard");
  }
  return result;
}

// ── Delete product and its image from bucket ────────────────────────────
export async function deleteProduct(id: string): Promise<ProductActionResult> {
  if (!(await checkIsAdmin())) {
    return UNAUTHORIZED;
  }

  const result = await productService.delete(id);
  if (result.success) {
    revalidatePath("/dashboard");
  }
  return result;
}
