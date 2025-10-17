<template>
  <AuthHeader title="Create an account" description="Kindly provide details below" />

  <AuthSignupForm />

  <div class="flex justify-center">
    <AuthBackButton prelabel="Already have an account?" label="Sign in" :href="routes.signIn" />
  </div>
</template>

<script setup lang="ts">
import { routes } from "~/routes"

definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})
</script>