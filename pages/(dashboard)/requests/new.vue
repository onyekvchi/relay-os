<template>
  <div class="flex items-center h-10">
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
