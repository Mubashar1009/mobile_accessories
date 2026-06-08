"use client";

import { useState, useTransition } from "react";
import type { Product } from "@/lib/db";
import { toggleOutOfStock, deleteProduct } from "@/lib/actions";
import { ProductCreateForm } from "@/components/ProductCreateForm";
import { ProductEditDialog } from "@/components/ProductEditDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Loader2, ImageIcon } from "lucide-react";

interface AdminDashboardClientProps {
  initialProducts: Product[];
}

export function AdminDashboardClient({
  initialProducts,
}: AdminDashboardClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggleStock = (product: Product) => {
    startTransition(async () => {
      const result = await toggleOutOfStock(product.id, product.is_out_of_stock);
      if (!result?.error) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? { ...p, is_out_of_stock: !p.is_out_of_stock }
              : p
          )
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This will also remove its image.")) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (!result?.error) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
      setDeletingId(null);
    });
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Products
          </h2>
          <p className="text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <ProductCreateForm />
      </div>

      {/* Product Table */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">No products yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Click &quot;Add Product&quot; to create your first product.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  {/* Image */}
                  <TableCell>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>

                  {/* Title */}
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {product.title}
                      </p>
                      {product.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="hidden md:table-cell">
                    <span className="font-medium">
                      Rs.{product.price.toFixed(2)}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!product.is_out_of_stock}
                        onCheckedChange={() => handleToggleStock(product)}
                        disabled={isPending}
                      />
                      {product.is_out_of_stock ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : (
                        <Badge variant="default">In Stock</Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                      >
                        {deletingId === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <ProductEditDialog
        product={editProduct}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
