<template>
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      :title="errorMessage"
    />

    <div class="space-y-6">
      <!-- Password -->
      <UFormField label="Password" name="password" required>
        <UInput
          class="w-full"
          v-model="state.password"
          type="password"
          placeholder="********"
          :disabled="loading"
        />
      </UFormField>

      <!-- Confirm Password -->
      <UFormField label="Confirm password" name="confirmPassword" required>
        <UInput
          class="w-full"
          v-model="state.confirmPassword"
          type="password"
          placeholder="********"
        />
      </UFormField>

      <!-- Password Requirements -->
      <div class="space-y-2">
        <div class="flex gap-2">
          <UIcon
            name="i-heroicons-check-circle-20-solid"
            :class="isLengthValid ? 'text-primary' : 'text-dimmed'"
            class="h-5 w-5 self-center"
          />
          <p class="text-sm text-muted font-normal leading-5">
            Must be at least 8 characters
          </p>
        </div>

        <div class="flex gap-2">
          <UIcon
            name="i-heroicons-check-circle-20-solid"
            :class="isSpecialCharValid ? 'text-primary' : 'text-dimmed'"
            class="h-5 w-5 self-center"
          />
          <p class="text-sm text-muted font-normal leading-5">
            Must contain one special character
          </p>
        </div>
      </div>
    </div>

    <UButton
      type="submit"
      block
      :disabled="!token || loading"
      :loading="loading"
    >
      Reset password
    </UButton>
  </UForm>
</template>

<script setup lang="ts">
import { ResetPasswordSchema, type ResetPasswordFormFields } from '~/schemas'
import type { FormSubmitEvent } from '@nuxt/ui'
import { routes } from '~/routes'

const route = useRoute()
const token = route.query.token as string

const errorMessage = ref<string | null>(null)
const loading = ref(false)

const schema = ResetPasswordSchema

const state = reactive<Partial<ResetPasswordFormFields>>({
  password: '',
  confirmPassword: ''
})

// Password requirement validation
const isLengthValid = computed(() => state.password && state.password.length >= 8)
const isSpecialCharValid = computed(() => state.password && /[!@#$%^&*(),.?":{}|<>]/.test(state.password))

const { resetPassword } = useAuthApi()

async function onSubmit(event: FormSubmitEvent<ResetPasswordFormFields>) {
  if (!token) {
    errorMessage.value = 'Invalid reset link. Please request a new password reset.'
    return
  }

  loading.value = true
  errorMessage.value = null
  
  try {
    await resetPassword({
      token: token,
      new_password: event.data.password,
    })
    
    // Navigate to signin page with success message
    await navigateTo(`${routes.signIn}?message=${encodeURIComponent('Password reset successful. You can now sign in with your new password.')}`)
    
  } catch (error: any) {
    console.error('Reset password error:', error)
    errorMessage.value = error.data?.message || 'Failed to reset password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>