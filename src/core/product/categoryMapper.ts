import type { Product } from "@/types/product";
import { Category } from "@/types/product";

export function matchesCategory(product: Product, slug: string): boolean {
  if (product.category) {
    return product.category === slug;
  }
  const text = `${product.title} ${product.description ?? ""}`.toLowerCase();
  switch (slug) {
    case Category.EARBUDS:
      return text.includes("earbud");
    case Category.HEADPHONES:
      return text.includes("headphone");
    case Category.SPEAKERS:
      return text.includes("speaker");
    case Category.POWER_BANKS:
      return text.includes("power bank");
    case Category.SMART_TRACKERS:
      return text.includes("tracker") || text.includes("tag");
    case Category.LCD_PANELS:
      return text.includes("lcd") || text.includes("panel") || text.includes("display") || text.includes("screen");
    case Category.PARTS:
      return text.includes("part") || text.includes("battery replacement") || text.includes("back glass") || text.includes("camera") || text.includes("flex");
    case Category.CABLES:
      return text.includes("cable") || text.includes("wire") || text.includes("usb");
    default:
      return false;
  }
}
