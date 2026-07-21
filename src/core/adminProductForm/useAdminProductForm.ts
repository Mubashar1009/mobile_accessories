"use client";

import { useCallback, useRef } from "react";
import { useAdminProductFormStore } from "@/store/adminProductForm/useAdminProductFormStore";
import { createProduct } from "@/lib/actions";
import { productSchema, CATEGORIES } from "@/types/product";
import { useRouter } from "next/navigation";

export function useAdminProductForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    loading,
    error,
    errors,
    imagePreview,
    title,
    category,
    price,
    originalPrice,
    colors,
    tag,
    isOutOfStock,
    description,
    setLoading,
    setError,
    setErrors,
    setImagePreview,
    setTitle,
    setCategory,
    setPrice,
    setOriginalPrice,
    setColors,
    setTag,
    setIsOutOfStock,
    setDescription,
    resetForm,
  } = useAdminProductFormStore();

  // Derived values
  const numPrice = parseFloat(price) || 0;
  const numOriginal = parseFloat(originalPrice) || 0;
  const discount =
    numOriginal > numPrice
      ? Math.round(((numOriginal - numPrice) / numOriginal) * 100)
      : 0;
  const colorList = colors
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [setImagePreview]
  );

  const clearImage = useCallback(() => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setImagePreview]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setErrors({});
      setLoading(true);

      const parsedPrice = parseFloat(price);
      const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;

      const validation = productSchema.safeParse({
        title,
        description: description || null,
        price: isNaN(parsedPrice) ? 0 : parsedPrice,
        original_price: parsedOriginalPrice,
        category,
        colors: colors || null,
        tag: tag || null,
        is_out_of_stock: isOutOfStock,
      });

      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setError("Please fix the validation errors below.");
        setLoading(false);
        return;
      }

      try {
        const formData = new FormData();
        if (fileInputRef.current?.files?.[0]) {
          formData.append("image", fileInputRef.current.files[0]);
        }

        const result = await createProduct(
          {
            title,
            description: description || null,
            price: numPrice,
            original_price: numOriginal || null,
            category,
            colors: colors || null,
            tag: tag || null,
            is_out_of_stock: isOutOfStock,
          },
          formData
        );

        if (result?.error) {
          setError(result.error);
          return;
        }

        resetForm();
        if (fileInputRef.current) fileInputRef.current.value = "";
        router.push("/admin");
        router.refresh();
      } catch {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    },
    [
      price, originalPrice, title, description, category, colors, tag,
      isOutOfStock, numPrice, numOriginal,
      setLoading, setError, setErrors, resetForm, router,
    ]
  );

  return {
    // State
    loading,
    error,
    errors,
    imagePreview,
    title,
    category,
    price,
    originalPrice,
    colors,
    tag,
    isOutOfStock,
    description,
    discount,
    colorList,
    fileInputRef,
    categories: CATEGORIES,
    // Setters
    setTitle,
    setCategory,
    setPrice,
    setOriginalPrice,
    setColors,
    setTag,
    setIsOutOfStock,
    setDescription,
    // Actions
    handleImageChange,
    clearImage,
    handleSubmit,
  };
}
