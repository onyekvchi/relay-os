<template>
  <div class="space-y-8">
    <div class="mb-6 flex items-center justify-between h-10">
      <UBreadcrumb :items="[{ label: 'Requests', to: '/requests' }, { label: `Request #${requestId}` }]"></UBreadcrumb>
      <div class="flex items-center gap-4">
        <UButton 
          color="primary" 
          size="lg"
          :loading="approving"
          @click="handleApprove"
        >
          Approve
        </UButton>
        <UButton 
          color="neutral" 
          variant="outline" 
          size="lg"
          :loading="requestingChanges"
          @click="handleRequestChanges"
        >
          Request changes
        </UButton>
        <UButton 
          color="error" 
          variant="outline" 
          size="lg"
          :loading="rejecting"
          @click="handleReject"
        >
          Reject
        </UButton>
      </div>
    </div>

    <RequestsRequestDetail :request-id="requestId" />
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

async function handleApprove() {
  approving.value = true
  try {
    // TODO: Get approval_id from current user's approval
    await approveRequest(requestId, { approval_id: 'approval-id' })
    // TODO: Refresh page or show success toast
    await navigateTo(routes.requests)
  } catch (error) {
    console.error('Error approving request:', error)
    // TODO: Show error toast
  } finally {
    approving.value = false
  }
}

async function handleRequestChanges() {
  requestingChanges.value = true
  try {
    // TODO: Get approval_id from current user's approval and prompt for reason
    await requestChanges(requestId, { approval_id: 'approval-id', reason: 'Changes needed' })
    // TODO: Refresh page or show success toast
    await navigateTo(routes.requests)
  } catch (error) {
    console.error('Error requesting changes:', error)
    // TODO: Show error toast
  } finally {
    requestingChanges.value = false
  }
}

async function handleReject() {
  rejecting.value = true
  try {
    // TODO: Get approval_id from current user's approval and prompt for reason
    await rejectRequest(requestId, { approval_id: 'approval-id', reason: 'Rejected' })
    // TODO: Refresh page or show success toast
    await navigateTo(routes.requests)
  } catch (error) {
    console.error('Error rejecting request:', error)
    // TODO: Show error toast
  } finally {
    rejecting.value = false
  }
}
</script>

