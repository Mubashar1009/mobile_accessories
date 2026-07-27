export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  tag: string | null;
  category: string | null;
  colors?: string | null;
  image_url: string | null;
  is_out_of_stock: boolean;
  created_at: string;
}

export enum Category {
  EARBUDS = "earbuds",
  HEADPHONES = "headphones",
  SPEAKERS = "speakers",
  POWER_BANKS = "power-banks",
  SMART_TRACKERS = "smart-trackers",
  LCD_PANELS = "lcd-panels",
  PARTS = "parts",
  CABLES = "cables",
}

export const CATEGORIES = [
  { slug: Category.EARBUDS, label: "Earbuds" },
  { slug: Category.HEADPHONES, label: "Headphones" },
  { slug: Category.SPEAKERS, label: "Speakers" },
  { slug: Category.POWER_BANKS, label: "Power Banks" },
  { slug: Category.SMART_TRACKERS, label: "Smart Trackers" },
  { slug: Category.LCD_PANELS, label: "LCD Panels" },
  { slug: Category.PARTS, label: "Parts" },
  { slug: Category.CABLES, label: "Cables" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

// Runtime helpers (getDiscount, isNew) have been moved to:
// @/core/product/productHelpers

export interface ProductInput {
  title: string;
  description?: string | null;
  price: number;
  original_price?: number | null;
  tag?: string | null;
  is_out_of_stock?: boolean;
  category?: string | null;
  colors?: string | null;
}

export * from "./schema";
