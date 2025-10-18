<template>
  <div class="flex items-center h-10">
    <UBreadcrumb :items="[{ label: 'Workflows', to: routes.workflows }, { label: 'New Workflow' }]"></UBreadcrumb>
  </div>

  <WorkflowsNewWorkflowForm />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'dashboard',
  layout: 'dashboard'
});

import { routes } from "@/routes"
</script>
