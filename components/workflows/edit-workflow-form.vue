<template>
  <div class="bg-white flex space-y-8 space-x-8">
    <UForm :state="state" class="space-y-8 w-md" @submit="onSubmit">
      <!-- Workflow Name -->
      <UFormField label="Workflow name" name="name" required>
        <UInput
          v-model="state.name"
          type="text"
          placeholder="e.g., Pricing Change Request"
          class="w-full"
          size="lg"
        />
        <template #help>
          Give your workflow a descriptive name
        </template>
      </UFormField>

      <USeparator />

      <!-- Workflow Fields -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold">Workflow Fields</h3>
          <UButton
            type="button"
            color="primary"
            variant="outline"
            size="sm"
            @click="addField"
          >
            Add Field
          </UButton>
        </div>

        <div v-if="state.fields.length === 0" class="text-sm text-muted p-4 bg-elevated rounded-md">
          No fields added yet. Click "Add Field" to create form fields for this workflow.
        </div>

        <div v-for="(field, index) in state.fields" :key="index" class="space-y-3 p-4 bg-elevated rounded-md">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-semibold uppercase text-muted">Field {{ index + 1 }}</h4>
            <UButton
              type="button"
              color="error"
              variant="ghost"
              size="xs"
              @click="removeField(index)"
            >
              Remove
            </UButton>
          </div>

          <UFormField :label="`Field ${index + 1} Label`" :name="`field_${index}_label`" required>
            <UInput
              v-model="field.label"
              type="text"
              placeholder="e.g., Merchant name"
              class="w-full"
              size="md"
            />
          </UFormField>

          <UFormField :label="`Field ${index + 1} Type`" :name="`field_${index}_type`" required>
            <USelectMenu
              v-model="field.type"
              :items="fieldTypes"
              label-key="label"
              value-key="value"
              placeholder="Select field type"
              class="w-full"
              size="md"
            />
          </UFormField>

          <UFormField :label="`Field ${index + 1} Description`" :name="`field_${index}_description`">
            <UInput
              v-model="field.description"
              type="text"
              placeholder="e.g., Whose pricing do you want to change?"
              class="w-full"
              size="md"
            />
          </UFormField>
        </div>
      </div>

      <USeparator />

      <!-- Submit Button -->
      <div class="flex gap-3 py-4">
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          size="lg"
          class="flex-1 justify-center"
          @click="handleCancel"
        >
          Cancel
        </UButton>
        <UButton
          type="submit"
          color="primary"
          size="lg"
          :loading="loading"
          class="flex-1 justify-center"
        >
          Save Changes
        </UButton>
      </div>
    </UForm>

    <div class="w-md space-y-8">
      <!-- Approval Steps -->
      <UFormField label="Approval Steps" name="approvalSteps">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted">Define approval levels for this workflow</p>
            <UButton
              type="button"
              color="primary"
              variant="outline"
              size="sm"
              @click="addApprovalStep"
            >
              Add Level
            </UButton>
          </div>

          <div v-if="state.steps.length === 0" class="text-sm text-muted p-4 bg-elevated rounded-md">
            No approval levels added yet. Click "Add Level" to create approval steps.
          </div>

          <div v-for="(step, stepIndex) in state.steps" :key="stepIndex" class="space-y-3 p-4 bg-elevated rounded-md">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-semibold uppercase text-muted">Level {{ stepIndex + 1 }}</h4>
              <UButton
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                @click="removeApprovalStep(stepIndex)"
              >
                Remove
              </UButton>
            </div>

            <UFormField label="Step Type" :name="`step_${stepIndex}_type`" required>
              <USelectMenu
                v-model="step.type"
                :items="[
                  { label: 'Approval', value: 'approval' },
                  { label: 'Action', value: 'action' },
                  { label: 'Exclusive Gateway', value: 'gateway:exclusive' },
                  { label: 'Parallel Gateway', value: 'gateway:parallel' },
                  { label: 'System Task', value: 'system_task' }
                ]"
                label-key="label"
                value-key="value"
                placeholder="Select step type"
                size="md"
                class="w-full"
              />
            </UFormField>

            <UFormField v-if="step.type === 'approval' || step.type === 'action'" :label="step.type === 'approval' ? 'Assignees' : 'Assignee'" :name="`step_${stepIndex}_assignees`" required>
              <USelectMenu
                v-model="step.assignees"
                :items="availableUsers?.map(user => ({ label: `${user.firstName} ${user.lastName}`, value: user.id })) || []"
                label-key="label"
                value-key="value"
                :placeholder="step.type === 'approval' ? 'Select assignees' : 'Select assignee'"
                size="md"
                :multiple="step.type === 'approval'"
                class="w-full"
              />
            </UFormField>

            <div v-if="step.assignees?.length" class="flex flex-wrap gap-2">
              <UBadge v-for="assigneeId in step.assignees" :key="assigneeId" color="neutral" variant="outline" size="md">
                {{ getUserById(assigneeId)?.firstName }} {{ getUserById(assigneeId)?.lastName }}
              </UBadge>
            </div>
          </div>
        </div>
      </UFormField>

      <!-- Start Key -->
      <UFormField label="Start Step Key" name="startKey" required>
        <UInput
          v-model="state.startKey"
          placeholder="e.g., start"
          size="lg"
          class="w-full"
        />
        <template #help>
          The key of the first step in the workflow
        </template>
      </UFormField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { WorkflowFieldType } from '@/models/workflow'
