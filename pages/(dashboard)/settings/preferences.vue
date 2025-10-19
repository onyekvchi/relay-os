<template>
  <div class="space-y-6">
    <SettingsHeader 
      title="Preferences" 
      description="Customize your experience and application preferences" 
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
