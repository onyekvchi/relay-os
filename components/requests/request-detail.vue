<template>
  <div class="space-y-8">
    <!-- Header with Status -->
    <div class="flex items-center">
      <div class="space-y-6">
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
          <h2 class="text-lg font-semibold">Request Details</h2>

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
          <h2 class="text-lg font-semibold">Approvers</h2>
          <div class="space-y-4">
            <div v-for="(step, stepIndex) in request.type.steps" :key="stepIndex" class="space-y-1">
              <div class="flex items-center justify-between">
                <h3 class="text-[10px] font-semibold uppercase text-muted">Level {{ stepIndex + 1 }}</h3>
                <UBadge :color="step.status === WorkflowApprovalStatus.approved ? 'success' : 'neutral'" size="sm"
                  variant="subtle">
                  {{ step.status === WorkflowApprovalStatus.approved ? 'Approved' : 'Pending' }}
                </UBadge>
              </div>

              <div class="bg-elevated p-1 space-y-2">
                <div v-for="approval in step.approvals" :key="approval.approver.email"
                  class="flex items-center justify-between">
                  <UBadge color="neutral" variant="outline" size="lg">
                    {{ approval.approver.firstName }} {{ approval.approver.lastName }}
                  </UBadge>
                  <UBadge v-if="approval.status === WorkflowApprovalStatus.approved" color="success" size="sm"
                    variant="subtle">
                    Approved
                  </UBadge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Taker -->
        <div class="bg-white border border-muted p-4 space-y-4">
          <h2 class="text-lg font-semibold">Action Taker</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <UBadge color="neutral" variant="outline" size="lg">
                {{ request.type.action.actor.firstName }} {{ request.type.action.actor.lastName }}
              </UBadge>
              <UBadge :color="request.type.action.status === WorkflowActionStatus.completed ? 'success' : 'neutral'"
                size="sm" variant="subtle">
                {{ request.type.action.status === WorkflowActionStatus.completed ? 'Completed' : 'Pending' }}
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Followers -->
        <div v-if="request.observers.length > 0" class="bg-white border border-muted p-4 space-y-4">
          <h2 class="text-lg font-semibold">Followers</h2>
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
          <h2 class="text-lg font-semibold">Activity</h2>
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
import { ref } from 'vue'
import { createSampleRequests, RequestStatus, RequestAction, type Request } from '@/models/request'
import { WorkflowFieldType, WorkflowApprovalStatus, WorkflowActionStatus } from '@/models/workflow'
import { createSampleUser } from '~/models/user';

const props = defineProps<{
  requestId: string
}>()

const sample: Request = {
  ...createSampleRequests(),
  logs: [{
    action: RequestAction.create,
    user: createSampleUser(),
    createdAt: new Date().toISOString()
  }, {
    action: RequestAction.approve,
    user: createSampleUser(),
    createdAt: new Date().toISOString()
  }],
  observers: [createSampleUser({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  })]
}
const request = ref<Request>(sample)

// Sample field values - these would come from the request data
const fieldValues = ref<Record<number, any>>({
  0: 'Acme Corp',
  1: '5000',
  2: '4500',
  3: 'Customer requested a discount due to volume increase. This aligns with our enterprise pricing strategy.'
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

// Action handlers - implement these based on your API
function handleApprove() {
  console.log('Approve request:', props.requestId)
  // TODO: Implement approval logic
}

function handleRequestChanges() {
  console.log('Request changes for:', props.requestId)
  // TODO: Implement request changes logic
}

function handleReject() {
  console.log('Reject request:', props.requestId)
  // TODO: Implement rejection logic
}
</script>
