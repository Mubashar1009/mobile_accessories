import "server-only";

import { productSchema, type Product, type ProductInput } from "@/types/product";
import { validateImageUpload } from "@/lib/security/imageUpload";
import { logger } from "@/lib/logger";
import { BaseDomainService } from "./BaseDomainService";

const PRODUCT_IMAGES_BUCKET = "product-images";

/** Columns `search()` matches against, OR-ed together by the adapter. */
const PRODUCT_SEARCH_COLUMNS = ["title", "description"];

export interface ProductActionResult {
  success?: boolean;
  error?: string;
}

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function storagePathFromUrl(url: string): string | undefined {
  return url.split(`/${PRODUCT_IMAGES_BUCKET}/`)[1];
}

/**
 * Builds the stored object name.
 *
 * The extension comes from the VALIDATED content type, never from
 * `file.name` — the client controls the filename, and letting it pick the
 * stored extension meant it could choose how the public bucket later serves
 * the object (`.html`, `.svg`, …) regardless of the bytes inside.
 */
function buildFileName(extension: string): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
}

/**
 * Backend domain service for product CRUD + image lifecycle.
 * Authorization (admin-only) is deliberately NOT checked here: that's a
 * per-call concern handled at the Server Action boundary (see
 * app/actions/product.actions.ts), consistent with auth never being
 * constructor-injected into a domain service.
 */
export class ProductService extends BaseDomainService {
  async list(): Promise<Product[]> {
    try {
      return await this.db.list<Product>("products", {
        orderBy: "created_at",
        ascending: false,
      });
    } catch (err) {
      logger.error("ProductService.list failed", err);
      return [];
    }
  }

  /**
   * Case-insensitive substring search over title/description, run BY THE
   * DATABASE via `QueryOptions.search` (SQL `ILIKE`).
   *
   * This used to call `list()` and filter the whole table in memory, which
   * meant every keystroke of the debounced admin search pulled the entire
   * catalog over the wire to throw most of it away. The adapter layer now
   * expresses ILIKE natively, so only matching rows are transferred.
   *
   * An empty term returns the full list rather than searching for "" — the
   * adapters ignore a blank term, but going through `list()` here keeps that
   * intent explicit at the call site.
   */
  async search(term: string): Promise<Product[]> {
    const trimmed = term.trim();
    if (!trimmed) {
      return this.list();
    }

    try {
      return await this.db.list<Product>("products", {
        search: { columns: PRODUCT_SEARCH_COLUMNS, term: trimmed },
        orderBy: "created_at",
        ascending: false,
      });
    } catch (err) {
      logger.error("ProductService.search failed", err, { term: trimmed });
      return [];
    }
  }

  async create(input: ProductInput, imageFile: File | null): Promise<ProductActionResult> {
    const validation = productSchema.safeParse(input);
    if (!validation.success) {
      return { error: `Validation error: ${validation.error.issues.map((e) => e.message).join(", ")}` };
    }
    const validatedData = validation.data;

    let image_url: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const imageCheck = validateImageUpload(imageFile);
      if (!imageCheck.ok) {
        return { error: imageCheck.error };
      }
      try {
        const uploaded = await this.storage.upload(
          PRODUCT_IMAGES_BUCKET,
          buildFileName(imageCheck.extension),
          imageFile
        );
        image_url = uploaded.url;
      } catch (err) {
        return { error: `Image upload failed: ${toErrorMessage(err, "Unknown error")}` };
      }
    }

    try {
      await this.db.create<Product>("products", {
        title: validatedData.title,
        description: validatedData.description ?? null,
        price: validatedData.price,
        original_price: validatedData.original_price ?? null,
        tag: validatedData.tag ?? null,
        category: validatedData.category ?? null,
        colors: validatedData.colors ?? null,
        image_url,
        is_out_of_stock: validatedData.is_out_of_stock ?? false,
      });
    } catch (err) {
      // Clean up the uploaded image if the DB insert fails.
      if (image_url) {
        const path = storagePathFromUrl(image_url);
        if (path) await this.storage.remove(PRODUCT_IMAGES_BUCKET, [path]);
      }
      return { error: `Failed to create product: ${toErrorMessage(err, "Unknown error")}` };
    }

    return { success: true };
  }

  async update(
    id: string,
    input: Partial<ProductInput>,
    imageFile: File | null
  ): Promise<ProductActionResult> {
    const validation = productSchema.partial().safeParse(input);
    if (!validation.success) {
      return { error: `Validation error: ${validation.error.issues.map((e) => e.message).join(", ")}` };
    }
    const validatedData = validation.data;

    const updateData: Record<string, unknown> = {};
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.price !== undefined) updateData.price = validatedData.price;
    if (validatedData.is_out_of_stock !== undefined) updateData.is_out_of_stock = validatedData.is_out_of_stock;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.colors !== undefined) updateData.colors = validatedData.colors;
    if (validatedData.original_price !== undefined) updateData.original_price = validatedData.original_price;
    if (validatedData.tag !== undefined) updateData.tag = validatedData.tag;

    if (imageFile && imageFile.size > 0) {
      const imageCheck = validateImageUpload(imageFile);
      if (!imageCheck.ok) {
        return { error: imageCheck.error };
      }

      // Fetch the existing row first so the old image can be cleaned up
      // once the new one is confirmed uploaded.
      const existing = await this.db.get<Product>("products", id);

      try {
        const uploaded = await this.storage.upload(
          PRODUCT_IMAGES_BUCKET,
          buildFileName(imageCheck.extension),
          imageFile
        );
        updateData.image_url = uploaded.url;
      } catch (err) {
        return { error: `Image upload failed: ${toErrorMessage(err, "Unknown error")}` };
      }

      if (existing?.image_url) {
        const oldPath = storagePathFromUrl(existing.image_url);
        if (oldPath) {
          await this.storage.remove(PRODUCT_IMAGES_BUCKET, [oldPath]);
        }
      }
    }

    try {
      await this.db.update<Product>("products", id, updateData as Partial<Product>);
    } catch (err) {
      return { error: `Failed to update product: ${toErrorMessage(err, "Unknown error")}` };
    }

    return { success: true };
  }

  async toggleOutOfStock(id: string, currentStatus: boolean): Promise<ProductActionResult> {
    try {
      await this.db.update<Product>("products", id, { is_out_of_stock: !currentStatus });
    } catch (err) {
      return { error: `Failed to toggle status: ${toErrorMessage(err, "Unknown error")}` };
    }
    return { success: true };
  }

  async delete(id: string): Promise<ProductActionResult> {
    const product = await this.db.get<Product>("products", id);

    try {
      await this.db.delete("products", id);
    } catch (err) {
      return { error: `Failed to delete product: ${toErrorMessage(err, "Unknown error")}` };
    }

    if (product?.image_url) {
      const imagePath = storagePathFromUrl(product.image_url);
      if (imagePath) {
        await this.storage.remove(PRODUCT_IMAGES_BUCKET, [imagePath]);
      }
    }

    return { success: true };
  }
}
