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

      <!-- Workflow Key -->
      <UFormField label="Workflow key" name="workflowKey" required>
        <UInput
          v-model="state.workflowKey"
          type="text"
          placeholder="e.g., pricing_change_request"
          class="w-full"
          size="lg"
        />
        <template #help>
          A unique identifier for this workflow (auto-generated from name)
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

          <UFormField :label="`Field ${index + 1} Key`" :name="`field_${index}_key`" required>
            <UInput
              v-model="field.key"
              type="text"
              placeholder="e.g., merchant_name"
              class="w-full"
              size="md"
            />
          </UFormField>

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
      <div class="flex py-4">
        <UButton
          type="submit"
          color="primary"
          size="lg"
          :loading="loading"
          class="w-full justify-center"
        >
          Create workflow
        </UButton>
      </div>
    </UForm>

    <div class="w-md space-y-8">
      <!-- Workflow Steps -->
      <UFormField label="Workflow Steps" name="workflowSteps">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted">Define the steps in this workflow</p>
            <USelectMenu
              v-model="selectedStepType"
              :items="stepTypes"
              label-key="label"
              value-key="value"
              placeholder="Add step"
              size="sm"
              @change="addStep"
            />
          </div>

          <div v-if="state.steps.length === 0" class="text-sm text-muted p-4 bg-elevated rounded-md">
            No steps added yet. Select a step type to add workflow steps.
          </div>

          <div v-for="(step, stepIndex) in state.steps" :key="stepIndex" class="space-y-3 p-4 bg-elevated rounded-md">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-semibold uppercase text-muted">{{ getStepLabel(step.type) }} - {{ step.key }}</h4>
              <UButton
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                @click="removeStep(stepIndex)"
              >
                Remove
              </UButton>
            </div>

            <UFormField label="Step Key" :name="`step_${stepIndex}_key`" required>
              <UInput
                v-model="step.key"
                type="text"
                placeholder="unique_step_key"
                class="w-full"
                size="md"
              />
            </UFormField>

            <!-- Approval Step -->
            <div v-if="step.type === 'approval'">
              <UFormField label="Assignees" :name="`step_${stepIndex}_assignees`" required>
                <USelectMenu
                  v-model="step.assignees"
                  :items="availableUsers?.map(user => ({ label: `${user.firstName} ${user.lastName}`, value: user.id })) || []"
                  label-key="label"
                  value-key="value"
                  placeholder="Select assignees"
                  size="md"
                  multiple
                  class="w-full"
                />
              </UFormField>
              
              <div v-if="step.assignees?.length" class="flex flex-wrap gap-2 mt-2">
                <UBadge v-for="assignee in step.assignees" :key="assignee" color="neutral" variant="outline" size="md">
                  {{ getUserById(assignee)?.firstName }} {{ getUserById(assignee)?.lastName }}
                </UBadge>
              </div>
            </div>

            <!-- Action Step -->
            <div v-if="step.type === 'action'">
              <UFormField label="Assignee" :name="`step_${stepIndex}_assignee`" required>
                <USelectMenu
                  v-model="step.assignee"
                  :items="availableUsers"
                  label-key="email"
                  value-key="id"
                  placeholder="Select assignee"
                  size="md"
                  class="w-full"
                />
              </UFormField>
            </div>

            <!-- Gateway Steps -->
            <div v-if="step.type.startsWith('gateway')">
              <UFormField label="Branches" :name="`step_${stepIndex}_branches`">
                <div class="space-y-2">
                  <div v-for="(branch, branchIndex) in step.branches" :key="branchIndex" class="flex gap-2">
                    <UInput
                      v-model="branch.condition"
                      placeholder="Condition (CEL expression)"
                      class="flex-1"
                    />
                    <UInput
                      v-model="branch.to"
                      placeholder="Target step key"
                      class="flex-1"
                    />
                    <UButton
                      type="button"
                      color="error"
                      variant="ghost"
                      size="xs"
                      @click="removeBranch(stepIndex, branchIndex)"
                    >
                      ×
                    </UButton>
                  </div>
                  <UButton
                    type="button"
                    color="primary"
                    variant="outline"
                    size="xs"
                    @click="addBranch(stepIndex)"
                  >
                    Add Branch
                  </UButton>
                </div>
              </UFormField>
            </div>

            <!-- Next Step -->
            <div v-if="!step.type.startsWith('gateway')">
              <UFormField label="Next Step" :name="`step_${stepIndex}_next`">
                <UInput
                  v-model="step.next"
                  type="text"
                  placeholder="next_step_key (optional)"
                  class="w-full"
                  size="md"
                />
              </UFormField>
            </div>

            <!-- Condition -->
            <UFormField label="Condition" :name="`step_${stepIndex}_condition`">
              <UInput
                v-model="step.condition"
                type="text"
                placeholder="CEL expression (optional)"
                class="w-full"
                size="md"
              />
              <template #help>
                Optional condition that must be true for this step to execute
              </template>
            </UFormField>
          </div>
        </div>
      </UFormField>

      <!-- Start Step -->
      <UFormField label="Start Step" name="startStep" required>
        <USelectMenu
          v-model="state.startKey"
          :items="stepOptions"
          label-key="label"
          value-key="value"
          placeholder="Select starting step"
          size="lg"
          class="w-full"
        />
        <template #help>
          Which step should the workflow start with?
        </template>
      </UFormField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { WorkflowFieldType } from '@/models/workflow'
