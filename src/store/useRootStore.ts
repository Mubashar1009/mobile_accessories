import { create } from "zustand";
import type { RootState } from "@/types/store/root";
import { createAdminDashboardSlice } from "./adminDashboard/adminDashboardSlice";
import { createAdminProductFormSlice } from "./adminProductForm/adminProductFormSlice";
import { createCartSlice } from "./cart/cartSlice";
import { createLoginModalSlice } from "./loginModal/loginModalSlice";
import { createLoginSlice } from "./login/loginSlice";
import { createSignupSlice } from "./signup/signupSlice";
import { createNavbarSlice } from "./navbar/navbarSlice";
import { createProductSlice } from "./product/productSlice";
import { createProductCardSlice } from "./productCard/productCardSlice";
import { createProductCreateFormSlice } from "./productCreateForm/productCreateFormSlice";
import { createProductEditDialogSlice } from "./productEditDialog/productEditDialogSlice";
import { createErrorSlice } from "./error/errorSlice";

export const useRootStore = create<RootState>((set, get) => {
  const makeScopedSet = <K extends keyof RootState>(key: K) => {
    return (partial: Partial<RootState[K]> | ((state: RootState[K]) => Partial<RootState[K]>)) => {
      set((rootState) => {
        const currentSliceState = rootState[key];
        const updated = typeof partial === "function" ? partial(currentSliceState) : partial;
        return {
          [key]: {
            ...currentSliceState,
            ...updated,
          },
        } as Partial<RootState>;
      });
    };
  };

  return {
    adminDashboard: createAdminDashboardSlice(
      makeScopedSet("adminDashboard"),
      () => get().adminDashboard
    ),
    adminProductForm: createAdminProductFormSlice(
      makeScopedSet("adminProductForm"),
      () => get().adminProductForm
    ),
    cart: createCartSlice(
      makeScopedSet("cart"),
      () => get().cart
    ),
    loginModal: createLoginModalSlice(
      makeScopedSet("loginModal"),
      () => get().loginModal
    ),
    login: createLoginSlice(
      makeScopedSet("login"),
      () => get().login
    ),
    signup: createSignupSlice(
      makeScopedSet("signup"),
      () => get().signup
    ),
    navbar: createNavbarSlice(
      makeScopedSet("navbar"),
      () => get().navbar
    ),
    product: createProductSlice(
      makeScopedSet("product"),
      () => get().product
    ),
    productCard: createProductCardSlice(
      makeScopedSet("productCard"),
      () => get().productCard
    ),
    productCreateForm: createProductCreateFormSlice(
      makeScopedSet("productCreateForm"),
      () => get().productCreateForm
    ),
    productEditDialog: createProductEditDialogSlice(
      makeScopedSet("productEditDialog"),
      () => get().productEditDialog
    ),
    error: createErrorSlice(
      makeScopedSet("error"),
      () => get().error
    ),
  };
});
