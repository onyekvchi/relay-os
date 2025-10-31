<template>
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      :title="errorMessage"
    />

    <div class="space-y-6">
      <!-- First Name -->
      <UFormField label="First Name" name="first_name" required>
        <UInput
          class="w-full"
          v-model="state.first_name"
          placeholder="Enter your first name"
        />
      </UFormField>

      <!-- Last Name -->
      <UFormField label="Last Name" name="last_name" required>
        <UInput
          class="w-full"
          v-model="state.last_name"
          placeholder="Enter your last name"
        />
      </UFormField>

      <!-- Email -->
      <UFormField label="Email" name="email" required>
        <UInput
          class="w-full"
          v-model="state.email"
          type="email"
          placeholder="Enter your email"
        />
      </UFormField>

      <!-- Password -->
      <UFormField label="Password" name="password" required>
        <UInput
          class="w-full"
          v-model="state.password"
          type="password"
          placeholder="********"
        />
      </UFormField>

      <!-- Confirm Password -->
      <UFormField label="Confirm Password" name="password_confirmation" required>
        <UInput
          class="w-full"
          v-model="state.password_confirmation"
          type="password"
          placeholder="********"
        />
      </UFormField>
    </div>

    <UButton
      type="submit"
      block
      :loading="loading"
    >
      Get Started
    </UButton>
  </UForm>
</template>

<script setup lang="ts">
import { RegisterSchema, type RegisterFormFields } from '~/schemas'
import type { FormSubmitEvent } from '@nuxt/ui'
import { routes } from '~/routes'

const errorMessage = ref<string | null>(null)
const loading = ref(false)

const schema = RegisterSchema

const state = reactive<Partial<RegisterFormFields>>({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const { register } = useAuthApi()

async function onSubmit(event: FormSubmitEvent<RegisterFormFields>) {
  loading.value = true
  errorMessage.value = null
  
  try {
    const payload = {
      ...event.data,
      device_name: `${navigator.userAgent.split(' ')[0]} Browser`
    }
    
    const response = await register(payload)
    const { setAuth } = useAuthStore()
    const { UserMapper } = await import('@/models/user')
    
    // Auto-login after successful registration
    if (response.data) {
      const { user: userDTO, access_token, refresh_token, expires_in } = response.data
      const user = UserMapper.toModel(userDTO)
      setAuth({ user, access_token, refresh_token, expires_in })
      
      // Redirect based on workspace status
      if (user.lastActiveWorkspaceId) {
        await navigateTo(routes.dashboard)
      } else {
        await navigateTo(routes.workspaceOnboarding)
      }
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    errorMessage.value = error.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>