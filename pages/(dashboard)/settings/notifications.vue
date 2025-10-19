<template>
  <div class="space-y-6">
    <SettingsHeader 
      title="Notifications" 
      description="Manage how you receive notifications and updates" 
    />
    <PagePlaceholder />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'dashboard',
  layout: 'settings'
});
</script>
