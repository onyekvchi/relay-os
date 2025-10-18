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
          @click="handleArchive"
          :loading="archiving"
        >
          {{ isArchived ? 'Unarchive' : 'Archive' }}
        </UButton>
      </div>
    </div>

    <WorkflowsWorkflowDetail :workflow-id="workflowId" @workflow-loaded="handleWorkflowLoaded" />
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

function handleWorkflowLoaded(workflow: any) {
  workflowName.value = workflow.name
  isArchived.value = workflow.archived || false
}

async function handleArchive() {
  archiving.value = true
  
  try {
    // TODO: Implement API call to archive/unarchive workflow
    console.log(isArchived.value ? 'Unarchiving workflow:' : 'Archiving workflow:', workflowId)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    isArchived.value = !isArchived.value
    
    // Show success message
    // TODO: Add toast notification
    
  } catch (error) {
    console.error('Error archiving workflow:', error)
    // TODO: Show error message
  } finally {
    archiving.value = false
  }
}
</script>
