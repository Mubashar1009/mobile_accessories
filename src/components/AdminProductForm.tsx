"use client";

import { useAdminProductForm } from "@/core/adminProductForm/useAdminProductForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Grid } from "@/components/ui/grid";
import { Paragraph } from "@/components/ui/paragraph";
import { Upload, X, Loader2, Palette } from "lucide-react";
import Image from "next/image";

export function AdminProductForm() {
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
    discount,
    colorList,
    fileInputRef,
    categories,
    setTitle,
    setCategory,
    setPrice,
    setOriginalPrice,
    setColors,
    setTag,
    setIsOutOfStock,
    setDescription,
    handleImageChange,
    clearImage,
    handleSubmit,
  } = useAdminProductForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Box className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
          {error}
        </Box>
      )}

      {/* Image Upload Block */}
      <Box className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Product Image
        </Label>
        {imagePreview ? (
          <Box className="relative overflow-hidden rounded-lg border">
            <Image
              src={imagePreview}
              alt="Preview"
              width={600}
              height={224}
              className="h-48 w-full object-cover sm:h-56"
              unoptimized
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          </Box>
        ) : (
          <label
            htmlFor="admin-product-image"
            className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 transition-all hover:bg-muted/50 hover:border-muted-foreground/45"
          >
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <Box as="span" className="text-sm font-medium text-foreground">
              Upload product photo
            </Box>
            <Box as="span" className="text-xs text-muted-foreground mt-0.5">
              PNG, JPG or WEBP up to 5MB
            </Box>
          </label>
        )}
        <input
          ref={fileInputRef}
          id="admin-product-image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImageChange}
          className="hidden"
        />
      </Box>

      <Grid cols={1} gap="md" className="sm:grid-cols-2">
        {/* Title */}
        <Box className="space-y-2">
          <Label htmlFor="product-title" className="text-sm font-semibold">
            Product Name *
          </Label>
          <Input
            id="product-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ultra Charge Pro 30000mAh"
            className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.title && (
            <Paragraph className="text-xs text-destructive font-medium mt-1">{errors.title}</Paragraph>
          )}
        </Box>

        {/* Category */}
        <Box className="space-y-2">
          <Label htmlFor="product-category" className="text-sm font-semibold">
            Category *
          </Label>
          <select
            id="product-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              errors.category ? "border-destructive focus:ring-destructive" : "border-input"
            }`}
          >
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <Paragraph className="text-xs text-destructive font-medium mt-1">{errors.category}</Paragraph>
          )}
        </Box>

        {/* Price */}
        <Box className="space-y-2">
          <Label htmlFor="product-price" className="text-sm font-semibold">
            Selling Price (Rs.) *
          </Label>
          <Input
            id="product-price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className={errors.price ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.price && (
            <Paragraph className="text-xs text-destructive font-medium mt-1">{errors.price}</Paragraph>
          )}
        </Box>

        {/* Original Price */}
        <Box className="space-y-2">
          <Label htmlFor="product-original" className="text-sm font-semibold">
            Original Price (Rs.)
          </Label>
          <Box className="relative">
            <Input
              id="product-original"
              type="number"
              step="0.01"
              min="0"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="0.00"
              className={errors.original_price ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {discount > 0 && (
              <Box as="span" className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-green-500/10 px-1.5 py-0.5 text-xs font-semibold text-green-500">
                {discount}% OFF
              </Box>
            )}
          </Box>
          {errors.original_price && (
            <Paragraph className="text-xs text-destructive font-medium mt-1">{errors.original_price}</Paragraph>
          )}
        </Box>

        {/* Color Choices */}
        <Box className="space-y-2">
          <Label htmlFor="product-colors" className="text-sm font-semibold">
            Color Choices
          </Label>
          <Box className="relative">
            <Input
              id="product-colors"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="e.g. Space Black, Midnight Blue, Silver"
              className={errors.colors ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            <Palette className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </Box>
          {errors.colors && (
            <Paragraph className="text-xs text-destructive font-medium mt-1">{errors.colors}</Paragraph>
          )}
          {colorList.length > 0 && (
            <Flex wrap="wrap" gap="xs" className="mt-1.5">
              {colorList.map((col, index) => (
                <Box
                  key={index}
                  as="span"
                  className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground border"
                >
                  {col}
                </Box>
              ))}
            </Flex>
          )}
        </Box>

        {/* Tag */}
        <Box className="space-y-2">
          <Label htmlFor="product-tag" className="text-sm font-semibold">
            Product Tag / Badge
          </Label>
          <Input
            id="product-tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g. Best Seller, Newly Launched"
            className={errors.tag ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.tag && (
            <Paragraph className="text-xs text-destructive font-medium mt-1">{errors.tag}</Paragraph>
          )}
        </Box>
      </Grid>

      {/* Description */}
      <Box className="space-y-2">
        <Label htmlFor="product-desc" className="text-sm font-semibold">
          Description
        </Label>
        <Textarea
          id="product-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter detailed description and product features..."
          rows={4}
          className={errors.description ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        {errors.description && (
          <Paragraph className="text-xs text-destructive font-medium mt-1">{errors.description}</Paragraph>
        )}
      </Box>

      {/* Out of Stock Toggle */}
      <Flex align="center" justify="between" className="rounded-lg border p-4 bg-muted/10">
        <Box className="space-y-0.5">
          <Label htmlFor="product-stock" className="text-sm font-semibold">
            Out of Stock Status
          </Label>
          <Paragraph className="text-xs text-muted-foreground">
            Mark this item as out of stock on the website.
          </Paragraph>
        </Box>
        <Switch
          id="product-stock"
          checked={isOutOfStock}
          onCheckedChange={setIsOutOfStock}
        />
      </Flex>

      {/* Action Buttons */}
      <Flex justify="end" gap="sm" className="pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating product...
            </>
          ) : (
            "Create Product"
          )}
        </Button>
      </Flex>
    </form>
  );
}
