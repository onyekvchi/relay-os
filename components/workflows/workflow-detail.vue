<template>
  <div v-if="workflow" class="space-y-8">
    <!-- Header with Status -->
    <div class="flex items-center justify-between">
      <div class="space-y-4">
        <UBadge :color="workflow.status === 'archived' ? 'neutral' : 'success'" variant="subtle">
          {{ workflow.status === 'archived' ? 'Archived' : workflow.status === 'published' ? 'Published' : 'Draft' }}
        </UBadge>
        <div class="flex flex-col space-y-1">
          <h1 class="text-2xl font-semibold tracking-tight">{{ workflow.name }}</h1>
          <p class="text-sm text-muted">
            {{ workflow.fields.length }} field{{ workflow.fields.length !== 1 ? 's' : '' }} · 
            {{ workflow.steps.length }} step{{ workflow.steps.length !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex space-x-4">
      <!-- Left Column: Workflow Fields -->
      <div class="w-1/3 space-y-8">
        <div class="bg-white border border-muted p-4 space-y-4">
          <h2 class="text-lg font-semibold tracking-tight">Workflow Fields</h2>

          <div v-if="workflow.fields.length === 0" class="text-sm text-muted py-4">
            No fields configured for this workflow.
          </div>

          <div v-for="(field, index) in workflow.fields" :key="index" class="flex flex-col space-y-1">
            <label class="text-sm font-semibold">{{ field.label }}</label>
            <div class="text-sm bg-elevated py-2 px-3 space-y-1">
              <p class="text-xs text-muted">Type: {{ getFieldTypeLabel(field.type) }}</p>
              <p v-if="field.description" class="text-xs">{{ field.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Middle Column: Workflow Steps -->
      <div class="w-1/3 space-y-4">
        <!-- Steps -->
        <div class="bg-white border border-muted p-4 space-y-4">
          <h2 class="text-lg font-semibold tracking-tight">Workflow Steps</h2>
          
          <div v-if="workflow.steps.length === 0" class="text-sm text-muted py-4">
            No steps configured.
          </div>

          <div class="space-y-3">
            <div v-for="(step, index) in workflow.steps" :key="step.key" class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="text-xs font-semibold text-muted uppercase">{{ getStepTypeLabel(step.type) }}</div>
                <UBadge color="neutral" variant="soft" size="sm">{{ step.key }}</UBadge>
              </div>
              <div class="bg-elevated p-2 space-y-2">
                <div v-if="step.assignees?.length" class="flex flex-wrap gap-2">
                  <UBadge v-for="assigneeId in step.assignees" :key="assigneeId" color="neutral" variant="outline" size="sm">
                    {{ getUserById(assigneeId)?.firstName }} {{ getUserById(assigneeId)?.lastName }}
                  </UBadge>
                </div>
                <div v-else-if="step.assignee" class="flex flex-wrap gap-2">
                  <UBadge color="neutral" variant="outline" size="sm">
                    {{ getUserById(step.assignee)?.firstName }} {{ getUserById(step.assignee)?.lastName }}
                  </UBadge>
                </div>
                <p v-if="step.condition" class="text-xs text-muted">
                  Condition: {{ step.condition }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Usage Stats -->
      <div class="w-1/3 space-y-4">
        <div class="bg-white border border-muted p-4 space-y-4">
          <h2 class="text-lg font-semibold tracking-tight">Metadata</h2>
          <div class="space-y-2 text-sm">
            <div class="flex flex-col space-y-1">
              <span class="text-muted">Created</span>
              <span>{{ formatDate(workflow.createdAt) }}</span>
            </div>
            <div class="flex flex-col space-y-1">
              <span class="text-muted">Last Modified</span>
              <span>{{ formatDate(workflow.updatedAt) }}</span>
            </div>
            <div v-if="workflow.createdBy" class="flex flex-col space-y-1">
              <span class="text-muted">Created By</span>
              <span>{{ workflow.createdBy.firstName }} {{ workflow.createdBy.lastName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { WorkflowFieldType, type Workflow } from '@/models/workflow'
import type { User } from '@/models/user'

const props = defineProps<{
  workflowId: string
}>()

const emit = defineEmits<{
  workflowLoaded: [workflow: Workflow]
}>()

const { getWorkflow } = useWorkflowsApi()
const { getCurrentWorkspaceMembers } = useWorkspaceApi()

// Fetch workflow data from API
const { data: workflow, pending, error } = await getWorkflow(props.workflowId)

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

// Fetch workspace members
const membersResponse = await getCurrentWorkspaceMembers()
const members = membersResponse?.data || []

const getUserById = computed(() => {
  return (userId: string): { firstName: string; lastName: string } | undefined => {
    const member = members.find((m) => m.user_id === userId)
    if (!member) return undefined
    return {
      firstName: member.first_name,
      lastName: member.last_name
    }
  }
})

// Emit workflow data when loaded
watch(workflow, (newWorkflow) => {
  if (newWorkflow) {
    emit('workflowLoaded', newWorkflow)
  }
}, { immediate: true })

function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

function getFieldTypeLabel(type: WorkflowFieldType): string {
  switch (type) {
    case WorkflowFieldType.short_text:
      return 'Short Text'
    case WorkflowFieldType.long_text:
      return 'Long Text'
    case WorkflowFieldType.currency:
      return 'Currency'
    case WorkflowFieldType.amount:
      return 'Amount'
    case WorkflowFieldType.select:
      return 'Select'
    case WorkflowFieldType.multi_select:
      return 'Multi Select'
    case WorkflowFieldType.date:
      return 'Date'
    case WorkflowFieldType.datetime:
      return 'Date Time'
    case WorkflowFieldType.boolean:
      return 'Boolean'
    case WorkflowFieldType.email:
      return 'Email'
    case WorkflowFieldType.url:
      return 'URL'
    default:
      return 'Unknown'
  }
}

</script>
