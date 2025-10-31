<template>
  <div class="bg-white flex space-y-8 space-x-8">
    <UForm :state="state" class="space-y-8 w-md" @submit="onSubmit">
      <!-- Request Type -->
      <UFormField label="Request type" name="requestType" required>
        <USelectMenu
          v-model="selectedWorkflow"
          :items="workflows"
          label-key="name"
          placeholder="Select request type"
          class="w-full"
          size="lg"
        />
      </UFormField>
      
      <!-- Dynamic Workflow Fields -->
      <div v-if="selectedWorkflow" class="space-y-6">
        <USeparator />
        <template v-for="field in selectedWorkflow.fields" :key="field.key">
          <UFormField :label="field.label" :name="`field_${field.key}`" :required="field.required">
            <UInput
              v-if="field.type === 'short_text' || field.type === 'email' || field.type === 'url'"
              v-model="state.context[field.key]"
              type="text"
              class="w-full"
              :placeholder="field.description"
              size="lg"
            />
            <UTextarea
              v-else-if="field.type === 'long_text'"
              v-model="state.context[field.key]"
              class="w-full"
              :placeholder="field.description"
              :rows="5"
              size="lg"
            />
            <UInput
              v-else-if="field.type === 'amount' || field.type === 'currency'"
              v-model="state.context[field.key]"
              type="number"
              class="w-full"
              :placeholder="field.description"
              size="lg"
            />
            <UInput
              v-else-if="field.type === 'date'"
              v-model="state.context[field.key]"
              type="date"
              class="w-full"
              size="lg"
            />
            <UInput
              v-else-if="field.type === 'datetime'"
              v-model="state.context[field.key]"
              type="datetime-local"
              class="w-full"
              size="lg"
            />
            <USelectMenu
              v-else-if="field.type === 'select'"
              v-model="state.context[field.key]"
              :items="field.options || []"
              placeholder="Select an option"
              class="w-full"
              size="lg"
            />
            <USelectMenu
              v-else-if="field.type === 'multi_select'"
              v-model="state.context[field.key]"
              :items="field.options || []"
              placeholder="Select options"
              multiple
              class="w-full"
              size="lg"
            />
            <UCheckbox
              v-else-if="field.type === 'boolean'"
              v-model="state.context[field.key]"
              :label="field.description"
            />
            <UInput
              v-else
              v-model="state.context[field.key]"
              type="text"
              class="w-full"
              :placeholder="field.description"
              size="lg"
            />
            <template v-if="field.description" #help>
              {{ field.description }}
            </template>
          </UFormField>
        </template>

        <!-- Followers -->
        <UFormField v-if="selectedWorkflow" label="Followers" name="followers">
          <div class="space-y-2">
            <USelectMenu
              v-model="selectedFollowers"
              :items="followers"
              label-key="email"
              placeholder="Select followers"
              size="lg"
              multiple
              class="w-full"
            />
            <div v-if="selectedFollowers.length > 0" class="flex flex-wrap gap-2">
              <UBadge v-for="follower in selectedFollowers" :key="follower.email" color="neutral" variant="outline" size="lg">
                {{ follower.firstName }} {{ follower.lastName }}
              </UBadge>
            </div>
          </div>
          <template #help>
            Everyone on this list will get notified when this request is updated
          </template>
        </UFormField>

        <!-- Submit Button -->
        <div class="flex py-4">
          <UButton
            type="submit"
            color="primary"
            size="lg"
            :loading="loading"
            class="w-full justify-center"
          >
            Submit request
          </UButton>
        </div>
      </div>
    </UForm>

    <div class="w-md space-y-8">
      <!-- Workflow Steps (auto-populated from workflow) -->
      <UFormField v-if="selectedWorkflow" label="Workflow Steps" name="steps">
        <div class="space-y-3">
          <div v-for="step in selectedWorkflow.steps" :key="step.key" class="p-3 bg-elevated rounded-md">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-xs font-semibold uppercase text-muted">{{ getStepTypeLabel(step.type) }}</h4>
              <UBadge color="neutral" variant="soft" size="sm">{{ step.key }}</UBadge>
            </div>
            <div v-if="step.assignees?.length" class="flex flex-wrap gap-2">
              <UBadge v-for="assigneeId in step.assignees" :key="assigneeId" color="primary" variant="outline" size="sm">
                {{ getUserById(assigneeId)?.firstName }} {{ getUserById(assigneeId)?.lastName }}
              </UBadge>
            </div>
            <div v-else-if="step.assignee" class="flex flex-wrap gap-2">
              <UBadge color="primary" variant="outline" size="sm">
                {{ getUserById(step.assignee)?.firstName }} {{ getUserById(step.assignee)?.lastName }}
              </UBadge>
            </div>
            <p v-if="step.condition" class="text-xs text-muted mt-2">
              Condition: {{ step.condition }}
            </p>
          </div>
        </div>
      </UFormField>

      <!-- Start Step -->
      <UFormField v-if="selectedWorkflow" label="Start Step" name="startStep">
        <div class="p-3 bg-elevated rounded-md">
          <UBadge color="success" variant="soft" size="lg">
            {{ selectedWorkflow.startKey }}
          </UBadge>
        </div>
      </UFormField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { Workflow } from '@/models/workflow'
import type { User } from '@/models/user'
import { routes } from '@/routes'

const loading = ref(false)
const { getWorkflows } = useWorkflowsApi()
const { getUsers } = useUsersApi()
const { createRequest } = useRequestsApi()

// Fetch workflows from API
const { data: workflows, pending: workflowsLoading } = await getWorkflows()

// Fetch users for followers
const { data: followers, pending: followersLoading } = await getUsers()

// Form state
const selectedWorkflow = ref<Workflow | undefined>(undefined)
const selectedFollowers = ref<User[]>([])

const state = reactive({
  requestType: '',
  followers: [] as User[],
  context: {} as Record<string, any>
})

// Step type labels
const stepTypeLabels: Record<string, string> = {
  'approval': 'Approval',
  'action': 'Action',
  'gateway:exclusive': 'Exclusive Gateway',
  'gateway:parallel': 'Parallel Gateway',
  'system_task': 'System Task'
}

function getStepTypeLabel(type: string): string {
  return stepTypeLabels[type] || type
}

function getUserById(id: string): User | undefined {
  return followers.value?.find(user => user.id === id)
}

// Reset context when workflow changes
watch(selectedWorkflow, (newWorkflow) => {
  if (newWorkflow) {
    state.context = {}
  }
})

async function onSubmit() {
  if (!selectedWorkflow.value) return

  loading.value = true

  try {
    // Create request via API with new context structure
    await createRequest({
      workflow_id: selectedWorkflow.value.id,
      context: state.context,
      observers: selectedFollowers.value.map(f => f.id)
    })

    // Navigate back to requests list
    await navigateTo(routes.requests)
  } catch (error) {
    console.error('Error creating request:', error)
    // TODO: Show error toast
  } finally {
    loading.value = false
  }
}
</script>
