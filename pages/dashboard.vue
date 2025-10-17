<script setup lang="ts">
definePageMeta({
  middleware: 'dashboard'
});

const { getUser, clearAuth } = useAuthStore();

const handleLogout = async () => {
  clearAuth();
  await navigateTo('/signin');
};
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="border-b">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <div class="flex items-center gap-4">
          <p class="text-sm text-muted-foreground">{{ getUser?.name }}</p>
          <UButton @click="handleLogout" variant="outline">
            Logout
          </UButton>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Welcome, {{ getUser?.name }}!</h2>
        </template>

        <div class="space-y-4">
          <p class="text-muted-foreground">
            This is your dashboard. Start building your application here.
          </p>

          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <UCard>
              <h3 class="font-semibold mb-2">Quick Start</h3>
              <p class="text-sm text-muted-foreground">
                Check out BOILERPLATE_REFERENCE.md for code patterns and examples.
              </p>
            </UCard>

            <UCard>
              <h3 class="font-semibold mb-2">API Layer</h3>
              <p class="text-sm text-muted-foreground">
                Centralized API client with auth token injection and error handling.
              </p>
            </UCard>

            <UCard>
              <h3 class="font-semibold mb-2">Authentication</h3>
              <p class="text-sm text-muted-foreground">
                Complete auth flow with protected routes and token management.
              </p>
            </UCard>
          </div>
        </div>
      </UCard>
    </main>
  </div>
</template>
