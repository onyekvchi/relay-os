<template>
  <NuxtLink
    :to="href"
    class="text-sm text-muted hover:text-primary"
  >
    <UIcon v-if="show" name="i-heroicons-arrow-left" class="mr-1" />
    <span v-if="prelabel" class="mr-1">{{ prelabel }}</span>
    <span class="font-medium">{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  prelabel?: string
  label: string
  href: string
  show?: boolean
}

withDefaults(defineProps<Props>(), {
  show: false
})
</script>