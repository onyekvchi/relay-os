<template>
  <AuthHeader title="Forgot Password?" description="No worries, we'll send you reset instructions." />

  <AuthForgotPasswordForm />

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