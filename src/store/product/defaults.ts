import type { ProductState } from "@/types/store/product";
import { DEMO_PRODUCTS } from "@/lib/db";

export const defaultProductState: ProductState = {
  products: DEMO_PRODUCTS,
  loading: false,
  refreshing: false,
  isOffline: false,
  isDemo: true,
};
