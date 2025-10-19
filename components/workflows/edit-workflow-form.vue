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

            <UFormField :label="`Level ${stepIndex + 1} Approvers`" :name="`step_${stepIndex}_approvers`" required>
              <USelectMenu
                v-model="step.approvers"
                :items="availableUsers"
                label-key="email"
                placeholder="Select approvers"
                size="md"
                multiple
                class="w-full"
              />
            </UFormField>

            <div v-if="step.approvers.length > 0" class="flex flex-wrap gap-2">
              <UBadge v-for="approver in step.approvers" :key="approver.email" color="neutral" variant="outline" size="md">
                {{ approver.firstName }} {{ approver.lastName }}
              </UBadge>
            </div>
          </div>
        </div>
      </UFormField>

      <!-- Action Taker -->
      <UFormField label="Action Taker" name="actionTaker" required>
        <USelectMenu
          v-model="state.actionTaker"
          :items="availableUsers"
          label-key="email"
          placeholder="Select action taker"
          size="lg"
          class="w-full"
        />
        <template #help>
          Who will execute the action after all approvals are complete?
        </template>
        <div v-if="state.actionTaker" class="flex flex-wrap gap-2 mt-2">
          <UBadge color="neutral" variant="outline" size="lg">
            {{ state.actionTaker.firstName }} {{ state.actionTaker.lastName }}
          </UBadge>
        </div>
      </UFormField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { WorkflowFieldType, WorkflowApprovalStatus, WorkflowActionStatus, createSampleWorkflow, type Workflow } from '@/models/workflow'
import { sampleAdminUsers, UserRole, type User } from '@/models/user'

const props = defineProps<{
  workflowId: string
}>()

const loading = ref(false)

// Available users for approvers and action taker
const availableUsers = ref<User[]>([
  { firstName: "Bolaji", lastName: "Akande", email: "b.akande@relayos.com", phonenumber: "+234 809 623 7816", role: UserRole.User },
  ...sampleAdminUsers
])

// Field type options
const fieldTypes = [
  { label: 'Short Text', value: WorkflowFieldType.string },
  { label: 'Long Text', value: WorkflowFieldType.text },
  { label: 'Amount', value: WorkflowFieldType.amount },
  { label: 'Integer', value: WorkflowFieldType.integer },
  { label: 'Decimal', value: WorkflowFieldType.decimal },
  { label: 'List', value: WorkflowFieldType.list },
  { label: 'User', value: WorkflowFieldType.user },
  { label: 'Entity', value: WorkflowFieldType.entity },
]

// Form state
const state = reactive({
  name: '',
  fields: [] as Array<{ label: string, type: WorkflowFieldType, description: string }>,
  steps: [] as Array<{ approvers: User[] }>,
  actionTaker: undefined as User | undefined
})

// Load existing workflow data
onMounted(() => {
  loadWorkflow()
})

function loadWorkflow() {
  // TODO: Load workflow from API using props.workflowId
  const workflow = createSampleWorkflow()
  
  state.name = workflow.name
  state.fields = workflow.fields.map(f => ({ ...f }))
  state.steps = workflow.steps.map(step => ({
    approvers: step.approvals.map(a => a.approver)
  }))
  state.actionTaker = workflow.action.actor
}

function addField() {
  state.fields.push({
    label: '',
    type: WorkflowFieldType.string,
    description: ''
  })
}

function removeField(index: number) {
  state.fields.splice(index, 1)
}

function addApprovalStep() {
  state.steps.push({
    approvers: []
  })
}

function removeApprovalStep(index: number) {
  state.steps.splice(index, 1)
}

function handleCancel() {
  navigateTo(`/workflows/${props.workflowId}`)
}

async function onSubmit() {
  loading.value = true

  try {
    // TODO: Implement API call to update workflow
    console.log('Updating workflow:', {
      id: props.workflowId,
      name: state.name,
      fields: state.fields,
      steps: state.steps.map(step => ({
        status: WorkflowApprovalStatus.pending,
        approvals: step.approvers.map(approver => ({
          approver,
          status: WorkflowApprovalStatus.pending
        }))
      })),
      action: {
        actor: state.actionTaker,
        status: WorkflowActionStatus.pending
      }
    })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Navigate back to workflow detail
    await navigateTo(`/workflows/${props.workflowId}`)
  } catch (error) {
    console.error('Error updating workflow:', error)
  } finally {
    loading.value = false
  }
}
</script>
