<template>
  <header class="bg-white border-b border-muted">
    <div class="container mx-auto px-4 py-2 flex justify-between items-center">
      <div class="flex gap-6 items-center">
        <h1 class="text-sm font-semibold font-mono tracking-tighter py-2 px-4 bg-primary text-inverted">relay-os</h1>
        <UNavigationMenu orientation="horizontal" :items="navigationItems":ui="{
          list: 'gap-3',
          link: 'px-3 py-2 text-sm gap-4',
          linkLeadingIcon: 'size-4'
        }" />
      </div>

      <UDropdownMenu :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
        <UButton variant="ghost" class="justify-end border border-default rounded-md p-2 hover:bg-elevated/50">
          <div class="flex gap-2 items-center text-left min-w-0 overflow-hidden">
            <UAvatar :text="userInitials" size="xs"></UAvatar>
            <p class="text-xs font-normal opacity-75 truncate leading-tight text-muted">
              {{ userFirstName }}
            </p>
          </div>
          <UIcon name="i-heroicons-chevron-up-down" class="shrink-0 ml-1" />
        </UButton>
      </UDropdownMenu>
    </div>
  </header>
</template>

<script setup lang="ts">
import { routes } from "@/routes";
const { getUser, clearAuth } = useAuthStore();

const handleLogout = async () => {
  clearAuth();
  await navigateTo(routes.signIn);
};

const userFirstName = computed(() => {
  return getUser?.name
})

const userInitials = computed(() => {
  return userFirstName.value?.substring(0, 1)
})

const navigationItems = computed(() => {
  const { path } = useRoute()

  return [
    {
      label: "Requests",
      to: "requests",
      icon: "",
      active: path.startsWith("/requests"),
    },
    {
      label: "Workflows",
      to: "workflows",
      icon: "",
      active: path.startsWith("/workflows"),
    },
    {
      label: "Metrics",
      to: "metrics",
      icon: "",
      active: path.startsWith("/metrics"),
    },
    {
      label: "Settings",
      to: "settings",
      icon: "",
      active: path.startsWith("/settings"),
    }
  ]
})

const userMenuItems = [
  [{
    label: 'Log out',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    onSelect: handleLogout
  }]
]
</script>