<script setup lang="ts">
definePageMeta({
  middleware: 'dashboard',
  layout: 'dashboard'
});

import { routes } from "@/routes"
</script>

<template>
  <PageHeader title="Workflows">
    <UButton size="lg" label="New Workflow" :to="routes.newWorkflow" />
  </PageHeader>

  <WorkflowsData />
</template>
