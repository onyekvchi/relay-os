<template>
  <div class="flex flex-col space-y-6" :class="{ 'items-center text-center': center }">
    <LogoImage />
    <div class="space-y-2">
      <h1 class="text-3xl font-serif">{{ title }}</h1>
      <p class="text-muted">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  center?: boolean
}>()
</script>
