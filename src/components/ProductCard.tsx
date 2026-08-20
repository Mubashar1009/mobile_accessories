"use client";

import Image from "next/image";
import type { Product } from "@/types/product";
import { getDiscount, isNew } from "@/core/product/productHelpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { MessageCircle, ImageIcon, Heart, Plus, Minus, ShoppingBag } from "lucide-react";
import { useProductCard } from "@/core/productCard/useProductCard";
import type { ProductCardProps } from "@/types/components/productCard";

export function ProductCard({ product }: ProductCardProps) {
  const discount = getDiscount(product);
  const fresh = isNew(product);

  const {
    imgError,
    isLiked,
    quantity,
    handleImgError,
    toggleLiked,
    handleAddToCart,
    handleUpdateQuantity,
  } = useProductCard(product.id);

  return (
    <Card className="group relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-500/30 h-full flex flex-col justify-between">
      {/* Image Container */}
      <Box className="relative aspect-square overflow-hidden bg-muted/60 shrink-0">
        {product.image_url && !imgError ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={handleImgError}
          />
        ) : (
          <Flex className="h-full w-full" align="center" justify="center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
          </Flex>
        )}

        {/* Top-Left Single Clean Badge (Discount or New) */}
        <Box className="absolute left-2 top-2 z-10">
          {!product.is_out_of_stock && (
            discount ? (
              <Badge variant="destructive" className="text-[10px] sm:text-xs font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                -{discount}%
              </Badge>
            ) : fresh ? (
              <Badge className="bg-emerald-500 text-white font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-xs">
                New
              </Badge>
            ) : null
          )}
        </Box>

        {/* Top-Right Wishlist Heart Icon */}
        <button
          onClick={toggleLiked}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur border border-border/40 shadow-xs transition-transform active:scale-90 cursor-pointer hover:bg-background"
          aria-label="Wishlist"
          title="Wishlist"
        >
          <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
        </button>

        {/* Out of Stock Overlay */}
        {product.is_out_of_stock && (
          <Flex align="center" justify="center" className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20">
            <Box as="span" className="rounded-lg bg-destructive px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-md">
              Sold Out
            </Box>
          </Flex>
        )}
      </Box>

      {/* Card Content & Details */}
      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-1.5">
        <div>
          {/* Tag Pill / Label inside card body to avoid image badge collisions */}
          {product.tag && (
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5 truncate">
              {product.tag}
            </span>
          )}

          {/* Title with aligned min-height */}
          <Heading level="h5" className="line-clamp-2 text-xs sm:text-sm font-bold leading-snug text-foreground min-h-[2rem] sm:min-h-[2.4rem] flex items-center">
            {product.title}
          </Heading>

          {/* Subtitle / Description */}
          {product.description && (
            <Paragraph className="mt-0.5 line-clamp-1 text-[11px] sm:text-xs text-muted-foreground">
              {product.description}
            </Paragraph>
          )}
        </div>

        {/* Price & Action Section */}
        <div className="mt-auto pt-1">
          {/* Price Display Stacked/Flexed cleanly */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5">
            <span className="text-xs sm:text-base font-extrabold text-foreground tracking-tight whitespace-nowrap">
              Rs. {product.price.toLocaleString()}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through whitespace-nowrap">
                Rs. {product.original_price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Cart / Order Actions */}
          {product.is_out_of_stock ? (
            <Button
              className="mt-2 w-full rounded-xl font-semibold text-xs h-8"
              variant="outline"
              disabled
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Unavailable
            </Button>
          ) : quantity === 0 ? (
            <Button
              onClick={() => handleAddToCart(product)}
              className="mt-2 w-full rounded-xl font-bold text-xs sm:text-sm gap-1.5 h-8 sm:h-9 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Add to Cart
            </Button>
          ) : (
            <div className="mt-2 flex items-center justify-between gap-1 border rounded-xl p-0.5 bg-muted/40 h-8 sm:h-9 w-full">
              <Button
                onClick={() => handleUpdateQuantity(quantity - 1)}
                className="h-7 w-7 rounded-lg p-0 font-bold shrink-0 cursor-pointer hover:bg-muted"
                variant="ghost"
                size="icon"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-xs sm:text-sm font-bold text-foreground select-none">
                {quantity}
              </span>
              <Button
                onClick={() => handleUpdateQuantity(quantity + 1)}
                className="h-7 w-7 rounded-lg p-0 font-bold shrink-0 cursor-pointer hover:bg-muted"
                variant="ghost"
                size="icon"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
