<template>
  <div v-if="request" class="space-y-8">
    <!-- Header with Status -->
    <div class="flex items-center">
      <div class="space-y-4">
        <UBadge :color="getStatusColor(request.status)" variant="subtle">
          {{ request.status }}
        </UBadge>
        <div class="flex flex-col space-y-1">
          <h1 class="text-2xl font-semibold tracking-tight">{{ request.workflow.name }}</h1>
          <p class="text-sm text-muted">
            Submitted by {{ request.createdBy.firstName }} {{ request.createdBy.lastName }} on {{
              formatDate(request.createdAt) }}
          </p>
        </div>
      </div>

    </div>

    <div class="flex space-x-4">
      <!-- Left Column: Request Details -->
      <div class="w-1/3 space-y-8">
        <div class="bg-white border border-muted p-4 space-y-4">
          <h2 class="text-lg font-semibold tracking-tight">Request Details</h2>

          <div v-for="field in request.workflow.fields" :key="field.key" class="flex flex-col space-y-1">
            <label class="text-sm font-semibold">{{ field.label }}</label>
            <div class="text-sm bg-elevated py-2 px-3">
              <template v-if="field.type === 'long_text'">
                <p class="whitespace-pre-wrap">{{ request.context[field.key] || 'N/A' }}</p>
              </template>
              <template v-else-if="field.type === 'amount' || field.type === 'currency'">
                <p>{{ formatAmount(request.context[field.key]) }}</p>
              </template>
              <template v-else-if="field.type === 'date'">
                <p>{{ formatDate(request.context[field.key]) }}</p>
              </template>
              <template v-else-if="field.type === 'boolean'">
                <p>{{ request.context[field.key] ? 'Yes' : 'No' }}</p>
              </template>
              <template v-else-if="field.type === 'multi_select'">
                <div class="flex flex-wrap gap-1">
                  <UBadge v-for="item in (request.context[field.key] || [])" :key="item" color="neutral" variant="soft" size="sm">
                    {{ item }}
                  </UBadge>
                </div>
              </template>
              <template v-else>
                <p>{{ request.context[field.key] || 'N/A' }}</p>
              </template>
            </div>
            <p v-if="field.description" class="text-xs text-muted">{{ field.description }}</p>
          </div>
        </div>
      </div>

      <!-- Middle Column: Workflow Steps -->
      <div class="w-1/3 space-y-4">
        <!-- Active Steps -->
        <div v-if="request.activeSteps.length > 0" class="bg-white border border-muted p-4 space-y-4">
          <h2 class="text-lg font-semibold tracking-tight">Active Steps</h2>
          <div class="space-y-3">
            <div v-for="stepKey in request.activeSteps" :key="stepKey" class="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-semibold">{{ getStepByKey(stepKey)?.type || stepKey }}</h4>
                <UBadge color="warning" variant="soft" size="sm">Active</UBadge>
              </div>
              <div v-if="getStepByKey(stepKey)" class="space-y-2">
                <div v-if="getStepByKey(stepKey)?.assignees?.length" class="flex flex-wrap gap-2">
                  <UBadge v-for="assigneeId in getStepByKey(stepKey)?.assignees" :key="assigneeId" color="primary" variant="outline" size="sm">
                    {{ getUserById(assigneeId)?.firstName }} {{ getUserById(assigneeId)?.lastName }}
                  </UBadge>
                </div>
                <div v-else-if="getStepByKey(stepKey)?.assignee" class="flex flex-wrap gap-2">
                  <UBadge color="primary" variant="outline" size="sm">
                    {{ getUserById(getStepByKey(stepKey)?.assignee)?.firstName }} {{ getUserById(getStepByKey(stepKey)?.assignee)?.lastName }}
                  </UBadge>
                </div>
                
                <!-- Action Buttons for Current User -->
                <div v-if="canUserActOnStep(stepKey)" class="flex gap-2 mt-3">
                  <UButton 
                    v-if="getStepByKey(stepKey)?.type === 'approval'"
                    color="success" 
                    size="xs"
                    @click="handleApprove(stepKey)"
                  >
                    Approve
                  </UButton>
                  <UButton 
                    v-if="getStepByKey(stepKey)?.type === 'approval'"
                    color="warning" 
                    size="xs" 
                    variant="outline"
                    @click="handleRequestChanges(stepKey)"
                  >
                    Request Changes
                  </UButton>
                  <UButton 
                    v-if="getStepByKey(stepKey)?.type === 'approval'"
                    color="error" 
                    size="xs" 
                    variant="outline"
                    @click="handleReject(stepKey)"
                  >
                    Reject
                  </UButton>
                  <UButton 
                    v-if="getStepByKey(stepKey)?.type === 'action'"
                    color="primary" 
                    size="xs"
                    @click="handleExecute(stepKey)"
                  >
                    Execute
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- All Workflow Steps -->
        <div class="bg-white border border-muted p-4 space-y-4">
          <h2 class="text-lg font-semibold tracking-tight">Workflow Steps</h2>
          <div class="space-y-3">
            <div v-for="step in request.workflow.steps" :key="step.key" class="p-3 bg-elevated rounded-md">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-semibold">{{ getStepTypeLabel(step.type) }}</h4>
                <div class="flex gap-2">
                  <UBadge color="neutral" variant="soft" size="sm">{{ step.key }}</UBadge>
                  <UBadge 
                    v-if="request.activeSteps.includes(step.key)"
                    color="warning" 
                    variant="soft" 
                    size="sm"
                  >
                    Active
                  </UBadge>
                </div>
              </div>
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
              <p v-if="step.condition" class="text-xs text-muted mt-2">
                Condition: {{ step.condition }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="w-1/3 space-y-4">
        <!-- Activity Log -->
        <div v-if="request.logs.length > 0" class="bg-white border border-muted p-4 space-y-4">
          <h2 class="text-lg font-semibold tracking-tight">Activity</h2>
          <div class="space-y-4">
            <div v-for="(log, index) in request.logs" :key="index" class="flex space-x-3">
              <UAvatar :text="log.user.firstName[0] + log.user.lastName[0]" />
              <div class="flex-1 space">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-semibold">
                    {{ log.user.firstName }} {{ log.user.lastName }}
                  </p>
                  <p class="text-xs text-muted">{{ formatDate(log.createdAt) }}</p>
                </div>
                <p class="text-xs text-muted">{{ getActionText(log.action) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RequestStatus, RequestAction } from '@/models/request'
import type { User } from '@/models/user'

const props = defineProps<{
  requestId: string
}>()

const { getRequest, approveRequest, rejectRequest, requestChanges, executeRequest } = useRequestsApi()
const { getUsers } = useUsersApi()
const { getUser } = useAuthStore()

// Fetch request data from API
const { data: request, pending, error } = await getRequest(props.requestId)

// Fetch users for displaying assignee names
const { data: users } = await getUsers()

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
  return users.value?.find(user => user.id === id)
}

function getStepByKey(stepKey: string) {
  return request.value?.workflow.steps.find(step => step.key === stepKey)
}

function canUserActOnStep(stepKey: string): boolean {
  if (!request.value || !getUser) return false
  
  const step = getStepByKey(stepKey)
  if (!step) return false
  
  const currentUserId = getUser.id
  
  if (step.assignees) {
    return step.assignees.includes(currentUserId)
  }
  
  if (step.assignee) {
    return step.assignee === currentUserId
  }
  
  return false
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function formatAmount(value: string | number): string {
  if (!value) return 'N/A'
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(num)
}

function getStatusColor(status: RequestStatus): 'primary' | 'neutral' | 'secondary' | 'success' | 'info' | 'warning' | 'error' {
  switch (status) {
    case RequestStatus.completed:
      return 'success'
    case RequestStatus.rejected:
    case RequestStatus.cancelled:
      return 'error'
    case RequestStatus.changesRequested:
      return 'warning'
    case RequestStatus.awaitingApproval:
      return 'neutral'
    case RequestStatus.awaitingAction:
      return 'info'
    default:
      return 'neutral'
  }
}

function getActionText(action: RequestAction): string {
  switch (action) {
    case RequestAction.create:
      return 'Created the request'
    case RequestAction.approve:
      return 'Approved the request'
    case RequestAction.requestChange:
      return 'Requested changes'
    case RequestAction.reject:
      return 'Rejected the request'
    case RequestAction.cancel:
      return 'Cancelled the request'
    case RequestAction.complete:
      return 'Completed the action'
    case RequestAction.comment:
      return 'Added a comment'
    case RequestAction.update:
      return 'Updated the request'
    default:
      return 'Performed an action'
  }
}

// Action handlers for step-based workflow
async function handleApprove(stepKey: string) {
  if (!request.value) return
  try {
    await approveRequest(props.requestId, { 
      step_key: stepKey,
      comment: 'Approved'
    })
    // Refresh request data
    await refreshRequest()
  } catch (error) {
    console.error('Error approving request:', error)
  }
}

async function handleRequestChanges(stepKey: string) {
  if (!request.value) return
  try {
    await requestChanges(props.requestId, { 
      step_key: stepKey,
      comment: 'Changes requested'
    })
    // Refresh request data
    await refreshRequest()
  } catch (error) {
    console.error('Error requesting changes:', error)
  }
}

async function handleReject(stepKey: string) {
  if (!request.value) return
  try {
    await rejectRequest(props.requestId, { 
      step_key: stepKey,
      comment: 'Rejected'
    })
    // Refresh request data
    await refreshRequest()
  } catch (error) {
    console.error('Error rejecting request:', error)
  }
}

async function handleExecute(stepKey: string) {
  if (!request.value) return
  try {
    await executeRequest(props.requestId, { 
      step_key: stepKey,
      comment: 'Executed'
    })
    // Refresh request data
    await refreshRequest()
  } catch (error) {
    console.error('Error executing request:', error)
  }
}

async function refreshRequest() {
  // This would typically refresh the data
  // Since we're using useFetch, it should automatically refresh
  console.log('Refreshing request data...')
}
</script>
