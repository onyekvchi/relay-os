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

    <!-- Workspace Section -->
    <div class="space-y-4">
      <div>
        <h3 class="text-base font-semibold tracking-tight">Workspace</h3>
      </div>

      <div>
        <!-- Logo -->
        <div class="flex items-center justify-between py-4 border-b border-muted">
          <div>
            <label class="text-sm font-semibold">Logo</label>
            <p class="text-xs text-muted">Recommended size is 256x256px</p>
          </div>
          <div class="relative group" :class="{ 'cursor-pointer': canUpdateWorkspace }">
            <input
              v-if="canUpdateWorkspace"
              ref="logoInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleLogoChange"
            />
            <UAvatar 
              :src="workspaceLogo" 
              :text="workspaceInitials" 
              size="lg"
              @click="canUpdateWorkspace ? triggerLogoInput() : undefined"
            />
            <div 
              v-if="canUpdateWorkspace"
              class="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              @click="triggerLogoInput"
            >
              <UIcon name="i-heroicons-camera" class="text-white size-5" />
            </div>
          </div>
        </div>

        <!-- Name -->
        <div class="flex items-center justify-between py-4 border-b border-muted">
          <label class="text-sm font-semibold">Name</label>
          <UInput
            v-model="workspaceName"
            placeholder="Enter workspace name"
            class="w-48"
            :disabled="!canUpdateWorkspace"
          />
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end pt-2">
        <UButton 
          v-if="canUpdateWorkspace"
          :loading="isSaving" 
          :disabled="!hasChanges"
          @click="handleSave"
        >
          Save changes
        </UButton>
      </div>
    </div>

    <!-- Danger Zone Section (Admin only) -->
    <div v-if="canUpdateWorkspace" class="space-y-4">
      <div>
        <h3 class="text-base font-semibold tracking-tight">Danger zone</h3>
      </div>

      <div class="border border-muted rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h4 class="text-sm font-semibold">Delete workspace</h4>
            <p class="text-xs text-muted mt-1">Schedule workspace to be permanently deleted</p>
          </div>
          <UButton 
            variant="outline" 
            size="sm" 
            color="error"
            @click="handleDeleteWorkspace"
          >
            Delete workspace
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getCurrentWorkspace, updateCurrentWorkspace } = useWorkspaceApi()
const { canUpdateWorkspace } = usePermissions()

// State
const workspaceName = ref('')
const workspaceLogo = ref<string | undefined>(undefined)
const logoInput = ref<HTMLInputElement | null>(null)
const isSaving = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

// Original values for change detection
const originalName = ref('')
const originalLogo = ref<string | undefined>(undefined)

const workspaceInitials = computed(() => {
  if (!workspaceName.value) return 'W'
  const words = workspaceName.value.split(' ')
  if (words.length >= 2) {
    return words[0][0] + words[1][0]
  }
  return words[0].substring(0, 2).toUpperCase()
})

const hasChanges = computed(() => {
  return (
    workspaceName.value !== originalName.value ||
    workspaceLogo.value !== originalLogo.value
  )
})

// Fetch workspace data on mount
onMounted(async () => {
  await fetchWorkspace()
})

async function fetchWorkspace() {
  try {
    const response = await getCurrentWorkspace()
    
    if (response?.data) {
      workspaceName.value = response.data.name
      workspaceLogo.value = response.data.logo
      originalName.value = response.data.name
      originalLogo.value = response.data.logo
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to load workspace'
  }
}

async function handleSave() {
  if (!hasChanges.value) return

  isSaving.value = true
  successMessage.value = null
  errorMessage.value = null

  try {
    const response = await updateCurrentWorkspace({
      name: workspaceName.value,
      logo: workspaceLogo.value
    })

    if (response?.data) {
      successMessage.value = 'Workspace updated successfully'
      originalName.value = workspaceName.value
      originalLogo.value = workspaceLogo.value
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update workspace'
  } finally {
    isSaving.value = false
  }
}

function triggerLogoInput() {
  logoInput.value?.click()
}

function handleLogoChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      workspaceLogo.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function handleDeleteWorkspace() {
  // TODO: Implement workspace deletion logic
  console.log('Delete workspace clicked')
}
</script>
