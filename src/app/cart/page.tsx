"use client";

import { useCart } from "@/core/cart/useCart";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PDFOrderPreview } from "@/components/PDFOrderPreview";

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
  } = useCart();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Continue Shopping
          </Link>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl mb-8">
          Shopping Cart
          {totalItems > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({totalItems} {totalItems === 1 ? "item" : "items"})
            </span>
          )}
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center border border-dashed rounded-2xl p-6 bg-card">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-4">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-[280px]">
              Add products from our catalog to get started on your order.
            </p>
            <Link href="/" className="mt-6">
              <Button className="rounded-lg px-6 cursor-pointer hover:bg-primary/90 transition-colors">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* Image Container */}
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 mx-auto sm:mx-0">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground/45">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between text-center sm:text-left">
                    <div>
                      <h3 className="font-bold text-base leading-snug text-foreground line-clamp-2">
                        {item.product.title}
                      </h3>
                      {item.product.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {item.product.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
                      {/* Quantity Toggles */}
                      <div className="flex items-center gap-2 border rounded-lg p-1 bg-muted/40 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-md p-0 cursor-pointer hover:bg-muted active:scale-95"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-sm font-bold w-8 text-center select-none">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-md p-0 cursor-pointer hover:bg-muted active:scale-95"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Prices and Trash */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Rs.{item.product.price.toLocaleString()} each
                          </p>
                          <p className="text-sm font-bold text-foreground mt-0.5">
                            Rs.{(item.product.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all p-2 rounded-lg cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Order Summary Card */}
            <div className="lg:col-span-1 border rounded-xl p-6 bg-card text-card-foreground shadow-sm sticky top-24">
              <h2 className="text-lg font-bold mb-4 pb-2 border-b">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>Rs.{getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-emerald-500 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground border-t pt-3">
                  <span>Total Amount</span>
                  <span>Rs.{getCartTotal().toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={() => setIsPreviewOpen(true)}
                className="w-full rounded-lg py-6 font-bold text-base gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                Proceed to Order
                <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-[11px] text-muted-foreground text-center mt-3">
                Verify your order details, generate PDF invoice and proceed to WhatsApp.
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <PDFOrderPreview isOpen={isPreviewOpen} setIsOpen={setIsPreviewOpen} />
    </div>
  );
}
