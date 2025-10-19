<template>
  <div class="space-y-6">
    <SettingsHeader 
      title="General" 
      description="Manage general workspace settings and configurations" 
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
