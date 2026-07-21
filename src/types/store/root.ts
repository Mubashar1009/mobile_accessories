import type { AdminDashboardSlice } from "./adminDashboard";
import type { AdminProductFormSlice } from "./adminProductForm";
import type { CartSlice } from "./cart";
import type { LoginModalSlice } from "./loginModal";
import type { NavbarSlice } from "./navbar";
import type { ProductSlice } from "./product";
import type { ProductCardSlice } from "./productCard";
import type { ProductCreateFormSlice } from "./productCreateForm";
import type { ProductEditDialogSlice } from "./productEditDialog";
import type { ErrorSlice } from "./error";

export interface RootState {
  adminDashboard: AdminDashboardSlice;
  adminProductForm: AdminProductFormSlice;
  cart: CartSlice;
  loginModal: LoginModalSlice;
  navbar: NavbarSlice;
  product: ProductSlice;
  productCard: ProductCardSlice;
  productCreateForm: ProductCreateFormSlice;
  productEditDialog: ProductEditDialogSlice;
  error: ErrorSlice;
}
