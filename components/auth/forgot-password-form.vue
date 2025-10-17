<template>
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      :title="errorMessage"
    />

    <div class="space-y-6">
      <!-- Email -->
      <UFormField label="Email" name="email" required>
        <UInput
          class="w-full"
          v-model="state.email"
          type="email"
          placeholder="Enter your email"
        />
      </UFormField>
    </div>

    <UButton
      type="submit"
      block
      :loading="loading"
    >
      Reset password
    </UButton>
  </UForm>
</template>

<script setup lang="ts">
import { ForgotPasswordSchema, type ForgotPasswordFormFields } from '~/schemas'
import type { FormSubmitEvent } from '@nuxt/ui'
import { routes } from '~/routes'

const errorMessage = ref<string | null>(null)
const loading = ref(false)

const schema = ForgotPasswordSchema

const state = reactive<Partial<ForgotPasswordFormFields>>({
  email: ''
})

const { forgotPassword } = useAuthApi()

async function onSubmit(event: FormSubmitEvent<ForgotPasswordFormFields>) {
  loading.value = true
  errorMessage.value = null
  
  try {
    await forgotPassword(event.data)
    
    // Navigate to signin page with success message
    await navigateTo(`${routes.signIn}?message=${encodeURIComponent('Password reset email sent successfully')}&email=${encodeURIComponent(event.data.email)}`)
    
  } catch (error: any) {
    console.error('Forgot password error:', error)
    errorMessage.value = error.data?.message || 'Failed to send reset email. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>