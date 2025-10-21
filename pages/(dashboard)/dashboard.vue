<script setup lang="ts">
definePageMeta({
  middleware: 'dashboard',
  layout: 'dashboard'
});

const authStore = useAuthStore()
const user = computed(() => authStore.getUser)

// Extract first name
const firstName = computed(() => {
  return user.value?.firstName || 'User'
})

const welcomeMessage = computed(() => `Welcome, ${firstName.value}`)
</script>

<template>
  <PageHeader :title="welcomeMessage" />
  <DashboardOverview />
</template>
