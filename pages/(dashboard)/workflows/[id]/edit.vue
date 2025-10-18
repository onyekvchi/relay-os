<template>
  <div class="flex items-center h-10">
    <UBreadcrumb :items="[
      { label: 'Workflows', to: routes.workflows }, 
      { label: 'Edit Workflow' }
    ]"></UBreadcrumb>
  </div>

  <WorkflowsEditWorkflowForm :workflow-id="workflowId" />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'dashboard',
  layout: 'dashboard'
});

import { routes } from "@/routes"

const route = useRoute()
const workflowId = route.params.id as string
</script>
