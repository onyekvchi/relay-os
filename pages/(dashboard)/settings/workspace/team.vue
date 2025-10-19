<template>
  <div class="space-y-6">
    <SettingsHeader 
      title="Team Management" 
      description="Manage team members, roles, and permissions" 
    />
    <PagePlaceholder />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'settings',
  middleware: 'dashboard'
});
</script>
