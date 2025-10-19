<template>
  <div class="space-y-6">
    <SettingsHeader 
      title="Profile" 
      description="Manage your personal information and profile settings" 
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
