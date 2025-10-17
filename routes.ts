// Auth routes
const authRoutes = {
  signIn: "/signin",
  signUp: "/signup",
  signUpVerify: "/signup/verify",
  forgotPassword: "/forgot-password",
  forgotPasswordSuccess: "/forgot-password/success",
  resetPassword: "/reset-password",
  resetPasswordSuccess: "/reset-password/success",
};

// App routes
const appRoutes = {
  dashboard: "/dashboard",
};

export const routes = {
  ...authRoutes,
  ...appRoutes,
};