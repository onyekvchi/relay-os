<template>
  <div class="space-y-8">
    <div class="mb-6 flex items-center justify-between h-10">
      <UBreadcrumb :items="[{ label: 'Requests', to: '/requests' }, { label: `Request #${requestId}` }]"></UBreadcrumb>
      <div class="flex items-center gap-4">
        <UButton color="primary" size="lg">Approve</UButton>
        <UButton color="neutral" variant="outline" size="lg">Request changes</UButton>
        <UButton color="error" variant="outline" size="lg">Reject</UButton>
      </div>
    </div>

    <RequestsRequestDetail :request-id="requestId" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'dashboard',
  layout: 'dashboard'
});

const route = useRoute()
const requestId = route.params.id as string
</script>

