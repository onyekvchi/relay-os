<template>
  <div v-if="request" class="space-y-8">
    <!-- Header with Status -->
    <div class="flex items-center">
      <div class="space-y-4">
        <UBadge :color="getStatusColor(request.status)" variant="subtle">
          {{ request.status }}
        </UBadge>
        <div class="flex flex-col space-y-1">
          <h1 class="text-2xl font-semibold tracking-tight">{{ request.type.name }}</h1>
          <p class="text-sm text-muted">
            Submitted by {{ request.initiator.firstName }} {{ request.initiator.lastName }} on {{
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

          <div v-for="(field, index) in request.type.fields" :key="index" class="flex flex-col space-y-1">
            <label class="text-sm font-semibold">{{ field.label }}</label>
            <div class="text-sm bg-elevated py-2 px-3">
              <template v-if="field.type === WorkflowFieldType.text">
                <p class="whitespace-pre-wrap">{{ fieldValues[index] || 'N/A' }}</p>
              </template>
              <template v-else-if="field.type === WorkflowFieldType.amount">
                <p>{{ formatAmount(fieldValues[index]) }}</p>
              </template>
              <template v-else>
                <p>{{ fieldValues[index] || 'N/A' }}</p>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Middle Column: Approval Flow & Action -->
      <div class="w-1/3 space-y-4">
        <!-- Approvers -->
        <div class="bg-white border border-muted p-4 space-y-4">
          <h2 class="text-lg font-semibold tracking-tight">Approvers</h2>
          <div class="space-y-4">
            <div v-for="(approval, index) in request.approvals" :key="index" class="bg-elevated p-2 flex items-center justify-between">
              <UBadge color="neutral" variant="outline" size="lg">
                {{ approval.workflowApproval.approver.firstName }} {{ approval.workflowApproval.approver.lastName }}
              </UBadge>
              <UBadge :color="approval.status === WorkflowApprovalStatus.approved ? 'success' : 'neutral'" size="sm"
                variant="subtle">
                {{ approval.status }}
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Action Taker -->
        <div class="bg-white border border-muted p-4 space-y-4">
          <h2 class="text-lg font-semibold tracking-tight">Action Taker</h2>
          <div class="space-y-3">
            <UBadge color="neutral" variant="outline" size="lg">
              {{ request.type.action.actor.firstName }} {{ request.type.action.actor.lastName }}
            </UBadge>
            <p class="text-xs text-muted">
              Responsible for executing the action after all approvals are complete
            </p>
          </div>
        </div>

        <!-- Followers -->
        <div v-if="request.observers.length > 0" class="bg-white border border-muted p-4 space-y-4">
          <h2 class="text-lg font-semibold tracking-tight">Followers</h2>
          <div class="flex flex-wrap gap-2">
            <UBadge v-for="observer in request.observers" :key="observer.email" color="neutral" variant="outline"
              size="lg">
              {{ observer.firstName }} {{ observer.lastName }}
            </UBadge>
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
import { WorkflowFieldType, WorkflowApprovalStatus } from '@/models/workflow'

const props = defineProps<{
  requestId: string
}>()

const { getRequest } = useRequestsApi()

// Fetch request data from API
const { data: request, pending, error } = await getRequest(props.requestId)

// Extract field values from request
const fieldValues = computed(() => {
  if (!request.value?.fieldValues) return {}
  
  // Convert field values object to indexed format for display
  const values: Record<number, any> = {}
  request.value.type.fields.forEach((field, index) => {
    values[index] = request.value!.fieldValues[field.label]
  })
  return values
})

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

// Action handlers
const { approveRequest, rejectRequest, requestChanges } = useRequestsApi()

async function handleApprove() {
  if (!request.value) return
  try {
    // TODO: Get approval_id from current user's approval
    await approveRequest(props.requestId, { approval_id: 'approval-id' })
    // TODO: Refresh request data or show success toast
  } catch (error) {
    console.error('Error approving request:', error)
  }
}

async function handleRequestChanges() {
  if (!request.value) return
  try {
    // TODO: Get approval_id from current user's approval
    await requestChanges(props.requestId, { approval_id: 'approval-id', reason: 'Changes needed' })
    // TODO: Refresh request data or show success toast
  } catch (error) {
    console.error('Error requesting changes:', error)
  }
}

async function handleReject() {
  if (!request.value) return
  try {
    // TODO: Get approval_id from current user's approval
    await rejectRequest(props.requestId, { approval_id: 'approval-id', reason: 'Rejected' })
    // TODO: Refresh request data or show success toast
  } catch (error) {
    console.error('Error rejecting request:', error)
  }
}
</script>
