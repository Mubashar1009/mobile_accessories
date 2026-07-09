import type { Product } from "../product";

export interface CartItem {
  id: string; // matches product.id
  product: Product;
  quantity: number;
}

export * from "./schema";
