<template>
  <div class="space-y-6">
    <SettingsHeader 
      title="Security" 
      description="Manage your password and security settings" 
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
