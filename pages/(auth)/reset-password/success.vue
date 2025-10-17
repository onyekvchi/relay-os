<template>
  <AuthHeader title="Password reset" description="Your password has been successfully reset. Click below to log in." center />

  <div class="w-full space-y-4">
    <UButton
      block
      :to="routes.signIn"
    >
      Go to log in
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { routes } from '~/routes'

definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})
</script>