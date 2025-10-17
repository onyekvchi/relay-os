<template>
  <AuthHeader title="Set new password" description="Your new password must be different to previously used passwords." />

  <div class="w-full space-y-4">
    <AuthResetPasswordForm />
  </div>

  <div class="flex justify-center">
    <AuthBackButton label="Back to log in" :href="routes.signIn" />
  </div>
</template>

<script setup lang="ts">
import { routes } from '~/routes'

definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})
</script>