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
        <template v-for="(field, index) in selectedWorkflow.fields" :key="index">
          <UFormField :label="field.label" :name="`field_${index}`" required>
            <UInput
              v-if="field.type === WorkflowFieldType.string"
              v-model="state.fields[index]"
              type="text"
              class="w-full"
              :placeholder="field.description"
              size="lg"
            />
            <UInput
              v-else-if="field.type === WorkflowFieldType.amount || field.type === WorkflowFieldType.integer || field.type === WorkflowFieldType.decimal"
              v-model="state.fields[index]"
              type="number"
              class="w-full"
              :placeholder="field.description"
              size="lg"
            />
            <UTextarea
              v-else-if="field.type === WorkflowFieldType.text"
              v-model="state.fields[index]"
              class="w-full"
              :placeholder="field.description"
              :rows="5"
              size="lg"
            />
            <UInput
              v-else
              v-model="state.fields[index]"
              type="text"
              class="w-full"
              :placeholder="field.description"
              size="lg"
            />
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
      <!-- Approvers (auto-populated from workflow) -->
      <UFormField v-if="selectedWorkflow" label="Approvers" name="approvers">
        <div class="flex flex-wrap gap-2 p-3 bg-elevated">
          <UBadge v-for="approval in selectedWorkflow.approvals" :key="approval.approver.email" color="neutral" variant="outline" size="lg">
            {{ approval.approver.firstName }} {{ approval.approver.lastName }}
          </UBadge>
        </div>
      </UFormField>

      <!-- Action Taker (auto-populated from workflow) -->
      <UFormField v-if="selectedWorkflow" label="Action taker" name="actionTaker">
        <div class="flex flex-wrap gap-2 p-3 bg-elevated">
          <UBadge color="neutral" variant="outline" size="lg">
            {{ selectedWorkflow.action.actor.firstName }} {{ selectedWorkflow.action.actor.lastName }}
          </UBadge>
        </div>
      </UFormField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { WorkflowFieldType, type Workflow } from '@/models/workflow'
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
  fields: {} as Record<number, any>
})

// Reset fields when workflow changes
watch(selectedWorkflow, (newWorkflow) => {
  if (newWorkflow) {
    state.fields = {}
  }
})

async function onSubmit() {
  if (!selectedWorkflow.value) return

  loading.value = true

  try {
    // Map form fields to field_values object
    const fieldValues: Record<string, any> = {}
    selectedWorkflow.value.fields.forEach((field, index) => {
      fieldValues[field.label] = state.fields[index]
    })

    // Create request via API
    await createRequest({
      workflow_id: selectedWorkflow.value.id,
      field_values: fieldValues,
      observer_ids: selectedFollowers.value.map(f => f.id)
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
