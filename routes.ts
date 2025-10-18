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
  workflows: "/workflows",
  requests: "/requests",
  request(id: string): string {
    return `/requests/${id}`;
  },
  newRequest: "/requests/new",
  workflow(id: string): string {
    return `/workflows/${id}`;
  },
  newWorkflow: "/workflows/new",
  settings: "/settings",
  metrics: "/metrics",
};

export const routes = {
  ...authRoutes,
  ...appRoutes,
};