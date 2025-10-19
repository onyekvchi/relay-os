<script setup lang="ts">
definePageMeta({
  middleware: 'dashboard',
  layout: 'dashboard'
});

const authStore = useAuthStore()
const user = computed(() => authStore.getUser)

// Extract first name from full name
const firstName = computed(() => {
  if (!user.value?.name) return 'User'
  return user.value.name.split(' ')[0]
})

const welcomeMessage = computed(() => `Welcome, ${firstName.value}`)
</script>

<template>
  <PageHeader :title="welcomeMessage" />
  <DashboardOverview />
</template>
