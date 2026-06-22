"use client";

import { useState, useRef, useEffect } from "react";
import { updateProduct } from "@/lib/actions";
import { productSchema } from "@/lib/types";
import { type Product, CATEGORIES } from "@/lib/db";
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
} from "@/components/ui/dialog";
import { Upload, X, Loader2 } from "lucide-react";

interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductEditDialog({
  product,
  open,
  onOpenChange,
}: ProductEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("earbuds");
  const [colors, setColors] = useState("");
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  }, [product]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setError(null);
    setErrors({});
    setLoading(true);

    const parsedPrice = parseFloat(price);

    // Validate inputs using Zod
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
      const fileInput = fileInputRef.current;
      if (fileInput?.files?.[0]) {
        formData.append("image", fileInput.files[0]);
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product details and optionally replace the image.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Product Image</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 w-full rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="edit-product-image"
                className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-input bg-muted/50 hover:bg-muted"
              >
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload new image
                </span>
              </label>
            )}
            <input
              ref={fileInputRef}
              id="edit-product-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product name"
              className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.title && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category *</Label>
            <select
              id="edit-category"
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
            <Label htmlFor="edit-price">Price *</Label>
            <Input
              id="edit-price"
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

          {/* Colors */}
          <div className="space-y-2">
            <Label htmlFor="edit-colors">Colors</Label>
            <Input
              id="edit-colors"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="e.g. Carbon Black, Silver, White"
              className={errors.colors ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.colors && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.colors}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product description"
              rows={3}
              className={errors.description ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.description && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.description}</p>
            )}
          </div>

          {/* Out of Stock Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="edit-out-of-stock">Out of Stock</Label>
            <Switch
              id="edit-out-of-stock"
              checked={isOutOfStock}
              onCheckedChange={setIsOutOfStock}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
