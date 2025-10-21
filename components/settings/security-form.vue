<template>
  <div class="max-w-lg space-y-8">
    <!-- Success/Error Messages -->
    <UAlert
      v-if="successMessage"
      color="success"
      variant="soft"
      :title="successMessage"
      :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link' }"
      @close="successMessage = null"
    />
    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      :title="errorMessage"
      :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link' }"
      @close="errorMessage = null"
    />

    <!-- Password Section -->
    <div class="space-y-4">
      <div>
        <h3 class="text-base font-semibold tracking-tight">Password</h3>
        <p class="text-sm text-muted">You can change your password here.</p>
      </div>

      <div class="border border-muted rounded-lg p-4 space-y-6">
        <!-- Current Password -->
        <div class="space-y-2">
          <label class="text-sm font-semibold">Current password</label>
          <p class="text-xs text-muted mb-2">You must confirm your current password to make changes.</p>
          <UInput 
            v-model="currentPassword"
            type="password"
            placeholder=""
            class="w-full"
          >
            <template #trailing>
              <UButton
                variant="ghost"
                size="xs"
                :icon="showCurrentPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                @click="showCurrentPassword = !showCurrentPassword"
              />
            </template>
          </UInput>
        </div>

        <!-- New Password -->
        <div class="space-y-2">
          <label class="text-sm font-semibold">New password</label>
          <p class="text-xs text-muted mb-2">Passwords must be at least 8 characters.</p>
          <UInput 
            v-model="newPassword"
            type="password"
            placeholder=""
            class="w-full"
          >
            <template #trailing>
              <UButton
                variant="ghost"
                size="xs"
                :icon="showNewPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                @click="showNewPassword = !showNewPassword"
              />
            </template>
          </UInput>
        </div>

        <!-- Confirm New Password -->
        <div class="space-y-2">
          <label class="text-sm font-semibold">Confirm new password</label>
          <p class="text-xs text-muted mb-2">Enter your new password again.</p>
          <UInput 
            v-model="confirmPassword"
            type="password"
            placeholder=""
            class="w-full"
          >
            <template #trailing>
              <UButton
                variant="ghost"
                size="xs"
                :icon="showConfirmPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </UInput>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end pt-2">
          <UButton
            :loading="isSaving"
            :disabled="!canSavePassword"
            @click="handlePasswordChange"
          >
            Update password
          </UButton>
        </div>
      </div>
    </div>

    <!-- Two-Factor Authentication -->
    <div class="space-y-4">
      <div>
        <h3 class="text-base font-semibold tracking-tight">Security</h3>
        <p class="text-sm text-muted">Enable extra security for your account.</p>
      </div>

      <div class="border border-muted rounded-lg p-4">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <h4 class="text-sm font-semibold">Enable two-factor authentication</h4>
            <p class="text-xs text-muted mt-1">
              When enabled you will be prompted for a secure, random token from your phone's authentication application.
            </p>
          </div>
          <UButton variant="outline" size="sm" @click="handleEnable2FA">
            Enable
          </UButton>
        </div>
      </div>
    </div>

    <!-- Sessions -->
    <div class="space-y-4">
      <div>
        <h3 class="text-base font-semibold tracking-tight">Sessions</h3>
        <p class="text-sm text-muted">Devices logged into your account</p>
      </div>

      <!-- Current Session -->
      <div class="border border-muted rounded-lg p-4">
        <div class="flex items-start gap-4">
          <div class="size-10 rounded-lg bg-muted flex items-center justify-center">
            <UIcon name="i-heroicons-computer-desktop" class="size-5" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold">Arc on macOS</p>
            <p class="text-xs text-muted">
              <span class="text-primary">• Current session</span> · Alimosho, NG
            </p>
          </div>
        </div>
      </div>

      <!-- Other Sessions -->
      <div class="border border-muted rounded-lg">
        <div class="p-4 flex items-center justify-between border-b border-muted">
          <p class="text-sm font-semibold">1 other session</p>
          <UButton variant="ghost" size="sm">
            Revoke all
          </UButton>
        </div>

        <div class="p-4 flex items-start gap-4">
          <div class="size-10 rounded-lg bg-muted flex items-center justify-center">
            <UIcon name="i-heroicons-computer-desktop" class="size-5" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold">Chrome on macOS</p>
            <p class="text-xs text-muted">Ikeja, NG · Last seen 29 days ago</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Passkeys -->
    <div class="space-y-4">
      <div>
        <h3 class="text-base font-semibold tracking-tight">Passkeys</h3>
        <p class="text-sm text-muted">Passkeys are a secure way to sign in to your RelayOS account</p>
      </div>

      <div class="border border-muted rounded-lg p-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-muted">No passkeys registered</p>
          <UButton variant="outline" size="sm">
            New passkey
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { updatePassword } = useSettingsApi()

// Password fields
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// UI state
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isSaving = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

// Validation
const canSavePassword = computed(() => {
  return (
    currentPassword.value.length > 0 &&
    newPassword.value.length >= 8 &&
    confirmPassword.value.length > 0 &&
    newPassword.value === confirmPassword.value
  )
})

// Password change handler
async function handlePasswordChange() {
  if (!canSavePassword.value) return

  isSaving.value = true
  successMessage.value = null
  errorMessage.value = null

  try {
    const { data, error } = await updatePassword({
      current_password: currentPassword.value,
      new_password: newPassword.value,
    })

    if (error.value) {
      throw new Error(error.value.message || 'Failed to update password')
    }

    if (data.value?.success) {
      successMessage.value = 'Password updated successfully'
      
      // Clear form
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update password'
  } finally {
    isSaving.value = false
  }
}

// Dummy handlers for other sections
function handleEnable2FA() {
  console.log('2FA feature coming soon')
}
</script>
