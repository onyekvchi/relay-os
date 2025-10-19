<template>
  <div>
    <h2 class="text-lg font-semibold mb-1 tracking-tight">{{ title }}</h2>
    <p class="text-sm text-muted">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
