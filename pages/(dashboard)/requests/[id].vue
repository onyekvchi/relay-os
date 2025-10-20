<template>
  <div class="space-y-8">
    <div class="mb-6 flex items-center justify-between h-10">
      <UBreadcrumb :items="[{ label: 'Requests', to: '/requests' }, { label: `Request #${requestId}` }]"></UBreadcrumb>
      <div class="flex items-center gap-4">
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
import { ref } from 'vue'
import { routes } from '@/routes'

definePageMeta({
  middleware: 'dashboard',
  layout: 'dashboard'
});

const route = useRoute()
const requestId = route.params.id as string

const { approveRequest, rejectRequest, requestChanges } = useRequestsApi()

const approving = ref(false)
const rejecting = ref(false)
const requestingChanges = ref(false)

const showApproveModal = ref(false)
const showRejectModal = ref(false)
const showRequestChangesModal = ref(false)

async function handleApprove(comment?: string) {
  approving.value = true
  try {
    // TODO: Get approval_id from current user's approval
    await approveRequest(requestId, { 
      approval_id: 'approval-id',
      comment: comment
    })
    showApproveModal.value = false
    // TODO: Show success toast
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
    // TODO: Get approval_id from current user's approval
    await requestChanges(requestId, { 
      approval_id: 'approval-id', 
      reason: comment 
    })
    showRequestChangesModal.value = false
    // TODO: Show success toast
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
    // TODO: Get approval_id from current user's approval
    await rejectRequest(requestId, { 
      approval_id: 'approval-id', 
      reason: comment 
    })
    showRejectModal.value = false
    // TODO: Show success toast
    await navigateTo(routes.requests)
  } catch (error) {
    console.error('Error rejecting request:', error)
    // TODO: Show error toast
  } finally {
    rejecting.value = false
  }
}
</script>

