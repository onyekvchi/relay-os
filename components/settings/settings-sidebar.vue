<template>
  <UNavigationMenu
    :ui="{
      link: 'before:rounded-none',
    }"
    class="-ml-2"
    orientation="vertical" 
    :items="items"
  />
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: NavigationMenuItem[][] = [
  [
    {
      label: 'Account',
      type: 'label'
    },
    {
      label: 'Profile',
      to: '/settings/profile'
    },
    {
      label: 'Preferences',
      to: '/settings/preferences'
    },
    {
      label: 'Notifications',
      to: '/settings/notifications'
    },
    {
      label: 'Security',
      to: '/settings/security'
    }
  ],
  [
    {
      label: 'Workspace',
      type: 'label'
    },
    {
      label: 'General',
      to: '/settings/workspace/general'
    },
    {
      label: 'Team',
      to: '/settings/workspace/team'
    }
  ]
]
</script>
