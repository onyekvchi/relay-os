<!-- Empty state -->
<template>
  <div class="flex flex-col items-center justify-center h-64 text-center">
    <UIcon :name="icon" class="w-12 h-12 text-dimmed mb-4" />
    <h3 class="text-lg font-medium text-default mb-1">{{ title }}</h3>
    <p class="text-muted text-sm">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description: string
}

const props = defineProps<Props>()
</script>