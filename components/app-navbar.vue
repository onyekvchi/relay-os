<template>
  <header class="bg-white border-b border-muted">
    <div class="container mx-auto px-4 py-2 flex justify-between items-center">
      <div class="flex gap-6 items-center">
        <NuxtLink :to="routes.dashboard">
          <h1 class="text-sm font-semibold font-mono tracking-tighter py-2 px-4 bg-primary text-inverted">relay-os</h1>
        </NuxtLink>
        <UNavigationMenu orientation="horizontal" :items="navigationItems":ui="{
          list: 'gap-3',
          link: 'px-3 py-2 text-sm gap-4 before:rounded-none',
          linkLeadingIcon: 'size-4',
          childLink: 'before:rounded-none'
        }" />
      </div>

      <UDropdownMenu :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
        <UButton variant="ghost" class="justify-end border border-default rounded-md p-2 hover:bg-elevated/50">
          <div class="flex gap-2 items-center text-left min-w-0 overflow-hidden">
            <UAvatar :text="userInitials" size="xs"></UAvatar>
            <p class="text-xs font-normal truncate leading-tight text-muted">
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
      label: "Dashboard",
      to: routes.dashboard,
      icon: "",
      active: path.startsWith(routes.dashboard),
    },
    {
      label: "Requests",
      to: routes.requests,
      icon: "",
      active: path.startsWith(routes.requests),
    },
    {
      label: "Workflows",
      to: routes.workflows,
      icon: "",
      active: path.startsWith(routes.workflows),
    },
    // {
    //   label: "Metrics",
    //   to: routes.metrics,
    //   icon: "",
    //   active: path.startsWith(routes.metrics),
    // },
    {
      label: "Settings",
      to: routes.settings.index,
      icon: "",
      active: path.startsWith(routes.settings.index),
    }
  ]
})

const userMenuItems = [
  [{
    label: 'Log out',
    onSelect: handleLogout
  }]
]
</script>