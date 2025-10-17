<template>
  <div class="flex items-center justify-between min-h-12">
    <div class="flex flex-col gap-2">
      <div v-if="step" class="text-primary text-sm font-medium">
        {{ step }} / 2 complete
      </div>
      
      <h1 class="text-3xl font-serif">{{ title }}</h1>
      
      <p v-if="description" class="text-muted text-base font-normal">
        {{ description }}
      </p>
    </div>
    
    <div v-if="$slots.default" class="flex items-center gap-4 justify-end">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  step?: string | null
  title: string
  description?: string | null
}

defineProps<Props>()
</script>