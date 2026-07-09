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

export function getDiscount(product: Product): number | null {
  if (product.original_price && product.original_price > product.price) {
    return Math.round(((product.original_price - product.price) / product.original_price) * 100);
  }
  return null;
}

export function isNew(product: Product): boolean {
  const weekAgo = Date.now() - 7 * 86400000;
  return new Date(product.created_at).getTime() > weekAgo;
}

export * from "./schema";
