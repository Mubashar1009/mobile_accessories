"use client";

import { useCallback, useRef } from "react";
import { useProductCreateFormStore } from "@/store/productCreateForm/useProductCreateFormStore";
import { createProduct } from "@/lib/actions";

export function useProductCreateForm(onClose: () => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    loading,
    error,
    imagePreview,
    title,
    description,
    price,
    isOutOfStock,
    setLoading,
    setError,
    setImagePreview,
    setTitle,
    setDescription,
    setPrice,
    setIsOutOfStock,
    resetForm,
  } = useProductCreateFormStore();

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

  const handleResetForm = useCallback(() => {
    resetForm();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [resetForm]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        const formData = new FormData();
        if (fileInputRef.current?.files?.[0]) {
          formData.append("image", fileInputRef.current.files[0]);
        }

        const result = await createProduct(
          {
            title,
            description: description || null,
            price: parseFloat(price) || 0,
            is_out_of_stock: isOutOfStock,
          },
          formData
        );

        if (result?.error) {
          setError(result.error);
          return;
        }

        handleResetForm();
        onClose();
      } catch {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    },
    [title, description, price, isOutOfStock, setLoading, setError, handleResetForm, onClose]
  );

  return {
    // State
    loading,
    error,
    imagePreview,
    title,
    description,
    price,
    isOutOfStock,
    fileInputRef,
    // Setters
    setTitle,
    setDescription,
    setPrice,
    setIsOutOfStock,
    // Actions
    handleImageChange,
    clearImage,
    handleResetForm,
    handleSubmit,
  };
}
