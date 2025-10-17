<template>
  <AuthHeader title="Sign In" description="Welcome back! Please enter your details" />

  <SigninForm />

  <div class="flex justify-center">
    <BackButton prelabel="Don't have an account?" label="Sign up" :href="routes.signUp" />
  </div>
</template>

<script setup lang="ts">
import BackButton from '~/components/auth/back-button.vue'
import SigninForm from '~/components/auth/signin-form.vue'
import { routes } from '~/routes'

definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})
</script>