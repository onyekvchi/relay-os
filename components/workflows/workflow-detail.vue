<template>
  <div class="space-y-8">
    <!-- Header with Status -->
    <div class="flex items-center justify-between">
      <div class="space-y-4">
        <UBadge :color="workflow.archived ? 'neutral' : 'success'" variant="subtle">
          {{ workflow.archived ? 'Archived' : 'Active' }}
        </UBadge>
        <div class="flex flex-col space-y-1">
          <h1 class="text-2xl font-semibold tracking-tight">{{ workflow.name }}</h1>
          <p class="text-sm text-muted">
            {{ workflow.fields.length }} field{{ workflow.fields.length !== 1 ? 's' : '' }} · 
            {{ workflow.steps.length }} approval level{{ workflow.steps.length !== 1 ? 's' : '' }}
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

      <!-- Middle Column: Approval Flow & Action -->
      <div class="w-1/3 space-y-4">
        <!-- Approvers -->
        <div class="bg-white border border-muted p-4 space-y-4">
          <h2 class="text-lg font-semibold tracking-tight">Approval Levels</h2>
          
          <div v-if="workflow.steps.length === 0" class="text-sm text-muted py-4">
            No approval levels configured.
          </div>

          <div class="space-y-4">
            <div v-for="(step, stepIndex) in workflow.steps" :key="stepIndex" class="space-y-1">
              <h3 class="text-[10px] font-semibold uppercase text-muted">Level {{ stepIndex + 1 }}</h3>

              <div class="bg-elevated p-2 space-y-2">
                <div v-for="approval in step.approvals" :key="approval.approver.email">
                  <UBadge color="neutral" variant="outline" size="lg">
                    {{ approval.approver.firstName }} {{ approval.approver.lastName }}
                  </UBadge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Taker -->
        <div class="bg-white border border-muted p-4 space-y-4">
          <h2 class="text-lg font-semibold tracking-tight">Action Taker</h2>
          <div class="space-y-3">
            <UBadge color="neutral" variant="outline" size="lg">
              {{ workflow.action.actor.firstName }} {{ workflow.action.actor.lastName }}
            </UBadge>
            <p class="text-xs text-muted">
              Responsible for executing the action after all approvals are complete
            </p>
          </div>
        </div>
      </div>

      <!-- Right Column: Usage Stats -->
      <div class="w-1/3 space-y-4">
        <div class="bg-white border border-muted p-4 space-y-4">
          <h2 class="text-lg font-semibold tracking-tight">Usage Statistics</h2>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted">Total Requests</span>
              <span class="text-lg font-semibold">{{ usageStats.totalRequests }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted">Pending</span>
              <span class="text-lg font-semibold">{{ usageStats.pendingRequests }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted">Completed</span>
              <span class="text-lg font-semibold">{{ usageStats.completedRequests }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted">Avg. Approval Time</span>
              <span class="text-lg font-semibold">{{ usageStats.avgApprovalTime }}</span>
            </div>
          </div>
        </div>

        <!-- Metadata -->
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
import { ref, computed, onMounted } from 'vue'
import { WorkflowFieldType, type Workflow } from '@/models/workflow'
import { mockWorkflow, mockUser } from '@/models/factories'

const props = defineProps<{
  workflowId: string
}>()

const emit = defineEmits<{
  workflowLoaded: [workflow: WorkflowWithMetadata]
}>()

// Extended workflow type with additional metadata
type WorkflowWithMetadata = Workflow & {
  archived?: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: any
}

// Sample workflow data - this would come from API
const workflow = ref<WorkflowWithMetadata>({
  ...mockWorkflow(),
  archived: false,
  createdAt: '2025-09-15T08:30:00.000000Z',
  updatedAt: '2025-10-10T14:22:00.000000Z',
  createdBy: mockUser()
})

// Sample usage statistics - this would come from API
const usageStats = ref({
  totalRequests: 47,
  pendingRequests: 8,
  completedRequests: 35,
  avgApprovalTime: '2.3 days'
})

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
    case WorkflowFieldType.string:
      return 'Short Text'
    case WorkflowFieldType.text:
      return 'Long Text'
    case WorkflowFieldType.amount:
      return 'Amount'
    case WorkflowFieldType.integer:
      return 'Integer'
    case WorkflowFieldType.decimal:
      return 'Decimal'
    case WorkflowFieldType.list:
      return 'List'
    case WorkflowFieldType.user:
      return 'User'
    case WorkflowFieldType.entity:
      return 'Entity'
    default:
      return 'Unknown'
  }
}

onMounted(() => {
  // Emit workflow data to parent
  emit('workflowLoaded', workflow.value)
})
</script>
