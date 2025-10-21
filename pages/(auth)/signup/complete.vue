<template>
  <div class="flex flex-col space-y-6 items-center">
    <LogoImage />

    <div class="space-y-2 text-center">
      <h1 class="text-3xl font-serif">
        {{ isLoading ? 'Verifying your email...' : isSuccess ? 'Welcome aboard!' : 'Verification failed' }}
      </h1>
      <p class="text-sm text-muted max-w-sm leading-6">
        {{ isLoading ? 'Please wait while we verify your email address.' : isSuccess ? 'Your email has been verified successfully. Redirecting to your dashboard...' : 'There was an issue verifying your email address.' }}
      </p>
    </div>

    <div class="w-full" v-if="!isLoading">
      <UAlert
        v-if="isSuccess"
        color="success"
        variant="soft"
        title="Email verified successfully!"
        description="You will be redirected to your dashboard shortly."
      />
      
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        :title="error"
        description="Please try clicking the verification link again or contact support if the issue persists."
      />
    </div>

    <div v-if="isLoading" class="w-full flex justify-center">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-primary" />
    </div>

    <div v-if="error" class="flex justify-center w-full">
      <UButton
        variant="outline"
        :to="routes.signIn"
        block
      >
        Go to Sign In
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { routes } from '~/routes'

definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})

const route = useRoute()
const token = route.query.token as string

const isLoading = ref(true)
const isSuccess = ref(false)
const error = ref<string | null>(null)

const { verifyEmail } = useAuthApi()
const authStore = useAuthStore()

onMounted(async () => {
  if (!token) {
    error.value = 'Invalid verification link'
    isLoading.value = false
    return
  }

  try {
    const { UserMapper } = await import('@/models/user')
    const response = await verifyEmail(token)
    
    if (response.data) {
      const { token: authToken, user: userDTO } = response.data
      
      // Transform DTO to domain model
      const user = UserMapper.toModel(userDTO)
      
      authStore.setToken(authToken)
      authStore.setUser(user)
      
      isSuccess.value = true
      isLoading.value = false
      
      setTimeout(() => {
        navigateTo(routes.dashboard)
      }, 2000)
    } else {
      throw new Error('Invalid verification response')
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Email verification failed'
    isLoading.value = false
  }
})
</script>