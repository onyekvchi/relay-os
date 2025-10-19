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
import { routes } from '~/routes'

const items: NavigationMenuItem[][] = [
  [
    {
      label: 'Account',
      type: 'label'
    },
    {
      label: 'Profile',
      to: routes.settings.profile
    },
    // {
    //   label: 'Preferences',
    //   to: routes.settings.preferences
    // },
    // {
    //   label: 'Notifications',
    //   to: routes.settings.notifications
    // },
    {
      label: 'Security',
      to: routes.settings.security
    }
  ],
  [
    {
      label: 'Workspace',
      type: 'label'
    },
    {
      label: 'General',
      to: routes.settings.workspace.general
    },
    {
      label: 'Team',
      to: routes.settings.workspace.team
    }
  ]
]
</script>
