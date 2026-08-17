"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { productSchema, type ProductInput } from "@/types/product";

import { UserRole } from "@/types/enums/roles";

/**
 * Verifies that the caller is an authenticated admin.
 * Checks public.users.role which is set by the on_auth_user_created
 * trigger defined in 003_admin_setup.sql.
 */
async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return false;

    const { data: userRow, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    return !roleError && userRow?.role === UserRole.ADMIN;
  } catch {
    return false;
  }
}


// ── Fetch all products ──────────────────────────────────────────────────
export async function getProducts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error.message);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}

// ── Create a product with image upload to Supabase Storage ──────────────
export async function createProduct(
  input: ProductInput,
  formData: FormData
) {
  const supabase = await createClient();
  if (!(await verifyAdmin(supabase))) {
    return { error: "Unauthorized: Only administrators can perform this action." };
  }

  // Validate inputs using Zod
  const validation = productSchema.safeParse(input);
  if (!validation.success) {
    const errorMessage = validation.error.issues.map((err) => err.message).join(", ");
    return { error: `Validation error: ${errorMessage}` };
  }
  const validatedData = validation.data;

  const imageFile = formData.get("image") as File | null;
  let image_url: string | null = null;

  // Upload image to Supabase Storage if provided
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: `Image upload failed: ${uploadError.message}` };
    }

    // Get the public URL from the bucket
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    image_url = urlData.publicUrl;
  }

  // Insert the product row with the bucket public URL
  const { error: insertError } = await supabase.from("products").insert({
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

  if (insertError) {
    // Clean up uploaded image if DB insert fails
    if (image_url) {
      const path = image_url.split("/product-images/")[1];
      if (path) await supabase.storage.from("product-images").remove([path]);
    }
    return { error: `Failed to create product: ${insertError.message}` };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

// ── Update product text details ─────────────────────────────────────────
export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
  formData?: FormData
) {
  const supabase = await createClient();
  if (!(await verifyAdmin(supabase))) {
    return { error: "Unauthorized: Only administrators can perform this action." };
  }

  // Validate inputs using Zod (partial check for updates)
  const validation = productSchema.partial().safeParse(input);
  if (!validation.success) {
    const errorMessage = validation.error.issues.map((err) => err.message).join(", ");
    return { error: `Validation error: ${errorMessage}` };
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

  // Handle image replacement
  const imageFile = formData?.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    // Get existing product to delete old image
    const { data: existing } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", id)
      .single();

    // Upload new image
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: `Image upload failed: ${uploadError.message}` };
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    updateData.image_url = urlData.publicUrl;

    // Delete old image from bucket
    if (existing?.image_url) {
      const oldPath = existing.image_url.split("/product-images/")[1];
      if (oldPath) {
        await supabase.storage.from("product-images").remove([oldPath]);
      }
    }
  }

  const { error: updateError } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id);

  if (updateError) {
    return { error: `Failed to update product: ${updateError.message}` };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

// ── Toggle out-of-stock status ──────────────────────────────────────────
export async function toggleOutOfStock(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  if (!(await verifyAdmin(supabase))) {
    return { error: "Unauthorized: Only administrators can perform this action." };
  }
  const { error } = await supabase
    .from("products")
    .update({ is_out_of_stock: !currentStatus })
    .eq("id", id);

  if (error) {
    return { error: `Failed to toggle status: ${error.message}` };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

// ── Delete product and its image from bucket ────────────────────────────
export async function deleteProduct(id: string) {
  const supabase = await createClient();
  if (!(await verifyAdmin(supabase))) {
    return { error: "Unauthorized: Only administrators can perform this action." };
  }

  // Get the product to find its image URL
  const { data: product } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();

  // Delete the product row
  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { error: `Failed to delete product: ${deleteError.message}` };
  }

  // Delete the image from the storage bucket
  if (product?.image_url) {
    const imagePath = product.image_url.split("/product-images/")[1];
    if (imagePath) {
      await supabase.storage.from("product-images").remove([imagePath]);
    }
  }

  revalidatePath("/dashboard");
  return { success: true };
}

