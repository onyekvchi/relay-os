<script setup lang="ts">
definePageMeta({
  middleware: 'dashboard',
  layout: 'dashboard'
});
</script>

<template>
  <PageHeader title="Requests">
    <UButton size="lg" label="New Request" />
  </PageHeader>

  <RequestsData />
</template>
