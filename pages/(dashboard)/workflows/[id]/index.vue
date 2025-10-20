<template>
  <div class="space-y-8">
    <div class="mb-6 flex items-center justify-between h-10">
      <UBreadcrumb :items="[{ label: 'Workflows', to: routes.workflows }, { label: workflowName }]"></UBreadcrumb>
      <div class="flex items-center gap-4">
        <UButton 
          color="primary" 
          size="lg"
          :to="routes.workflow(workflowId) + '/edit'"
        >
          Edit Workflow
        </UButton>
        <UButton 
          color="error" 
          variant="outline" 
          size="lg"
          @click="showArchiveModal = true"
        >
          {{ isArchived ? 'Unarchive' : 'Archive' }}
        </UButton>
      </div>
    </div>

    <WorkflowsWorkflowDetail :workflow-id="workflowId" @workflow-loaded="handleWorkflowLoaded" />

    <!-- Archive Confirmation Modal -->
    <AppConfirmationModal
      v-model:open="showArchiveModal"
      :title="isArchived ? 'Unarchive Workflow' : 'Archive Workflow'"
      :description="isArchived ? 'Are you sure you want to unarchive this workflow?' : 'Are you sure you want to archive this workflow? It will no longer be available for new requests.'"
      :confirm-label="isArchived ? 'Unarchive' : 'Archive'"
      confirm-color="error"
      :require-comment="true"
      :comment-placeholder="isArchived ? 'Reason for unarchiving...' : 'Reason for archiving...'"
      :loading="archiving"
      @confirm="handleArchive"
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
const workflowId = route.params.id as string
const workflowName = ref('Workflow')
const isArchived = ref(false)
const archiving = ref(false)
const showArchiveModal = ref(false)

function handleWorkflowLoaded(workflow: any) {
  workflowName.value = workflow.name
  isArchived.value = workflow.isArchived || false
}

const { archiveWorkflow } = useWorkflowsApi()

async function handleArchive(comment?: string) {
  archiving.value = true
  
  try {
    await archiveWorkflow(workflowId)
    
    showArchiveModal.value = false
    
    // Show success message
    // TODO: Add toast notification with comment
    
    // Navigate back to workflows list
    await navigateTo(routes.workflows)
  } catch (error) {
    console.error('Error archiving workflow:', error)
    // TODO: Show error message
  } finally {
    archiving.value = false
  }
}
</script>
