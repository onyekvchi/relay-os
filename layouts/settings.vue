<template>
  <NuxtLayout name="dashboard">
    <div class="flex gap-16 min-h-[calc(100vh-200px)]">
      <div class="w-48">
        <h1 class="text-2xl font-semibold mb-6">Settings</h1>
        <SettingsSidebar />
      </div>

      <div class="flex-1 max-w-4xl">
        <slot />
      </div>
    </div>
  </NuxtLayout>
</template>

