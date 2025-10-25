<script setup lang="ts">
definePageMeta({
  middleware: 'dashboard',
  layout: 'dashboard'
});

import { routes } from "@/routes"

const { canManageWorkflows } = usePermissions()
</script>

<template>
  <PageHeader title="Workflows">
    <UButton v-if="canManageWorkflows" size="lg" label="New Workflow" :to="routes.newWorkflow" />
  </PageHeader>

  <WorkflowsData />
</template>
