import type { SignupState } from "@/types/store/signup";

export const initialSignupState: SignupState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  serverError: null,
  successMessage: null,
  fieldErrors: {},
  loading: false,
  showPassword: false,
};
