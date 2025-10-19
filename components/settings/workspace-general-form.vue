<template>
  <div class="max-w-lg space-y-8">
    <!-- Workspace Section -->
    <div class="space-y-4">
      <div>
        <h3 class="text-base font-semibold tracking-tight">Workspace</h3>
      </div>

      <div class="border border-muted rounded-lg p-4">
        <!-- Logo -->
        <div class="flex items-center justify-between py-4 border-b border-muted">
          <div>
            <label class="text-sm font-medium">Logo</label>
            <p class="text-xs text-muted">Recommended size is 256x256px</p>
          </div>
          <div class="relative group cursor-pointer">
            <input
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
              @click="triggerLogoInput"
            />
            <div 
              class="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              @click="triggerLogoInput"
            >
              <UIcon name="i-heroicons-camera" class="text-white size-5" />
            </div>
          </div>
        </div>

        <!-- Name -->
        <div class="flex items-center justify-between py-4 border-b border-muted">
          <label class="text-sm font-medium">Name</label>
          <UInput 
            v-model="workspaceName" 
            class="w-48"
            placeholder="Workspace name"
          />
        </div>

        <!-- URL -->
        <div class="flex items-center justify-between py-4">
          <label class="text-sm font-medium">URL</label>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted">relayos.app/</span>
            <UInput 
              v-model="workspaceUrl" 
              class="w-32"
              placeholder="workspace-url"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Danger Zone Section -->
    <div class="space-y-4">
      <div>
        <h3 class="text-base font-semibold tracking-tight">Danger zone</h3>
      </div>

      <div class="border border-muted rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h4 class="text-sm font-medium">Delete workspace</h4>
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
const workspaceName = ref('AndCo Labs')
const workspaceUrl = ref('and-co')
const workspaceLogo = ref<string | undefined>(undefined)
const logoInput = ref<HTMLInputElement | null>(null)

const workspaceInitials = computed(() => {
  if (!workspaceName.value) return 'W'
  const words = workspaceName.value.split(' ')
  if (words.length >= 2) {
    return words[0][0] + words[1][0]
  }
  return words[0].substring(0, 2).toUpperCase()
})

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
