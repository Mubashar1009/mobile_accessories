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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pencil, Trash2, Loader2, ImageIcon, Package, TrendingUp,
  ShoppingCart, AlertTriangle, Plus, BarChart3, Layers,
} from "lucide-react";

interface AdminDashboardClientProps {
  initialProducts: Product[];
}

export function AdminDashboardClient({ initialProducts }: AdminDashboardClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const inStock = products.filter((p) => !p.is_out_of_stock).length;
  const outOfStock = products.filter((p) => p.is_out_of_stock).length;
  const categories = new Set(products.map((p) => p.category).filter(Boolean)).size;

  const handleToggleStock = (product: Product) => {
    startTransition(async () => {
      const result = await toggleOutOfStock(product.id, product.is_out_of_stock);
      if (!result?.error) {
        setProducts((prev) =>
          prev.map((p) => p.id === product.id ? { ...p, is_out_of_stock: !p.is_out_of_stock } : p)
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this product? This will also remove its image.")) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (!result?.error) setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeletingId(null);
    });
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setEditOpen(true);
  };

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "In Stock",
      value: inStock,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Out of Stock",
      value: outOfStock,
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      label: "Categories",
      value: categories,
      icon: Layers,
      color: "text-violet-600",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Product Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your mobile accessories catalog
          </p>
        </div>
        <ProductCreateForm />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-xl border ${stat.border} bg-card p-5 shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-3xl font-extrabold text-foreground">{stat.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            {/* Decorative bar at bottom */}
            <div className={`absolute bottom-0 left-0 h-1 w-full ${stat.bg}`} />
          </div>
        ))}
      </div>

      {/* Products Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        {/* Table Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">All Products</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {products.length}
            </span>
          </div>
          <ProductCreateForm compact />
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No products yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first product to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[72px] text-xs">Image</TableHead>
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="hidden text-xs sm:table-cell">Category</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">Price</TableHead>
                  <TableHead className="hidden text-xs sm:table-cell">Stock</TableHead>
                  <TableHead className="w-[100px] text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="group">
                    {/* Image */}
                    <TableCell className="py-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="h-12 w-12 rounded-lg object-cover ring-1 ring-border"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted ring-1 ring-border">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>

                    {/* Title */}
                    <TableCell className="py-3">
                      <p className="font-semibold text-foreground leading-tight">{product.title}</p>
                      {product.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {product.description}
                        </p>
                      )}
                      {product.tag && (
                        <Badge className="mt-1 text-[10px] py-0" variant="secondary">
                          {product.tag}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Category */}
                    <TableCell className="hidden py-3 sm:table-cell">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary capitalize">
                        {product.category ?? "—"}
                      </span>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="hidden py-3 md:table-cell">
                      <div>
                        <span className="font-bold text-foreground">
                          Rs.{product.price.toLocaleString()}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <p className="text-xs text-muted-foreground line-through">
                            Rs.{product.original_price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Stock toggle */}
                    <TableCell className="hidden py-3 sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!product.is_out_of_stock}
                          onCheckedChange={() => handleToggleStock(product)}
                          disabled={isPending}
                        />
                        <Badge
                          variant={product.is_out_of_stock ? "destructive" : "default"}
                          className="text-[10px]"
                        >
                          {product.is_out_of_stock ? "Out" : "In Stock"}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ProductEditDialog product={editProduct} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
