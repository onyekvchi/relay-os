<template>
  <div class="space-y-8">
    <div class="mb-6 flex items-center justify-between h-10">
      <UBreadcrumb :items="[{ label: 'Requests', to: '/requests' }, { label: `Request #${requestId}` }]"></UBreadcrumb>
      
      <!-- Approval Actions (for approvers, not initiators) -->
      <div v-if="canApprove" class="flex items-center gap-4">
        <UButton 
          color="primary" 
          size="lg"
          @click="showApproveModal = true"
        >
          Approve
        </UButton>
        <UButton 
          color="neutral" 
          variant="outline" 
          size="lg"
          @click="showRequestChangesModal = true"
        >
          Request changes
        </UButton>
        <UButton 
          color="error" 
          variant="outline" 
          size="lg"
          @click="showRejectModal = true"
        >
          Reject
        </UButton>
      </div>

      <!-- Edit/Cancel Actions (for initiators only) -->
      <div v-else-if="canEdit" class="flex items-center gap-4">
        <UButton 
          color="primary" 
          size="lg"
          disabled
        >
          Edit Request
        </UButton>
        <UButton 
          color="error" 
          variant="outline" 
          size="lg"
          disabled
        >
          Cancel Request
        </UButton>
      </div>
    </div>

    <RequestsRequestDetail :request-id="requestId" />

    <!-- Approve Modal -->
    <AppConfirmationModal
      v-model:open="showApproveModal"
      title="Approve Request"
      description="Are you sure you want to approve this request?"
      confirm-label="Approve"
      confirm-color="primary"
      :require-comment="true"
      :loading="approving"
      @confirm="handleApprove"
    />

    <!-- Request Changes Modal -->
    <AppConfirmationModal
      v-model:open="showRequestChangesModal"
      title="Request Changes"
      description="Please provide a reason for requesting changes."
      confirm-label="Request Changes"
      confirm-color="warning"
      :require-comment="true"
      :comment-required="true"
      comment-placeholder="Explain what needs to be changed..."
      :loading="requestingChanges"
      @confirm="handleRequestChanges"
    />

    <!-- Reject Modal -->
    <AppConfirmationModal
      v-model:open="showRejectModal"
      title="Reject Request"
      description="Are you sure you want to reject this request?"
      confirm-label="Reject"
      confirm-color="error"
      :require-comment="true"
      :comment-required="true"
      comment-placeholder="Provide a reason for rejection..."
      :loading="rejecting"
      @confirm="handleReject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { routes } from '@/routes'

definePageMeta({
  middleware: 'dashboard',
  layout: 'dashboard'
});

const route = useRoute()
const requestId = route.params.id as string

const { getRequest, approveRequest, rejectRequest, requestChanges } = useRequestsApi()
const { canApproveRequest, canEditRequest, currentUser } = usePermissions()

// Fetch request data to check permissions
const { data: request } = await getRequest(requestId)

// Check if current user is the initiator
const isInitiator = computed(() => {
  return request.value?.initiator?.id === currentUser.value?.id
})

// Check if user can approve this specific request (not the initiator)
const canApprove = computed(() => {
  return request.value && canApproveRequest(request.value) && !isInitiator.value
})

// Check if user can edit/cancel this request (is the initiator)
const canEdit = computed(() => {
  return request.value && canEditRequest(request.value)
})

const approving = ref(false)
const rejecting = ref(false)
const requestingChanges = ref(false)

const showApproveModal = ref(false)
const showRejectModal = ref(false)
const showRequestChangesModal = ref(false)

async function handleApprove(comment?: string) {
  approving.value = true
  try {
    await approveRequest(requestId, { 
      comment: comment || 'Approved',
      step_key: 'step-key'
    })
    showApproveModal.value = false
    await navigateTo(routes.requests)
  } catch (error) {
    console.error('Error approving request:', error)
    // TODO: Show error toast
  } finally {
    approving.value = false
  }
}

async function handleRequestChanges(comment?: string) {
  if (!comment) return
  
  requestingChanges.value = true
  try {
    await requestChanges(requestId, { 
      comment: comment || 'Request changes',
      step_key: 'step-key'
    })
    showRequestChangesModal.value = false
    await navigateTo(routes.requests)
  } catch (error) {
    console.error('Error requesting changes:', error)
    // TODO: Show error toast
  } finally {
    requestingChanges.value = false
  }
}

async function handleReject(comment?: string) {
  if (!comment) return
  
  rejecting.value = true
  try {
    await rejectRequest(requestId, { 
      comment: comment || 'Rejected',
      step_key: 'step-key'
    })
    showRejectModal.value = false
    await navigateTo(routes.requests)
  } catch (error) {
    console.error('Error rejecting request:', error)
  } finally {
    rejecting.value = false
  }
}
</script>