import type { User } from '@/models/user'
import { routes } from '@/routes'

const loading = ref(false)
const selectedStepType = ref('')
const { getUsers } = useUsersApi()
const { createWorkflow } = useWorkflowsApi()

// Fetch available users for assignees
const { data: availableUsers, pending: usersLoading } = await getUsers()

// Field type options
const fieldTypes = [
  { label: 'Short Text', value: 'short_text' },
  { label: 'Long Text', value: 'long_text' },
  { label: 'Currency', value: 'currency' },
  { label: 'Amount', value: 'amount' },
  { label: 'Select', value: 'select' },
  { label: 'Multi Select', value: 'multi_select' },
  { label: 'Date', value: 'date' },
  { label: 'Date Time', value: 'datetime' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Email', value: 'email' },
  { label: 'URL', value: 'url' },
]

// Step type options
const stepTypes = [
  { label: 'Approval', value: 'approval' },
  { label: 'Action', value: 'action' },
  { label: 'Exclusive Gateway', value: 'gateway:exclusive' },
  { label: 'Parallel Gateway', value: 'gateway:parallel' },
  { label: 'System Task', value: 'system_task' },
]

// Form state
const state = reactive({
  name: '',
  workflowKey: '',
  startKey: '',
  fields: [] as Array<{ 
    key: string
    label: string
    type: 'short_text' | 'long_text' | 'currency' | 'amount' | 'select' | 'multi_select' | 'date' | 'datetime' | 'boolean' | 'email' | 'url'
    description?: string
    required: boolean
    position: number
    options?: string[]
  }>,
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

// Computed step options for start step selection
const stepOptions = computed(() => 
  state.steps.map(step => ({
    label: `${getStepLabel(step.type)} - ${step.key}`,
    value: step.key
  }))
)

// Auto-generate workflow key from name
watch(() => state.name, (newName) => {
  if (newName && !state.workflowKey) {
    state.workflowKey = newName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  }
})

function getUserById(id: string): User | undefined {
  return availableUsers.value?.find(user => user.id === id)
}

function getStepLabel(type: string): string {
  const stepType = stepTypes.find(t => t.value === type)
  return stepType?.label || type
}

function addField() {
  state.fields.push({
    key: `field_${state.fields.length + 1}`,
    label: '',
    type: 'short_text' as const,
    description: '',
    required: true,
    position: state.fields.length
  })
}

function removeField(index: number) {
  state.fields.splice(index, 1)
  // Update positions
  state.fields.forEach((field, i) => {
    field.position = i
  })
}

function addStep() {
  if (!selectedStepType.value) return
  
  const newStep: any = {
    key: `step_${state.steps.length + 1}`,
    type: selectedStepType.value
  }

  if (selectedStepType.value === 'approval') {
    newStep.assignees = []
  } else if (selectedStepType.value === 'action') {
    newStep.assignee = ''
  } else if (selectedStepType.value.startsWith('gateway')) {
    newStep.branches = []
  }

  state.steps.push(newStep)
  selectedStepType.value = ''
}

function removeStep(index: number) {
  state.steps.splice(index, 1)
}

function addBranch(stepIndex: number) {
  if (!state.steps[stepIndex].branches) {
    state.steps[stepIndex].branches = []
  }
  state.steps[stepIndex].branches!.push({ condition: '', to: '' })
}

function removeBranch(stepIndex: number, branchIndex: number) {
  state.steps[stepIndex].branches!.splice(branchIndex, 1)
}

async function onSubmit() {
  loading.value = true

  try {
    // Create workflow via API
    await createWorkflow({
      name: state.name,
      workflow_key: state.workflowKey,
      start_key: state.startKey,
      fields: state.fields,
      steps: state.steps.map(step => ({
        ...step,
        // Clean up empty arrays/values
        assignees: step.assignees?.length ? step.assignees : undefined,
        assignee: step.assignee || undefined,
        condition: step.condition || undefined,
        next: step.next || undefined,
        branches: step.branches?.length ? step.branches : undefined
      }))
    })

    // Navigate back to workflows list
    await navigateTo(routes.workflows)
  } catch (error) {
    console.error('Error creating workflow:', error)
    // TODO: Show error toast
  } finally {
    loading.value = false
  }
}
</script>
