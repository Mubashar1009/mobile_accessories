import type { LoginModalState } from "@/types/store/loginModal";

export const defaultLoginModalState: LoginModalState = {
  email: "",
  password: "",
  error: null,
  loading: false,
};
