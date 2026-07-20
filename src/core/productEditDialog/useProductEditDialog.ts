"use client";

import { useCallback, useRef, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useProductEditDialogStore } from "@/store/productEditDialog/useProductEditDialogStore";
import { updateProduct } from "@/lib/actions";
import { productSchema, CATEGORIES, type Product } from "@/types/product";

export function useProductEditDialog(product: Product | null, onOpenChange: (open: boolean) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    loading,
    error,
    errors,
    imagePreview,
    title,
    description,
    price,
    category,
    colors,
    isOutOfStock,
    setLoading,
    setError,
    setErrors,
    setImagePreview,
    setTitle,
    setDescription,
    setPrice,
    setCategory,
    setColors,
    setIsOutOfStock,
    resetForm,
  } = useProductEditDialogStore(
    useShallow((s) => ({
      loading: s.loading,
      error: s.error,
      errors: s.errors,
      imagePreview: s.imagePreview,
      title: s.title,
      description: s.description,
      price: s.price,
      category: s.category,
      colors: s.colors,
      isOutOfStock: s.isOutOfStock,
      setLoading: s.setLoading,
      setError: s.setError,
      setErrors: s.setErrors,
      setImagePreview: s.setImagePreview,
      setTitle: s.setTitle,
      setDescription: s.setDescription,
      setPrice: s.setPrice,
      setCategory: s.setCategory,
      setColors: s.setColors,
      setIsOutOfStock: s.setIsOutOfStock,
      resetForm: s.resetForm,
    }))
  );

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description ?? "");
      setPrice(product.price.toString());
      setCategory(product.category ?? "earbuds");
      setColors(product.colors ?? "");
      setIsOutOfStock(product.is_out_of_stock);
      setImagePreview(product.image_url);
      setError(null);
      setErrors({});
    }
  }, [product, setTitle, setDescription, setPrice, setCategory, setColors, setIsOutOfStock, setImagePreview, setError, setErrors]);

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
      if (!product) return;

      setError(null);
      setErrors({});
      setLoading(true);

      const parsedPrice = parseFloat(price);

      const validation = productSchema.partial().safeParse({
        title,
        description: description || null,
        price: isNaN(parsedPrice) ? 0 : parsedPrice,
        category,
        colors: colors || null,
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

        const result = await updateProduct(
          product.id,
          {
            title,
            description: description || null,
            price: parsedPrice,
            category,
            colors: colors || null,
            is_out_of_stock: isOutOfStock,
          },
          formData
        );

        if (result?.error) {
          setError(result.error);
          return;
        }

        onOpenChange(false);
      } catch {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    },
    [
      product, price, title, description, category, colors, isOutOfStock,
      setLoading, setError, setErrors, onOpenChange,
    ]
  );

  return {
    // State
    loading,
    error,
    errors,
    imagePreview,
    title,
    description,
    price,
    category,
    colors,
    isOutOfStock,
    fileInputRef,
    categories: CATEGORIES,
    // Setters
    setTitle,
    setDescription,
    setPrice,
    setCategory,
    setColors,
    setIsOutOfStock,
    // Actions
    handleImageChange,
    clearImage,
    handleSubmit,
    resetForm,
  };
}
