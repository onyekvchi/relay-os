<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Welcome! Let's set up your workspace
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Choose a workspace to join or create a new one
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Available Workspaces -->
        <div v-if="availableWorkspaces.length > 0" class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Available Workspaces</h3>
          <div class="space-y-3">
            <button
              v-for="workspace in availableWorkspaces"
              :key="workspace.id"
              @click="joinWorkspace(workspace.id)"
              :disabled="loading"
              class="w-full flex items-center justify-between p-4 border border-gray-300 rounded-md hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <div class="flex items-center">
                <div v-if="workspace.logo" class="w-8 h-8 bg-gray-200 rounded mr-3"></div>
                <div class="text-left">
                  <div class="font-medium text-gray-900">{{ workspace.name }}</div>
                  <div class="text-sm text-gray-500">{{ workspace.member_count }} members</div>
                </div>
              </div>
              <UIcon name="i-heroicons-arrow-right" class="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <!-- Divider -->
        <div v-if="availableWorkspaces.length > 0" class="relative mb-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <!-- Create New Workspace -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Create New Workspace</h3>
          <UForm :schema="schema" :state="state" @submit="createWorkspace">
            <div class="space-y-4">
              <UFormField label="Workspace Name" name="name" required>
                <UInput v-model="state.name" placeholder="Enter workspace name" />
              </UFormField>
              
              <UFormField label="Workspace URL" name="url" required>
                <UInput v-model="state.url" placeholder="my-company" />
                <template #help>
                  This will be used in your workspace URL
                </template>
              </UFormField>
            </div>

            <UButton type="submit" block :loading="loading" class="mt-6">
              Create Workspace
            </UButton>
          </UForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { routes } from '@/routes'

definePageMeta({
  auth: true,
  layout: false
})

const schema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  url: z.string().min(1, 'Workspace URL is required').regex(/^[a-z0-9-]+$/, 'URL can only contain lowercase letters, numbers, and hyphens')
})

type FormData = z.output<typeof schema>

const state = reactive<FormData>({
  name: '',
  url: ''
})

const loading = ref(false)
const availableWorkspaces = ref([])

// Auto-generate URL from name
watch(() => state.name, (newName) => {
  if (newName && !state.url) {
    state.url = newName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }
})

async function createWorkspace(event: FormSubmitEvent<FormData>) {
  loading.value = true
  
  try {
    const { createWorkspace } = useWorkspaceApi()
    const { WorkspaceMapper } = await import('@/models/workspace')
    const response = await createWorkspace(event.data)
    const workspace = WorkspaceMapper.toModel(response.data!)
    
    // Update user's active workspace
    const { setUser, getUser } = useAuthStore()
    if (getUser) {
      setUser({ 
        ...getUser, 
        lastActiveWorkspaceId: workspace.id 
      })
    }
    
    await navigateTo(routes.dashboard)
  } catch (error: any) {
    console.error('Workspace creation error:', error)
  } finally {
    loading.value = false
  }
}

async function joinWorkspace(workspaceId: string) {
  loading.value = true
  
  try {
    // Update user's active workspace
    const { setUser, getUser } = useAuthStore()
    if (getUser) {
      setUser({ 
        ...getUser, 
        lastActiveWorkspaceId: workspaceId 
      })
    }
    
    await navigateTo(routes.dashboard)
  } catch (error: any) {
    console.error('Join workspace error:', error)
  } finally {
    loading.value = false
  }
}

// Load available workspaces on mount
onMounted(async () => {
  try {
    // This would fetch workspaces the user has access to
    // For now, we'll just show the create workspace form
    availableWorkspaces.value = []
  } catch (error) {
    console.error('Failed to load workspaces:', error)
  }
})
</script>