import type { User } from '@/models/user'
import { routes } from '@/routes'

const props = defineProps<{
  workflowId: string
}>()

const loading = ref(false)
const { getWorkflow, updateWorkflow } = useWorkflowsApi()
const { getUsers } = useUsersApi()

// Fetch available users for step assignees

function getUserById(id: string) {
  return availableUsers.value?.find(user => user.id === id)
}
const { data: availableUsers, pending: usersLoading } = await getUsers()

// Fetch existing workflow data
const { data: existingWorkflow, pending: workflowLoading } = await getWorkflow(props.workflowId)

// Field type options
const fieldTypes = [
  { label: 'Short Text', value: WorkflowFieldType.short_text },
  { label: 'Long Text', value: WorkflowFieldType.long_text },
  { label: 'Currency', value: WorkflowFieldType.currency },
  { label: 'Amount', value: WorkflowFieldType.amount },
  { label: 'Select', value: WorkflowFieldType.select },
  { label: 'Multi Select', value: WorkflowFieldType.multi_select },
  { label: 'Date', value: WorkflowFieldType.date },
  { label: 'Date Time', value: WorkflowFieldType.datetime },
  { label: 'Boolean', value: WorkflowFieldType.boolean },
  { label: 'Email', value: WorkflowFieldType.email },
  { label: 'URL', value: WorkflowFieldType.url },
]

// Form state
const state = reactive({
  name: '',
  startKey: '',
  fields: [] as Array<{ label: string, type: WorkflowFieldType, description: string }>,
  steps: [] as Array<{ 
    key: string
    type: 'approval' | 'action' | 'gateway:exclusive' | 'gateway:parallel' | 'system_task'
    assignees?: string[]
    assignee?: string
    condition?: string
    next?: string
    branches?: Array<{ condition: string; to: string }>
  }>
})

// Load existing workflow data into form state
watch(existingWorkflow, (workflow) => {
  if (workflow) {
    state.name = workflow.name
    state.startKey = workflow.startKey
    state.fields = workflow.fields.map(f => ({
      label: f.label,
      type: f.type,
      description: f.description || ''
    }))
    
    // Load steps from new step-based system
    state.steps = workflow.steps || []
  }
}, { immediate: true })

function addField() {
  state.fields.push({
    label: '',
    type: WorkflowFieldType.short_text,
    description: ''
  })
}

function removeField(index: number) {
  state.fields.splice(index, 1)
}

function addApprovalStep() {
  state.steps.push({
    key: `step_${state.steps.length + 1}`,
    type: 'approval',
    assignees: []
  })
}

function removeApprovalStep(index: number) {
  state.steps.splice(index, 1)
}

function handleCancel() {
  navigateTo(routes.workflow(props.workflowId))
}

async function onSubmit() {
  loading.value = true

  try {
    // Update workflow via API
    await updateWorkflow(props.workflowId, {
      name: state.name,
      workflow_key: existingWorkflow.value?.workflowKey || '',
      start_key: existingWorkflow.value?.startKey || 'start',
      description: existingWorkflow.value?.description,
      fields: state.fields.map((field, index) => ({
        key: field.label.toLowerCase().replace(/\s+/g, '_'),
        label: field.label,
        type: field.type as any,
        description: field.description,
        required: true,
        position: index
      })),
      steps: state.steps
    })

    // Navigate back to workflow detail
    await navigateTo(routes.workflow(props.workflowId))
  } catch (error) {
    console.error('Error updating workflow:', error)
    // TODO: Show error toast
  } finally {
    loading.value = false
  }
}
</script>
