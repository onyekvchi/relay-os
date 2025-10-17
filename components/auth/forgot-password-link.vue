<template>
  <NuxtLink
    class="text-primary hover:underline text-sm font-medium"
    :to="routes.forgotPassword"
  >
    Forgot password?
  </NuxtLink>
</template>

<script setup lang="ts">
import { routes } from '~/routes'
</script>