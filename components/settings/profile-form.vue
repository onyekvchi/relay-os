<template>
  <div class="max-w-lg">
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

    <!-- Profile Picture -->
    <div class="flex items-center justify-between py-4 border-b border-muted">
      <label class="text-sm font-semibold">Profile picture</label>
      <div class="relative group cursor-pointer">
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileChange"
        />
        <UAvatar 
          :src="profilePicture" 
          :text="userInitials" 
          size="lg"
          @click="triggerFileInput"
        />
        <div 
          class="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          @click="triggerFileInput"
        >
          <UIcon name="i-heroicons-camera" class="text-white size-5" />
        </div>
      </div>
    </div>

    <!-- Email (Read-only) -->
    <div class="flex items-center justify-between py-4 border-b border-muted">
      <label class="text-sm font-semibold">Email</label>
      <span class="text-sm text-muted">{{ user?.email }}</span>
    </div>

    <!-- First Name -->
    <div class="flex items-center justify-between py-4 border-b border-muted">
      <label class="text-sm font-semibold">First name</label>
      <UInput 
        v-model="firstName" 
        class="w-48"
        placeholder="Enter first name"
      />
    </div>

    <!-- Last Name -->
    <div class="flex items-center justify-between py-4 border-b border-muted">
      <label class="text-sm font-semibold">Last name</label>
      <UInput 
        v-model="lastName" 
        class="w-48"
        placeholder="Enter last name"
      />
    </div>

    <!-- Phone Number -->
    <div class="flex items-center justify-between py-4 border-b border-muted">
      <label class="text-sm font-semibold">Phone number</label>
      <UInput 
        v-model="phoneNumber" 
        class="w-48"
        placeholder="+234 800 000 0000"
      />
    </div>

    <!-- Save Button -->
    <div class="flex justify-end pt-4">
      <UButton
        :loading="isSaving"
        :disabled="!hasChanges"
        @click="handleSave"
      >
        Save changes
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserMapper } from '@/models/user'

const authStore = useAuthStore()
const { updateCurrentUser } = useUsersApi()
const user = computed(() => authStore.getUser)

// Form fields
const firstName = ref(user.value?.firstName || '')
const lastName = ref(user.value?.lastName || '')
const phoneNumber = ref(user.value?.phoneNumber || '')
const profilePicture = ref<string | undefined>(undefined)
const fileInput = ref<HTMLInputElement | null>(null)

// UI state
const isSaving = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

// Computed
const userInitials = computed(() => {
  const first = user.value?.firstName || ''
  const last = user.value?.lastName || ''
  if (first && last) {
    return first[0] + last[0]
  }
  return first[0] || 'U'
})

const hasChanges = computed(() => {
  return (
    firstName.value !== user.value?.firstName ||
    lastName.value !== user.value?.lastName ||
    phoneNumber.value !== user.value?.phoneNumber
  )
})

// Methods
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      profilePicture.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

async function handleSave() {
  isSaving.value = true
  successMessage.value = null
  errorMessage.value = null

  try {
    const updatedUser = await updateCurrentUser({
      first_name: firstName.value,
      last_name: lastName.value,
      phone_number: phoneNumber.value,
    })

    if (updatedUser) {
      // Update store with the updated user model
      authStore.setUser(updatedUser)
      
      successMessage.value = 'Profile updated successfully'
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update profile'
  } finally {
    isSaving.value = false
  }
}
</script>
