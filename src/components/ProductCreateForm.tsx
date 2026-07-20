"use client";

import { useState } from "react";
import { useProductCreateForm } from "@/core/productCreateForm/useProductCreateForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Plus, Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

export function ProductCreateForm({ compact = false }: { compact?: boolean }) {
  // Only modal open state stays as useState (per architecture rule)
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  const {
    loading,
    error,
    imagePreview,
    title,
    description,
    price,
    isOutOfStock,
    fileInputRef,
    setTitle,
    setDescription,
    setPrice,
    setIsOutOfStock,
    handleImageChange,
    clearImage,
    handleResetForm,
    handleSubmit,
  } = useProductCreateForm(handleClose);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) handleResetForm();
      }}
    >
      <DialogTrigger asChild>
        {compact ? (
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Upload a product image and fill in the details. The image will be stored securely in the cloud.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error */}
          {error && (
            <Box className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </Box>
          )}

          {/* Image Upload */}
          <Box className="space-y-2">
            <Label>Product Image</Label>
            {imagePreview ? (
              <Box className="relative">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={400}
                  height={160}
                  className="h-40 w-full rounded-md object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </Box>
            ) : (
              <label
                htmlFor="product-image"
                className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-input bg-muted/50 hover:bg-muted"
              >
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <Box as="span" className="text-sm text-muted-foreground">
                  Click to upload image
                </Box>
                <Box as="span" className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP up to 5MB
                </Box>
              </label>
            )}
            <input
              ref={fileInputRef}
              id="product-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </Box>

          {/* Title */}
          <Box className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product name"
              required
            />
          </Box>

          {/* Description */}
          <Box className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product description"
              rows={3}
            />
          </Box>

          {/* Price */}
          <Box className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </Box>

          {/* Out of Stock Toggle */}
          <Flex align="center" justify="between">
            <Label htmlFor="out-of-stock">Out of Stock</Label>
            <Switch
              id="out-of-stock"
              checked={isOutOfStock}
              onCheckedChange={setIsOutOfStock}
            />
          </Flex>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setOpen(false); handleResetForm(); }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
