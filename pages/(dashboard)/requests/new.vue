<template>
  <div class="mb-6 flex items-center bg-muted h-10 p-4">
    <UBreadcrumb :items="[{ label: 'Requests', to: routes.requests }, { label: 'New Request' }]"></UBreadcrumb>
  </div>

  <RequestsNewRequestForm />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'dashboard',
  layout: 'dashboard'
});

import { routes } from "@/routes"
</script>
