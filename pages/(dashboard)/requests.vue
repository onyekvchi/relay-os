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
  
  
  <!-- Table Empty state -->
  <!-- Table Loading state -->
  <!-- Table Data state -->
  <!-- Table Filtering state -->

  <PagePlaceholder />
</template>
