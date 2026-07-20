"use client";

import Image from "next/image";
import type { Product } from "@/types/product";
import { getDiscount, isNew } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { MessageCircle, ImageIcon, Heart, Plus, Minus, ShoppingBag } from "lucide-react";
import { useProductCard } from "@/core/productCard/useProductCard";

interface ProductCardProps {
  product: Product;
}

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
    <Card className="group relative overflow-hidden rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5">
      {/* Image Container */}
      <Box className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url && !imgError ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={handleImgError}
          />
        ) : (
          <Flex className="h-full w-full" align="center" justify="center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
          </Flex>
        )}

        {/* Top badges row */}
        <Flex justify="between" align="start" className="absolute left-0 right-0 top-0 p-2">
          {/* Left: Tag badge */}
          <Flex direction="col" gap="xs">
            {product.tag && !product.is_out_of_stock && (
              <Badge className="bg-primary text-[10px] font-semibold text-primary-foreground hover:bg-primary">
                {product.tag}
              </Badge>
            )}
            {fresh && !product.is_out_of_stock && (
              <Badge className="bg-emerald-500 text-[10px] font-semibold text-white hover:bg-emerald-500">
                New
              </Badge>
            )}
          </Flex>

          {/* Right: Discount badge + wishlist */}
          <Flex direction="col" align="end" gap="xs">
            {discount && !product.is_out_of_stock && (
              <Badge variant="destructive" className="text-[10px] font-bold">
                -{discount}%
              </Badge>
            )}
            <button
              onClick={toggleLiked}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className={`h-3.5 w-3.5 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
            </button>
          </Flex>
        </Flex>

        {/* Out of Stock Overlay */}
        {product.is_out_of_stock && (
          <Flex align="center" justify="center" className="absolute inset-0 bg-black/50 backdrop-blur-[2px]">
            <Box as="span" className="rounded-md bg-destructive px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-white">
              Sold Out
            </Box>
          </Flex>
        )}
      </Box>

      {/* Content */}
      <CardContent className="p-3 sm:p-4">
        {/* Title */}
        <Heading level="h5" className="line-clamp-2 text-sm font-bold leading-tight text-foreground">
          {product.title}
        </Heading>

        {/* Description */}
        {product.description && (
          <Paragraph className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {product.description}
          </Paragraph>
        )}

        {/* Price row */}
        <Flex align="baseline" gap="sm" className="mt-2">
          <Box as="span" className="text-lg font-extrabold text-foreground">
            Rs.{product.price.toLocaleString()}
          </Box>
          {product.original_price && product.original_price > product.price && (
            <Box as="span" className="text-xs text-muted-foreground line-through">
              Rs.{product.original_price.toLocaleString()}
            </Box>
          )}
        </Flex>

        {/* Cart / Order Actions */}
        {product.is_out_of_stock ? (
          <Button
            className="mt-3 w-full rounded-lg font-semibold"
            size="sm"
            variant="outline"
            disabled
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Unavailable
          </Button>
        ) : quantity === 0 ? (
          <Button
            onClick={() => handleAddToCart(product)}
            className="mt-3 w-full rounded-lg font-semibold gap-2 transition-all active:scale-[0.98] cursor-pointer"
            size="sm"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to Cart
          </Button>
        ) : (
          <Flex align="center" justify="between" gap="sm" className="mt-3 w-full">
            <Button
              onClick={() => handleUpdateQuantity(quantity - 1)}
              className="h-9 w-9 rounded-lg p-0 font-bold text-base transition-all active:scale-[0.95] shrink-0 cursor-pointer"
              variant="outline"
              size="icon"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <Box as="span" className="text-sm font-bold text-foreground min-w-[24px] text-center select-none">
              {quantity}
            </Box>
            <Button
              onClick={() => handleUpdateQuantity(quantity + 1)}
              className="h-9 w-9 rounded-lg p-0 font-bold text-base transition-all active:scale-[0.95] shrink-0 cursor-pointer"
              variant="outline"
              size="icon"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </Flex>
        )}
      </CardContent>
    </Card>
  );
}
