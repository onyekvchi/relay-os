<template>
  <div class="flex justify-between h-10">
    <h2 class="text-2xl font-semibold tracking-tight">{{ title }}</h2>
    <template v-if="$slots.default">
      <slot />
    </template>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>