// Auth routes
const authRoutes = {
  signIn: "/signin",
  signUp: "/signup",
  forgotPassword: "/forgot-password",
  forgotPasswordSuccess: "/forgot-password/success",
  resetPassword: "/reset-password",
  resetPasswordSuccess: "/reset-password/success",
};

// App routes
const appRoutes = {
  dashboard: "/dashboard",
  workspaceOnboarding: "/onboarding/workspace",
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
  settings: {
    index: "/settings",
    profile: "/settings/profile",
    preferences: "/settings/preferences",
    notifications: "/settings/notifications",
    security: "/settings/security",
    workspace: {
      general: "/settings/workspace/general",
      team: "/settings/workspace/team",
    },
  },
  metrics: "/metrics",
};

export const routes = {
  ...authRoutes,
  ...appRoutes,
};