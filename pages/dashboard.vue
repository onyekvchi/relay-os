<script setup lang="ts">
definePageMeta({
  middleware: 'dashboard',
  layout: 'dashboard'
});

const { getUser } = useAuthStore();
</script>

<template>
  <h2 class="text-2xl font-semibold tracking-tight">Home</h2>
  <USkeleton class="h-48" />
  <USkeleton class="h-48" />
  <USkeleton class="h-48" />
</template>
