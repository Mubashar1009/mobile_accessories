import type { LoginState } from "@/types/store/login";

export const defaultLoginState: LoginState = {
  email: "",
  password: "",
  serverError: null,
  fieldErrors: {},
  loading: false,
  showPassword: false,
};
