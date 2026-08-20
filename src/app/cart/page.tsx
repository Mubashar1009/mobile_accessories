"use client";

import { useCart } from "@/core/cart/useCart";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  FileText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PDFOrderPreview } from "@/components/PDFOrderPreview";
import { AppRoutes } from "@/types/enums/routes";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-background font-sans">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        {/* Back Link */}
        <div className="mb-5">
          <Link
            href={AppRoutes.HOME}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-emerald-500" />
            Continue Shopping
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Shopping Cart
            </h1>
            {totalItems > 0 && (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-500 border border-emerald-500/20">
                {totalItems} {totalItems === 1 ? "Item" : "Items"}
              </span>
            )}
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart UI */
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center border border-dashed rounded-3xl p-8 bg-card shadow-sm max-w-lg mx-auto">
            <div className="h-20 w-20 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Your Cart is Empty</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
              Looks like you haven't added any mobile accessories to your cart yet.
            </p>
            <Link href={AppRoutes.HOME} className="mt-7 w-full max-w-xs">
              <Button className="w-full rounded-xl py-6 font-bold cursor-pointer bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all">
                Explore Collection
              </Button>
            </Link>
          </div>
        ) : (
          /* Active Cart Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Cart Items List (Span 7-8 cols on lg) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-3.5">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-row items-start sm:items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border bg-card text-card-foreground shadow-sm hover:border-emerald-500/30 transition-all duration-200"
                >
                  {/* Product Thumbnail */}
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-muted/60 shrink-0 border border-border/50">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-7 w-7" />
                      </div>
                    )}
                  </div>

                  {/* Product Details & Actions */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-1 sm:gap-2">
                    {/* Top Row: Title + Trash Button */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 pr-1">
                        <h3 className="font-bold text-sm sm:text-base text-foreground leading-tight truncate">
                          {item.product.title}
                        </h3>
                        {item.product.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {item.product.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                        aria-label="Remove item"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      </button>
                    </div>

                    {/* Bottom Row: Quantity Controls & Pricing */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-1 sm:mt-2 pt-2 border-t border-border/40">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/30 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-md p-0 cursor-pointer hover:bg-muted active:scale-95"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-xs sm:text-sm font-bold w-6 sm:w-8 text-center select-none">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-md p-0 cursor-pointer hover:bg-muted active:scale-95"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Pricing */}
                      <div className="text-right ml-auto">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          Rs. {item.product.price.toLocaleString()} each
                        </p>
                        <p className="text-sm sm:text-base font-extrabold text-foreground leading-none mt-0.5">
                          Rs. {(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Order Summary Card (Span 5 cols on lg) */}
            <div className="lg:col-span-5 xl:col-span-4 border border-emerald-500/20 rounded-2xl p-5 sm:p-6 bg-card text-card-foreground shadow-sm lg:sticky lg:top-24">
              <h2 className="text-base sm:text-lg font-bold mb-4 pb-3 border-b flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {totalItems} {totalItems === 1 ? "Item" : "Items"}
                </span>
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">
                    Rs. {getCartTotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-emerald-500" />
                    Delivery
                  </span>
                  <span className="text-emerald-500 font-bold text-xs uppercase tracking-wide bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Free
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-extrabold text-foreground border-t pt-3">
                  <span>Total Amount</span>
                  <span className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    Rs. {getCartTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={() => setIsPreviewOpen(true)}
                className="w-full rounded-xl py-6 font-bold text-sm sm:text-base gap-2 cursor-pointer bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md shadow-emerald-500/25 transition-all active:scale-[0.98]"
              >
                <FileText className="h-4 w-4" />
                Proceed to Order
                <ArrowRight className="h-4 w-4" />
              </Button>

              {/* Security & Order Info Badges */}
              <div className="mt-4 pt-4 border-t space-y-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Instant PDF Invoice & WhatsApp Order Support</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <PDFOrderPreview isOpen={isPreviewOpen} setIsOpen={setIsPreviewOpen} />
    </div>
  );
}
