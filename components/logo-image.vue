<template>
  <div :class="`size-${size} shadow-xs rounded-lg relative`">
    <img
      src="/assets/logomark-bounded.svg"
      alt="Mailtree logo mark"
      class="h-full w-full"
    />
  </div>
</template>

<script setup lang="ts">
defineProps({
  size: {
    type: Number,
    default: 14
  }
})
</script>
