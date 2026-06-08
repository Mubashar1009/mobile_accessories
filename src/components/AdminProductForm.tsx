"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProduct, productSchema } from "@/lib/actions";
import { CATEGORIES } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Loader2, Palette } from "lucide-react";

export function AdminProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("earbuds");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [colors, setColors] = useState("");
  const [tag, setTag] = useState("");
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [description, setDescription] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Calculate discount dynamically for preview
  const numPrice = parseFloat(price) || 0;
  const numOriginal = parseFloat(originalPrice) || 0;
  const discount =
    numOriginal > numPrice
      ? Math.round(((numOriginal - numPrice) / numOriginal) * 100)
      : 0;

  // Split colors for preview list
  const colorList = colors
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrors({});
    setLoading(true);

    const parsedPrice = parseFloat(price);
    const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;

    // Validate using Zod
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
      const fileInput = fileInputRef.current;
      if (fileInput?.files?.[0]) {
        formData.append("image", fileInput.files[0]);
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

      router.push("/admin");
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Image Upload Block */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Product Image
        </Label>
        {imagePreview ? (
          <div className="relative overflow-hidden rounded-lg border">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-48 w-full object-cover sm:h-56"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="admin-product-image"
            className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 transition-all hover:bg-muted/50 hover:border-muted-foreground/45"
          >
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Upload product photo
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              PNG, JPG or WEBP up to 5MB
            </span>
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="product-title" className="text-sm font-semibold">
            Product Name *
          </Label>
          <Input
            id="product-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ronin Ultra Charge Pro"
            className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.title && (
            <p className="text-xs text-destructive font-medium mt-1">{errors.title}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
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
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-destructive font-medium mt-1">{errors.category}</p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
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
            <p className="text-xs text-destructive font-medium mt-1">{errors.price}</p>
          )}
        </div>

        {/* Original Price */}
        <div className="space-y-2">
          <Label htmlFor="product-original" className="text-sm font-semibold">
            Original Price (Rs.)
          </Label>
          <div className="relative">
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
              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-green-500/10 px-1.5 py-0.5 text-xs font-semibold text-green-500">
                {discount}% OFF
              </span>
            )}
          </div>
          {errors.original_price && (
            <p className="text-xs text-destructive font-medium mt-1">{errors.original_price}</p>
          )}
        </div>

        {/* Color Choices */}
        <div className="space-y-2">
          <Label htmlFor="product-colors" className="text-sm font-semibold">
            Color Choices
          </Label>
          <div className="relative">
            <Input
              id="product-colors"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="e.g. Space Black, Midnight Blue, Silver"
              className={errors.colors ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            <Palette className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {errors.colors && (
            <p className="text-xs text-destructive font-medium mt-1">{errors.colors}</p>
          )}
          {colorList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {colorList.map((col, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground border"
                >
                  {col}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tag */}
        <div className="space-y-2">
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
            <p className="text-xs text-destructive font-medium mt-1">{errors.tag}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
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
          <p className="text-xs text-destructive font-medium mt-1">{errors.description}</p>
        )}
      </div>

      {/* Out of Stock Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/10">
        <div className="space-y-0.5">
          <Label htmlFor="product-stock" className="text-sm font-semibold">
            Out of Stock Status
          </Label>
          <p className="text-xs text-muted-foreground">
            Mark this item as out of stock on the website.
          </p>
        </div>
        <Switch
          id="product-stock"
          checked={isOutOfStock}
          onCheckedChange={setIsOutOfStock}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin")}
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
      </div>
    </form>
  );
}
