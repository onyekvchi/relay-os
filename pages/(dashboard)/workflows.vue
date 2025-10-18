<script setup lang="ts">
definePageMeta({
  middleware: 'dashboard',
  layout: 'dashboard'
});
</script>

<template>
  <PageHeader title="Workflows">
    <UButton size="lg" label="New Workflow" />
  </PageHeader>

  <WorkflowsData />
</template>
