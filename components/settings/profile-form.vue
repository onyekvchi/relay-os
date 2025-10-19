<template>
  <div class="max-w-lg">
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

    <!-- Email -->
    <div class="flex items-center justify-between py-4 border-b border-muted">
      <label class="text-sm font-semibold">Email</label>
      <div class="flex items-center gap-2">
        <span class="text-sm">{{ user?.email }}</span>
        <UButton variant="ghost" size="xs" icon="i-heroicons-pencil" />
      </div>
    </div>

    <!-- Full Name -->
    <div class="flex items-center justify-between py-4 border-b border-muted">
      <label class="text-sm font-semibold">Full name</label>
      <UInput 
        v-model="fullName" 
        class="w-48"
        placeholder="Enter your full name"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const user = computed(() => authStore.getUser)

const fullName = ref(user.value?.name || '')
const profilePicture = ref<string | undefined>(undefined)
const fileInput = ref<HTMLInputElement | null>(null)

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  const names = user.value.name.split(' ')
  if (names.length >= 2) {
    return names[0][0] + names[1][0]
  }
  return names[0][0]
})

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
</script>
