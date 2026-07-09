"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/types/product";
import { getDiscount, isNew } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, ImageIcon, Heart, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/core/cart/useCart";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [liked, setLiked] = useState(false);
  const discount = getDiscount(product);
  const fresh = isNew(product);
  
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url && !imgError ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}

        {/* Top badges row */}
        <div className="absolute left-0 right-0 top-0 flex items-start justify-between p-2">
          {/* Left: Tag badge */}
          <div className="flex flex-col gap-1">
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
          </div>

          {/* Right: Discount badge + wishlist */}
          <div className="flex flex-col items-end gap-1">
            {discount && !product.is_out_of_stock && (
              <Badge variant="destructive" className="text-[10px] font-bold">
                -{discount}%
              </Badge>
            )}
            <button
              onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className={`h-3.5 w-3.5 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
            </button>
          </div>
        </div>

        {/* Out of Stock Overlay */}
        {product.is_out_of_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <span className="rounded-md bg-destructive px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-white">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-bold leading-tight text-foreground">
          {product.title}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {product.description}
          </p>
        )}

        {/* Price row */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-foreground">
            Rs.{product.price.toLocaleString()}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              Rs.{product.original_price.toLocaleString()}
            </span>
          )}
        </div>

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
            onClick={() => addToCart(product)}
            className="mt-3 w-full rounded-lg font-semibold gap-2 transition-all active:scale-[0.98] cursor-pointer"
            size="sm"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to Cart
          </Button>
        ) : (
          <div className="mt-3 flex w-full items-center justify-between gap-2">
            <Button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="h-9 w-9 rounded-lg p-0 font-bold text-base transition-all active:scale-[0.95] shrink-0 cursor-pointer"
              variant="outline"
              size="icon"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="text-sm font-bold text-foreground min-w-[24px] text-center select-none">
              {quantity}
            </span>
            <Button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="h-9 w-9 rounded-lg p-0 font-bold text-base transition-all active:scale-[0.95] shrink-0 cursor-pointer"
              variant="outline"
              size="icon"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
