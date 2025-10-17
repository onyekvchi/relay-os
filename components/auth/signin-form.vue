<template>
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <UAlert v-if="error" icon="i-heroicons-exclamation-triangle" color="error" variant="soft" :title="error" />

    <div class="flex flex-col space-y-4">
      <UFormField label="Email" name="email" required>
        <UInput v-model="state.email" type="email" placeholder="Enter your email" class="w-full" />
      </UFormField>

      <UFormField label="Password" name="password" required>
        <UInput v-model="state.password" :type="showPassword ? 'text' : 'password'" placeholder="Enter your password" class="w-full">
          <template #trailing>
            <UButton variant="ghost" size="xs" color="neutral" square tabindex="-1"
              @click="showPassword = !showPassword">
              <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="h-4 w-4" />
            </UButton>
          </template>
        </UInput>
      </UFormField>

      <div class="flex items-center justify-between">
        <ForgotPasswordLink />
      </div>
    </div>

    <UButton type="submit" block :loading="loading">
      Sign In
    </UButton>
  </UForm>
</template>

<script setup lang="ts">
import { LoginSchema, type LoginFormFields } from '@/schemas'
import ForgotPasswordLink from './forgot-password-link.vue'
import type { FormSubmitEvent } from '@nuxt/ui'
import { routes } from '@/routes'

const error = ref('')
const showPassword = ref(false)
const loading = ref(false)

const schema = LoginSchema

const state = reactive<Partial<LoginFormFields>>({
  email: '',
  password: '',
  rememberMe: false
})

async function onSubmit(event: FormSubmitEvent<LoginFormFields>) {
  const { login } = useAuthApi()
  const { setAuth } = useAuthStore()

  loading.value = true
  error.value = ''

  try {
    const loginData = {
      ...event.data,
      device_name: `${navigator.userAgent.split(' ')[0]} Browser`
    }
    const response = await login(loginData)
    if (response.data) {
      const { user, token } = response.data
      setAuth({ user, token })
    }
    await navigateTo(routes.dashboard)
  } catch (err: any) {
    error.value = err.message || 'Login failed. Please try again'
  } finally {
    loading.value = false
  }
}
</script>