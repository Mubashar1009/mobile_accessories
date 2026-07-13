"use client";

import { useState, useTransition } from "react";
import type { Product } from "@/types/product";
import { toggleOutOfStock, deleteProduct } from "@/lib/actions";
import Link from "next/link";
import Image from "next/image";
import { ProductEditDialog } from "@/components/ProductEditDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Grid } from "@/components/ui/grid";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
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
    { label: "Total Products", value: products.length, icon: Package, color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "In Stock", value: inStock, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Out of Stock", value: outOfStock, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    { label: "Categories", value: categories, icon: Layers, color: "text-violet-600", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  ];

  return (
    <Box className="space-y-8">
      {/* Page Header */}
      <Flex direction="col" gap="md" className="sm:flex-row sm:items-center sm:justify-between">
        <Box>
          <Heading level="h1" className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Product Dashboard
          </Heading>
          <Paragraph className="mt-1 text-sm text-muted-foreground">
            Manage your Al-Rehman product catalog
          </Paragraph>
        </Box>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </Flex>

      {/* Stats Grid */}
      <Grid cols={2} gap="md" className="lg:grid-cols-4">
        {stats.map((stat) => (
          <Box
            key={stat.label}
            className={`relative overflow-hidden rounded-xl border ${stat.border} bg-card p-5 shadow-sm`}
          >
            <Flex justify="between" align="start">
              <Box>
                <Paragraph className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </Paragraph>
                <Paragraph className="mt-1.5 text-3xl font-extrabold text-foreground">{stat.value}</Paragraph>
              </Box>
              <Flex align="center" justify="center" className={`h-10 w-10 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </Flex>
            </Flex>
            {/* Decorative bar at bottom */}
            <Box className={`absolute bottom-0 left-0 h-1 w-full ${stat.bg}`} />
          </Box>
        ))}
      </Grid>

      {/* Products Table */}
      <Box className="rounded-xl border bg-card shadow-sm">
        {/* Table Header */}
        <Flex align="center" justify="between" className="border-b px-5 py-4">
          <Flex align="center" gap="sm">
            <BarChart3 className="h-4 w-4 text-primary" />
            <Heading level="h2" className="text-sm font-bold text-foreground">All Products</Heading>
            <Box as="span" className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {products.length}
            </Box>
          </Flex>
          <Link href="/admin/products/new">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </Link>
        </Flex>

        {products.length === 0 ? (
          <Flex direction="col" align="center" justify="center" className="py-20 text-center">
            <Flex align="center" justify="center" className="mb-4 h-16 w-16 rounded-2xl bg-muted">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </Flex>
            <Heading level="h3" className="text-lg font-bold text-foreground">No products yet</Heading>
            <Paragraph className="mt-1 text-sm text-muted-foreground">
              Add your first product to get started.
            </Paragraph>
          </Flex>
        ) : (
          <Box className="overflow-x-auto">
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
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-lg object-cover ring-1 ring-border"
                        />
                      ) : (
                        <Flex align="center" justify="center" className="h-12 w-12 rounded-lg bg-muted ring-1 ring-border">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </Flex>
                      )}
                    </TableCell>

                    {/* Title */}
                    <TableCell className="py-3">
                      <Paragraph className="font-semibold text-foreground leading-tight">{product.title}</Paragraph>
                      {product.description && (
                        <Paragraph className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {product.description}
                        </Paragraph>
                      )}
                      {product.tag && (
                        <Badge className="mt-1 text-[10px] py-0" variant="secondary">
                          {product.tag}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Category */}
                    <TableCell className="hidden py-3 sm:table-cell">
                      <Box as="span" className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary capitalize">
                        {product.category ?? "—"}
                      </Box>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="hidden py-3 md:table-cell">
                      <Box>
                        <Box as="span" className="font-bold text-foreground">
                          Rs.{product.price.toLocaleString()}
                        </Box>
                        {product.original_price && product.original_price > product.price && (
                          <Paragraph className="text-xs text-muted-foreground line-through">
                            Rs.{product.original_price.toLocaleString()}
                          </Paragraph>
                        )}
                      </Box>
                    </TableCell>

                    {/* Stock toggle */}
                    <TableCell className="hidden py-3 sm:table-cell">
                      <Flex align="center" gap="sm">
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
                      </Flex>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3 text-right">
                      <Flex align="center" justify="end" gap="xs" className="opacity-60 transition-opacity group-hover:opacity-100">
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
                      </Flex>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>

      <ProductEditDialog product={editProduct} open={editOpen} onOpenChange={setEditOpen} />
    </Box>
  );
}
